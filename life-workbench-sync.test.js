const test = require("node:test");
const assert = require("node:assert/strict");

const {
  SyncConflictError,
  createSyncClient,
  decideInitialSync,
  hasMeaningfulState,
  mergeCloudStates,
  stateForCloud,
  stableStringify,
  validateCloudRow
} = require("./life-workbench-sync.js");

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

test("hasMeaningfulState ignores defaults but detects saved life data", () => {
  assert.equal(hasMeaningfulState({ filter: "全部", tasks: [], notes: {} }), false);
  assert.equal(hasMeaningfulState({ filter: "全部", tasks: [{ id: "task-1" }], notes: {} }), true);
  assert.equal(hasMeaningfulState({ tasks: [], gratitude: { "2026-08-02": { text: "谢谢今天" } } }), true);
  assert.equal(hasMeaningfulState({ tasks: [], mealRecords: { "2026-08-03": { breakfast: "鸡蛋" } } }), true);
  assert.equal(hasMeaningfulState({ thoughts: [{ id: "letter-1", body: "写给自己的信" }] }), true);
  assert.equal(hasMeaningfulState({ maintenance: [{ id: "maintenance-1", title: "拖地", completions: ["2026-08-05"] }] }), true);
  assert.equal(hasMeaningfulState({ visions: [{ id: "vision-1", title: "去看极光" }] }), true);
  assert.equal(hasMeaningfulState({ strengths: [{ id: "strength-1", title: "有韧性" }] }), true);
  assert.equal(hasMeaningfulState({ appearance: { theme: "mist-rose" } }), false);
  assert.equal(hasMeaningfulState({ appearance: { theme: "pine" } }), false);
});

test("mergeCloudStates keeps visions and strengths from both devices", () => {
  const merged = mergeCloudStates(
    {
      visions: [{ id: "vision-local", title: "本机愿景", updatedAt: "2026-08-19T10:00:00.000Z" }],
      strengths: [{ id: "strength-local", title: "本机优点", updatedAt: "2026-08-19T10:00:00.000Z" }]
    },
    {
      visions: [{ id: "vision-cloud", title: "云端愿景", updatedAt: "2026-08-18T10:00:00.000Z" }],
      strengths: [{ id: "strength-cloud", title: "云端优点", updatedAt: "2026-08-18T10:00:00.000Z" }]
    }
  );
  assert.deepEqual(merged.visions.map((item) => item.id).sort(), ["vision-cloud", "vision-local"]);
  assert.deepEqual(merged.strengths.map((item) => item.id).sort(), ["strength-cloud", "strength-local"]);
});

test("reading books are meaningful data and merge across devices", () => {
  assert.equal(hasMeaningfulState({ readingBooks: [{ id: "book-1", title: "活着", date: "2026-08-19" }] }), true);
  const merged = mergeCloudStates(
    { readingBooks: [{ id: "book-local", title: "活着", date: "2026-08-19", updatedAt: "2026-08-19T10:00:00.000Z" }] },
    { readingBooks: [{ id: "book-cloud", title: "月亮与六便士", date: "2026-07-12", updatedAt: "2026-08-18T10:00:00.000Z" }] }
  );
  assert.deepEqual(merged.readingBooks.map((item) => item.id).sort(), ["book-cloud", "book-local"]);
});

test("media watchlist records are meaningful and merge across devices", () => {
  const local = { mediaItems: [{ id: "media-local", title: "本机动漫", type: "anime", season: 1, episode: 6, updatedAt: "2026-08-31T08:00:00.000Z" }] };
  const cloud = { mediaItems: [{ id: "media-cloud", title: "云端电影", type: "movie", completed: true, archived: true, updatedAt: "2026-08-31T09:00:00.000Z" }] };
  assert.equal(hasMeaningfulState(local), true);
  assert.deepEqual(mergeCloudStates(local, cloud).mediaItems.map((item) => item.id), ["media-cloud", "media-local"]);
});

test("stateForCloud excludes device-only appearance preferences", () => {
  const localState = {
    tasks: [{ id: "task-1", title: "计划" }],
    appearance: { theme: "mint-chocolate" },
    gratitude: { "2026-08-03": { text: "谢谢今天" } }
  };

  assert.deepEqual(stateForCloud(localState), {
    tasks: [{ id: "task-1", title: "计划" }],
    gratitude: { "2026-08-03": { text: "谢谢今天" } }
  });
  assert.deepEqual(localState.appearance, { theme: "mint-chocolate" });
});

test("mergeCloudStates keeps unrelated records created on two devices", () => {
  const local = {
    appearance: { theme: "burgundy" },
    tasks: [{ id: "local-task", title: "本机计划" }],
    gratitude: { "2026-08-11": { text: "本机记录", updatedAt: "2026-08-11T08:00:00.000Z" } }
  };
  const cloud = {
    tasks: [{ id: "cloud-task", title: "云端计划" }],
    gratitude: { "2026-08-10": { text: "云端记录", updatedAt: "2026-08-10T08:00:00.000Z" } }
  };

  assert.deepEqual(mergeCloudStates(local, cloud), {
    appearance: { theme: "burgundy" },
    tasks: [
      { id: "cloud-task", title: "云端计划" },
      { id: "local-task", title: "本机计划" }
    ],
    gratitude: {
      "2026-08-10": { text: "云端记录", updatedAt: "2026-08-10T08:00:00.000Z" },
      "2026-08-11": { text: "本机记录", updatedAt: "2026-08-11T08:00:00.000Z" }
    }
  });
});

test("mergeCloudStates keeps finance records identified by their import key", () => {
  const merged = mergeCloudStates(
    { financeRecords: [{ key: "row:2026-08-12|35|餐饮|午餐|expense", amount: 35, date: "2026-08-12" }] },
    { financeRecords: [{ key: "row:2026-08-11|8|交通|地铁|expense", amount: 8, date: "2026-08-11" }] }
  );

  assert.deepEqual(merged.financeRecords.map((record) => record.key), [
    "row:2026-08-11|8|交通|地铁|expense",
    "row:2026-08-12|35|餐饮|午餐|expense"
  ]);
});

test("mergeCloudStates keeps the newer version when the same dated record conflicts", () => {
  const merged = mergeCloudStates(
    { wellbeing: { "2026-08-11": { mood: 2, updatedAt: "2026-08-11T08:00:00.000Z" } } },
    { wellbeing: { "2026-08-11": { mood: 4, updatedAt: "2026-08-11T09:00:00.000Z" } } }
  );

  assert.equal(merged.wellbeing["2026-08-11"].mood, 4);
});

test("mergeCloudStates keeps a locally deleted record deleted after merging", () => {
  const merged = mergeCloudStates(
    { tasks: [], deletedRecords: { tasks: { "task-1": "2026-08-11T10:00:00.000Z" } } },
    { tasks: [{ id: "task-1", title: "旧计划", updatedAt: "2026-08-11T09:00:00.000Z" }] }
  );

  assert.deepEqual(merged.tasks, []);
  assert.equal(merged.deletedRecords.tasks["task-1"], "2026-08-11T10:00:00.000Z");
});

test("signIn authenticates and fetchState scopes the request to the signed-in user", async () => {
  const calls = [];
  const responses = [
    jsonResponse({
      access_token: "access-token",
      refresh_token: "refresh-token",
      expires_in: 3600,
      user: { id: "user-1", email: "me@example.com" }
    }),
    jsonResponse([{
      user_id: "user-1",
      state: { tasks: [] },
      revision: 3,
      updated_at: "2026-08-02T08:00:00.000Z"
    }])
  ];
  const client = createSyncClient({
    projectUrl: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return responses.shift();
    }
  });

  await client.signIn("me@example.com", "password123");
  const row = await client.fetchState();

  assert.equal(row.revision, 3);
  assert.equal(calls[0].options.headers.Authorization, undefined);
  assert.equal(calls[0].options.headers.apikey, "sb_publishable_test");
  assert.match(calls[1].url, /user_id=eq\.user-1/);
  assert.equal(calls[1].options.headers.Authorization, "Bearer access-token");
  assert.equal(calls[1].options.headers.apikey, "sb_publishable_test");
});

test("persists a session so a refreshed page can restore the signed-in account", async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  const authResponse = () => jsonResponse({
    access_token: "access-token",
    refresh_token: "refresh-token",
    expires_in: 3600,
    user: { id: "user-1", email: "me@example.com" }
  });
  const firstClient = createSyncClient({
    projectUrl: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
    fetchImpl: async () => authResponse(),
    storage
  });

  await firstClient.signIn("me@example.com", "password123");
  const refreshedClient = createSyncClient({
    projectUrl: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
    fetchImpl: async () => authResponse(),
    storage
  });

  assert.deepEqual(refreshedClient.getSession(), { user: { id: "user-1", email: "me@example.com" } });
  refreshedClient.signOut();
  const loggedOutClient = createSyncClient({
    projectUrl: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
    fetchImpl: async () => authResponse(),
    storage
  });
  assert.equal(loggedOutClient.getSession(), null);
});

test("signUp accepts confirmation-required responses returned as a direct user object", async () => {
  const client = createSyncClient({
    projectUrl: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
    fetchImpl: async () => jsonResponse({
      id: "user-2",
      email: "new@example.com"
    })
  });

  const result = await client.signUp("new@example.com", "password123");

  assert.deepEqual(result, {
    user: { id: "user-2", email: "new@example.com" },
    needsConfirmation: true
  });
});

test("rate limits explain the wait and cooldown next step", async () => {
  const client = createSyncClient({
    projectUrl: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
    fetchImpl: async () => jsonResponse({ message: "rate limit" }, 429)
  });

  await assert.rejects(
    () => client.signUp("new@example.com", "password123"),
    /10-15 分钟.*冷却结束/
  );
});

test("updateState reports a conflict when the expected revision no longer matches", async () => {
  const responses = [
    jsonResponse({
      access_token: "access-token",
      refresh_token: "refresh-token",
      expires_in: 3600,
      user: { id: "user-1", email: "me@example.com" }
    }),
    jsonResponse([])
  ];
  const client = createSyncClient({
    projectUrl: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
    fetchImpl: async () => responses.shift()
  });

  await client.signIn("me@example.com", "password123");

  await assert.rejects(
    () => client.updateState({ tasks: [] }, 4),
    (error) => error instanceof SyncConflictError
  );
});

test("validateCloudRow rejects malformed third-party data", () => {
  assert.throws(
    () => validateCloudRow({ user_id: "user-1", state: [], revision: 1, updated_at: "bad" }),
    /云端数据格式不正确/
  );
});

test("stableStringify treats JSON objects with different key order as equal", () => {
  const local = { tasks: [{ title: "计划", done: false }], notes: { b: "2", a: "1" } };
  const cloud = { notes: { a: "1", b: "2" }, tasks: [{ done: false, title: "计划" }] };
  assert.equal(stableStringify(local), stableStringify(cloud));
});

test("decideInitialSync creates cloud data when the account has no row", () => {
  assert.equal(decideInitialSync({ localState: { tasks: [] }, cloudRow: null, syncMeta: null, userId: "user-1" }), "create-cloud");
});

test("decideInitialSync downloads cloud data when the local workbench is empty", () => {
  const cloudRow = { state: { tasks: [{ id: "cloud" }] }, revision: 2 };
  assert.equal(decideInitialSync({ localState: { tasks: [] }, cloudRow, syncMeta: null, userId: "user-1" }), "use-cloud");
});

test("decideInitialSync keeps cloud data authoritative when both sides share a base revision", () => {
  const cloudRow = { state: { tasks: [{ id: "old" }] }, revision: 4 };
  const localState = { tasks: [{ id: "new" }] };
  const syncMeta = { userId: "user-1", revision: 4 };
  assert.equal(decideInitialSync({ localState, cloudRow, syncMeta, userId: "user-1" }), "use-cloud");
});

test("decideInitialSync keeps cloud data authoritative when unrelated data differs", () => {
  const cloudRow = { state: { tasks: [{ id: "cloud" }] }, revision: 5 };
  const localState = { tasks: [{ id: "local" }] };
  assert.equal(decideInitialSync({ localState, cloudRow, syncMeta: null, userId: "user-1" }), "use-cloud");
});

test("decideInitialSync ignores appearance differences between devices", () => {
  const localState = { tasks: [{ id: "shared" }], appearance: { theme: "mint-chocolate" } };
  const cloudRow = {
    state: { tasks: [{ id: "shared" }], appearance: { theme: "burgundy" } },
    revision: 5
  };

  assert.equal(decideInitialSync({ localState, cloudRow, syncMeta: null, userId: "user-1" }), "use-cloud");
});

test("createState never uploads appearance preferences", async () => {
  const requests = [];
  const responses = [
    jsonResponse({
      access_token: "access-token",
      refresh_token: "refresh-token",
      expires_in: 3600,
      user: { id: "user-1", email: "me@example.com" }
    }),
    jsonResponse([{
      user_id: "user-1",
      state: { tasks: [{ id: "task-1" }] },
      revision: 1,
      updated_at: "2026-08-03T10:00:00.000Z"
    }])
  ];
  const client = createSyncClient({
    projectUrl: "https://example.supabase.co",
    publishableKey: "sb_publishable_test",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return responses.shift();
    }
  });

  await client.signIn("me@example.com", "password123");
  await client.createState({ tasks: [{ id: "task-1" }], appearance: { theme: "pine" } });

  const body = JSON.parse(requests[1].options.body);
  assert.deepEqual(body.state, { tasks: [{ id: "task-1" }] });
});
