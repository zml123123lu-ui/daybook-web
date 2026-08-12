(function initWorkbenchSync(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.WorkbenchSync = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createWorkbenchSyncApi() {
  "use strict";

  class SyncRequestError extends Error {
    constructor(message, status = 0) {
      super(message);
      this.name = "SyncRequestError";
      this.status = status;
    }
  }

  class SyncConflictError extends Error {
    constructor(message = "云端已有较新的数据") {
      super(message);
      this.name = "SyncConflictError";
    }
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function hasMeaningfulState(state) {
    if (!isPlainObject(state)) return false;
    const arrayKeys = ["tasks", "timeBlocks", "habits", "maintenance", "goals", "financeRecords", "thoughts"];
    const recordKeys = ["notes", "dailySummaries", "aiSummaries", "periodSummaries", "wellbeing", "mealRecords", "gratitude"];
    return arrayKeys.some((key) => Array.isArray(state[key]) && state[key].length > 0)
      || recordKeys.some((key) => isPlainObject(state[key]) && Object.keys(state[key]).length > 0);
  }

  function stateForCloud(state) {
    if (!isPlainObject(state)) return {};
    const cloudState = { ...state };
    delete cloudState.appearance;
    return cloudState;
  }

  function recordTime(record) {
    const value = record && typeof record === "object" ? (record.updatedAt || record.createdAt) : "";
    const time = Date.parse(String(value || ""));
    return Number.isFinite(time) ? time : 0;
  }

  function mergeRecords(localRecord, cloudRecord) {
    if (!localRecord) return cloudRecord;
    if (!cloudRecord) return localRecord;
    return recordTime(localRecord) > recordTime(cloudRecord) ? localRecord : cloudRecord;
  }

  function mergeTombstones(localTombstones, cloudTombstones) {
    const local = isPlainObject(localTombstones) ? localTombstones : {};
    const cloud = isPlainObject(cloudTombstones) ? cloudTombstones : {};
    return Object.fromEntries([...new Set([...Object.keys(cloud), ...Object.keys(local)])].map((type) => {
      const localRecords = isPlainObject(local[type]) ? local[type] : {};
      const cloudRecords = isPlainObject(cloud[type]) ? cloud[type] : {};
      const ids = [...new Set([...Object.keys(cloudRecords), ...Object.keys(localRecords)])];
      return [type, Object.fromEntries(ids.map((id) => [id, recordTime({ updatedAt: localRecords[id] }) > recordTime({ updatedAt: cloudRecords[id] }) ? localRecords[id] : cloudRecords[id]]))];
    }));
  }

  function mergeRecordArrays(localItems, cloudItems, tombstones = {}) {
    const localById = new Map((Array.isArray(localItems) ? localItems : [])
      .filter((item) => isPlainObject(item) && (item.id != null || item.key != null))
      .map((item) => [String(item.id ?? item.key), item]));
    const cloudById = new Map((Array.isArray(cloudItems) ? cloudItems : [])
      .filter((item) => isPlainObject(item) && (item.id != null || item.key != null))
      .map((item) => [String(item.id ?? item.key), item]));
    const ids = [...new Set([...cloudById.keys(), ...localById.keys()])];
    return ids
      .map((id) => mergeRecords(localById.get(id), cloudById.get(id)))
      .filter((item) => {
        const recordId = String(item.id ?? item.key);
        const deletedAt = tombstones[recordId];
        return !deletedAt || recordTime({ updatedAt: deletedAt }) < recordTime(item);
      });
  }

  function mergeKeyedRecords(localRecords, cloudRecords) {
    const local = isPlainObject(localRecords) ? localRecords : {};
    const cloud = isPlainObject(cloudRecords) ? cloudRecords : {};
    return Object.fromEntries([...new Set([...Object.keys(cloud), ...Object.keys(local)])]
      .map((key) => [key, mergeRecords(local[key], cloud[key])]));
  }

  function mergeCloudStates(localState, cloudState) {
    const local = isPlainObject(localState) ? localState : {};
    const cloud = isPlainObject(cloudState) ? cloudState : {};
    const merged = { ...cloud, ...local };
    const arrayKeys = ["tasks", "timeBlocks", "habits", "maintenance", "goals", "financeRecords", "thoughts"];
    const keyedKeys = ["notes", "dailySummaries", "aiSummaries", "periodSummaries", "wellbeing", "mealRecords", "gratitude"];
    const tombstones = mergeTombstones(local.deletedRecords, cloud.deletedRecords);
    arrayKeys.forEach((key) => {
      if (key in local || key in cloud) merged[key] = mergeRecordArrays(local[key], cloud[key], tombstones[key]);
    });
    if (Object.keys(tombstones).length) merged.deletedRecords = tombstones;
    keyedKeys.forEach((key) => {
      if (key in local || key in cloud) merged[key] = mergeKeyedRecords(local[key], cloud[key]);
    });
    // Appearance is intentionally device-local and never sent to the cloud.
    if (local.appearance) merged.appearance = local.appearance;
    return merged;
  }

  function stableStringify(value) {
    function sortJson(current) {
      if (Array.isArray(current)) return current.map(sortJson);
      if (!isPlainObject(current)) return current;
      return Object.keys(current).sort().reduce((result, key) => {
        result[key] = sortJson(current[key]);
        return result;
      }, {});
    }
    return JSON.stringify(sortJson(value));
  }

  function decideInitialSync({ localState, cloudRow, syncMeta, userId }) {
    if (!cloudRow) return "create-cloud";
    if (stableStringify(stateForCloud(localState)) === stableStringify(stateForCloud(cloudRow.state))) return "use-cloud";
    if (!hasMeaningfulState(localState)) return "use-cloud";
    const sharesBaseRevision = isPlainObject(syncMeta)
      && syncMeta.userId === userId
      && syncMeta.revision === cloudRow.revision;
    return sharesBaseRevision ? "push-local" : "conflict";
  }

  function validateCloudRow(row) {
    const valid = isPlainObject(row)
      && typeof row.user_id === "string"
      && row.user_id.length > 0
      && isPlainObject(row.state)
      && Number.isInteger(row.revision)
      && row.revision > 0
      && typeof row.updated_at === "string"
      && Number.isFinite(Date.parse(row.updated_at));
    if (!valid) throw new SyncRequestError("云端数据格式不正确");
    return {
      userId: row.user_id,
      state: row.state,
      revision: row.revision,
      updatedAt: row.updated_at
    };
  }

  const SESSION_STORAGE_KEY = "life-workbench-auth-v1";

  function getStorage(storage) {
    if (storage) return storage;
    try {
      return globalThis.localStorage || null;
    } catch {
      return null;
    }
  }

  function createSyncClient({ projectUrl, publishableKey, fetchImpl = globalThis.fetch, storage = null }) {
    const baseUrl = String(projectUrl || "").replace(/\/+$/, "");
    const apiKey = String(publishableKey || "").trim();
    const sessionStorage = getStorage(storage);
    if (!/^https:\/\/[^/]+\.supabase\.co$/.test(baseUrl)) throw new Error("Supabase 项目地址不正确");
    if (!apiKey.startsWith("sb_publishable_")) throw new Error("Supabase 公开连接钥匙不正确");
    if (typeof fetchImpl !== "function") throw new Error("当前浏览器不支持云端同步");

    let session = null;

    function persistSession() {
      if (!sessionStorage || !session) return;
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // Storage may be blocked in private browsing; memory-only sync still works.
      }
    }

    function clearPersistedSession() {
      if (!sessionStorage) return;
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // Ignore cleanup failures; the in-memory session is still cleared.
      }
    }

    function restoreSession() {
      if (!sessionStorage) return null;
      try {
        const parsed = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || "null");
        if (!isPlainObject(parsed)
          || typeof parsed.accessToken !== "string"
          || typeof parsed.refreshToken !== "string"
          || !Number.isFinite(parsed.expiresAt)
          || !isPlainObject(parsed.user)
          || typeof parsed.user.id !== "string") return null;
        return {
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
          expiresAt: parsed.expiresAt,
          user: {
            id: parsed.user.id,
            email: typeof parsed.user.email === "string" ? parsed.user.email : ""
          }
        };
      } catch {
        clearPersistedSession();
        return null;
      }
    }

    async function readJson(response) {
      const text = await response.text();
      let body = null;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          throw new SyncRequestError("云端返回了无法识别的数据", response.status);
        }
      }
      if (!response.ok) {
        const message = response.status === 401
          ? "登录已失效，请重新登录"
          : response.status === 429
            ? "操作太频繁。请先停 10-15 分钟，不要继续点；等冷却结束后再注册或登录。"
            : (body?.msg || body?.message || body?.error_description || "云端连接失败");
        throw new SyncRequestError(message, response.status);
      }
      return body;
    }

    function publicHeaders() {
      return {
        apikey: apiKey,
        "Content-Type": "application/json"
      };
    }

    function authHeaders(token) {
      return { ...publicHeaders(), Authorization: `Bearer ${token}` };
    }

    function setSession(body) {
      if (!isPlainObject(body) || typeof body.access_token !== "string" || !isPlainObject(body.user) || typeof body.user.id !== "string") {
        throw new SyncRequestError("登录响应格式不正确");
      }
      session = {
        accessToken: body.access_token,
        refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : "",
        expiresAt: Date.now() + Math.max(60, Number(body.expires_in) || 3600) * 1000,
        user: {
          id: body.user.id,
          email: typeof body.user.email === "string" ? body.user.email : ""
        }
      };
      persistSession();
      return { ...session.user };
    }

    async function signIn(email, password) {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new SyncRequestError("请输入正确的邮箱");
      if (String(password || "").length < 6) throw new SyncRequestError("密码至少需要 6 位");
      const response = await fetchImpl(`${baseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: publicHeaders(),
        body: JSON.stringify({ email: normalizedEmail, password: String(password) })
      });
      return setSession(await readJson(response));
    }

    async function signUp(email, password) {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new SyncRequestError("请输入正确的邮箱");
      if (String(password || "").length < 6) throw new SyncRequestError("密码至少需要 6 位");
      const response = await fetchImpl(`${baseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: publicHeaders(),
        body: JSON.stringify({ email: normalizedEmail, password: String(password) })
      });
      const body = await readJson(response);
      if (body?.access_token) return { user: setSession(body), needsConfirmation: false };
      const user = isPlainObject(body?.user) ? body.user : body;
      if (!isPlainObject(user) || typeof user.id !== "string") throw new SyncRequestError("注册响应格式不正确");
      return { user: { id: user.id, email: user.email || normalizedEmail }, needsConfirmation: true };
    }

    async function refreshSession() {
      if (!session?.refreshToken) throw new SyncRequestError("登录已失效，请重新登录", 401);
      const response = await fetchImpl(`${baseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: publicHeaders(),
        body: JSON.stringify({ refresh_token: session.refreshToken })
      });
      setSession(await readJson(response));
    }

    async function authenticatedFetch(url, options = {}, canRetry = true) {
      if (!session) throw new SyncRequestError("请先登录云端同步", 401);
      if (Date.now() >= session.expiresAt - 60000) await refreshSession();
      const response = await fetchImpl(url, {
        ...options,
        headers: { ...authHeaders(session.accessToken), ...(options.headers || {}) }
      });
      if (response.status === 401 && canRetry && session.refreshToken) {
        await refreshSession();
        return authenticatedFetch(url, options, false);
      }
      return response;
    }

    async function fetchState() {
      if (!session) throw new SyncRequestError("请先登录云端同步", 401);
      const query = new URLSearchParams({
        select: "user_id,state,revision,updated_at",
        user_id: `eq.${session.user.id}`,
        limit: "1"
      });
      const response = await authenticatedFetch(`${baseUrl}/rest/v1/workbench_state?${query}`);
      const rows = await readJson(response);
      if (!Array.isArray(rows)) throw new SyncRequestError("云端数据格式不正确");
      return rows.length ? validateCloudRow(rows[0]) : null;
    }

    async function createState(state) {
      if (!isPlainObject(state)) throw new SyncRequestError("本机数据格式不正确");
      const response = await authenticatedFetch(`${baseUrl}/rest/v1/workbench_state`, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ user_id: session.user.id, state: stateForCloud(state), revision: 1, updated_at: new Date().toISOString() })
      });
      const rows = await readJson(response);
      if (!Array.isArray(rows) || rows.length !== 1) throw new SyncRequestError("无法创建云端数据");
      return validateCloudRow(rows[0]);
    }

    async function updateState(state, expectedRevision) {
      if (!isPlainObject(state)) throw new SyncRequestError("本机数据格式不正确");
      const revision = Number(expectedRevision);
      if (!Number.isInteger(revision) || revision < 1) throw new SyncRequestError("同步版本不正确");
      const query = new URLSearchParams({
        user_id: `eq.${session.user.id}`,
        revision: `eq.${revision}`
      });
      const response = await authenticatedFetch(`${baseUrl}/rest/v1/workbench_state?${query}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ state: stateForCloud(state), revision: revision + 1, updated_at: new Date().toISOString() })
      });
      const rows = await readJson(response);
      if (!Array.isArray(rows)) throw new SyncRequestError("云端数据格式不正确");
      if (!rows.length) throw new SyncConflictError();
      return validateCloudRow(rows[0]);
    }

    session = restoreSession();

    function getSession() {
      return session ? { user: { ...session.user } } : null;
    }

    function signOut() {
      session = null;
      clearPersistedSession();
    }

    return { createState, fetchState, getSession, signIn, signOut, signUp, updateState };
  }

  return {
    SyncConflictError,
    SyncRequestError,
    createSyncClient,
    decideInitialSync,
    hasMeaningfulState,
    mergeCloudStates,
    stateForCloud,
    stableStringify,
    validateCloudRow
  };
});
