const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");

const files = ["outputs/index.html"];

function read(file) {
  return fs.readFileSync(file, "utf8");
}

test("published workbench includes its referenced sync runtime", () => {
  assert.ok(fs.existsSync("outputs/life-workbench-sync.js"));
  assert.match(read("outputs/index.html"), /src="\.\/life-workbench-sync\.js"/);
});

test("published workbench keeps mobile controls compact and routes review edits back to the selected day", () => {
  const html = read("outputs/index.html");
  assert.match(html, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[\s\S]*?\.today-glance \.metric/);
  assert.match(html, /id="reviewEditDayBtn"[\s\S]*?data-action="edit-review-date"/);
  assert.match(html, /if \(action === "edit-review-date"\) \{[\s\S]*?activeDate = target\.dataset\.date \|\| reviewDate;[\s\S]*?setView\("today", true\)/);
});

test("published workbench has no inert legacy application payload", () => {
  assert.doesNotMatch(read("outputs/index.html"), /id="legacyScript"/);
});

test("published workbench keeps visions separate from current life directions", () => {
  const html = read("outputs/index.html");
  assert.match(html, /data-view="visions"[^>]*aria-label="愿景"/);
  assert.match(html, /id="visions" data-panel="visions"/);
  assert.match(html, /id="addVisionBtn"/);
  assert.match(html, /function normalizeVision\(/);
  assert.match(html, /visions: Array\.isArray\(source\.visions\)/);
  assert.match(html, /还不能开始|等待条件|可以准备/);
  assert.match(html, /半年[\s\S]*?一年[\s\S]*?三年[\s\S]*?五年[\s\S]*?不限时/);
});

test("published workbench provides a monthly and yearly reading log without seed data", () => {
  const html = read("outputs/index.html");
  assert.match(html, /data-view="reading"[^>]*aria-label="阅读"/);
  assert.match(html, /id="reading" data-panel="reading"/);
  assert.match(html, /id="readingForm"/);
  assert.match(html, /data-reading-period="month"/);
  assert.match(html, /data-reading-period="year"/);
  assert.match(html, /function readingBooksForMonth\(/);
  assert.match(html, /function readingBooksForYear\(/);
  assert.match(html, /readingBooks: \[\]/);
  assert.match(html, /readingBooks: Array\.isArray\(source\.readingBooks\)/);
  assert.match(html, /if \(view === "reading" && date\)[\s\S]*?readingAnchor = date\.slice\(0, 7\)/);
  assert.match(html, /state\.readingBooks\.some\(\(book\) => book\.date === key\)/);
  assert.match(html, /id="readingYearInsight"/);
  assert.match(html, /\$\("#readingYearInsight"\)\.textContent/);
  assert.match(html, /@media \(max-width: 820px\) \{[\s\S]*?\.reading-form \{ grid-template-columns: 1fr; \}/);
});

test("published workbench provides a media watchlist with progress and archived completed items", () => {
  const html = read("outputs/index.html");
  assert.match(html, /data-view="media"[^>]*aria-label="影视清单"/);
  assert.match(html, /id="media" data-panel="media"/);
  assert.match(html, /id="mediaForm"/);
  assert.match(html, /role="tablist"[^>]*aria-label="影视类型"/);
  for (const type of ["movie", "series", "anime", "variety"]) {
    assert.match(html, new RegExp(`data-media-type="${type}"`));
  }
  assert.match(html, /name="type"[\s\S]*电影[\s\S]*电视剧[\s\S]*动漫[\s\S]*综艺/);
  assert.match(html, /name="season"/);
  assert.match(html, /name="episode"/);
  assert.match(html, /id="mediaWatchingList"/);
  assert.match(html, /id="mediaCompletedList"/);
  for (const type of ["movie", "series", "anime", "variety"]) {
    assert.match(html, new RegExp(`id="mediaWatching${type[0].toUpperCase()}${type.slice(1)}List"`));
    assert.match(html, new RegExp(`id="mediaCompleted${type[0].toUpperCase()}${type.slice(1)}List"`));
  }
  assert.match(html, /data-action="media-complete"/);
  assert.match(html, /mediaItems: \[\]/);
  assert.match(html, /mediaItems: Array\.isArray\(source\.mediaItems\)/);
  assert.match(html, /function normalizeMediaItem\(/);
  assert.match(html, /function renderMedia\(/);
});

test("published workbench keeps dated forms inside mobile panels and stores detailed reading records", () => {
  const html = read("outputs/index.html");
  assert.match(html, /\.field \{[\s\S]*?min-width: 0;[\s\S]*?\}/);
  assert.match(html, /id="maintenanceLogDate" type="date"/);
  assert.match(html, /id="financeEntryDate" name="date" type="date"/);
  assert.match(html, /id="wellbeingDate" name="date" type="date"/);
  assert.match(html, /id="strengthDate" name="date" type="date"/);
  assert.match(html, /id="readingStartDate" name="startDate" type="date"/);
  assert.match(html, /id="readingEndDate" name="endDate" type="date"/);
  assert.match(html, /id="readingDuration" name="duration" type="number"/);
  assert.match(html, /id="readingMedium" name="medium"[\s\S]*?实体书[\s\S]*?电子书/);
  assert.match(html, /const startDate[\s\S]*?source\.startDate/);
  assert.match(html, /const endDate[\s\S]*?source\.endDate/);
  assert.match(html, /duration: Math\.max[\s\S]*?source\.duration/);
  assert.match(html, /medium: \["paper", "ebook"\]/);
  assert.match(html, /grid-template-columns: repeat\(auto-fill, minmax\(9rem, 1fr\)\)/);
  assert.match(html, /\.reading-entry \{[\s\S]*?aspect-ratio: 1/);
});

test("local workbench integrates a focused daily overview without duplicating records", () => {
  const html = read("outputs/index.html");
  assert.match(html, /id="todayActionOverview"/);
  assert.match(html, /function renderTodayActionOverview\(/);
  assert.match(html, /data-action="open-overview-view"/);
  assert.match(html, /id="mobileNav"/);
  assert.match(html, /data-action="mobile-more"/);
  assert.match(html, /@media \(max-width: 820px\)[\s\S]*?\.mobile-nav/);
});

test("local workbench keeps maintenance focused and puts wellbeing trends after meals", () => {
  const html = read("outputs/index.html");
  assert.doesNotMatch(html, /id="maintenanceHeatmap"/);
  assert.doesNotMatch(html, /function renderMaintenanceHeatmap\(/);
  assert.match(html, /id="hydrationAmount"/);
  assert.match(html, /data-hydration-delta="250"/);
  assert.match(html, /id="hydrationTrend"/);
  assert.match(html, /hydration: source\.hydration/);
  assert.match(html, /id="wellbeingTrend"/);
  assert.match(html, /data-wellbeing-range="7"/);
  assert.match(html, /data-wellbeing-range="30"/);
  assert.match(html, /data-wellbeing-range="90"/);
  assert.match(html, /function renderWellbeingTrend\(/);
  assert.match(html, /id="mealSectionTitle"[\s\S]*?id="wellbeingTrendTitle"/);
});

test("published workbench includes a three-day shopping cooling-off view", () => {
  const html = read("outputs/index.html");
  assert.match(html, /data-view="shopping"[^>]*aria-label="购物冷静室"/);
  assert.match(html, /id="shopping" data-panel="shopping"/);
  assert.match(html, /id="shoppingForm"/);
  assert.match(html, /id="shoppingList"/);
  assert.match(html, /shoppingItems: \[\]/);
  assert.match(html, /shoppingItems: Array\.isArray\(source\.shoppingItems\)/);
  assert.match(html, /冷静期 3 天/);
  assert.match(html, /data-action="shopping-buy"/);
  assert.match(html, /data-action="shopping-archive"/);
  assert.match(html, /data-action="shopping-extend"/);
  assert.match(html, /function shoppingCoolingStatus\(/);
  assert.match(html, /function normalizeShoppingItem\(/);
});

test("published workbench places shopping immediately below money in navigation", () => {
  const html = read("outputs/index.html");
  const nav = html.match(/<nav class="nav">[\s\S]*?<\/nav>/)?.[0] || "";
  assert.ok(nav.indexOf('data-view="money"') < nav.indexOf('data-view="shopping"'));
  const mobileMore = html.match(/<div class="mobile-more-menu"[\s\S]*?<\/div>/)?.[0] || "";
  assert.ok(mobileMore.indexOf('data-view-target="money"') < mobileMore.indexOf('data-view-target="shopping"'));
});

test("published workbench exports a date-scoped analysis package without cloud credentials", () => {
  const html = read("outputs/index.html");
  assert.match(html, /id="exportDailyAnalysisBtn"/);
  assert.match(html, /function buildDailyAnalysisPackage\(/);
  assert.match(html, /\$\("#exportDailyAnalysisBtn"\)\.addEventListener\("click", exportDailyAnalysis\)/);
  assert.match(html, /daily-analysis-package/);
  assert.match(html, /tasksForDate\(date\)/);
  assert.match(html, /state\.financeRecords\.filter\(\(record\) => record\.date === key\)/);
  assert.match(html, /state\.thoughts\.filter\(\(thought\) => thought\.date === key/);
  const builder = html.match(/function buildDailyAnalysisPackage\([\s\S]*?(?=\n      function exportDailyAnalysis)/)?.[0] || "";
  assert.doesNotMatch(builder, /SUPABASE|PASSWORD|TOKEN|SYNC_META_KEY/);
});

test("published workbench records sleep quality and social connection with wellbeing data", () => {
  const html = read("outputs/index.html");
  assert.match(html, /id="sleepQuality"/);
  assert.match(html, /id="sleepRecovery"/);
  assert.match(html, /醒来后的恢复感/);
  assert.match(html, /睡眠质量/);
  assert.match(html, /id="socialConnection"/);
  assert.match(html, /关系与社交/);
  assert.match(html, /sleepQuality: Number\(form\.get\("sleepQuality"\)\)/);
  assert.match(html, /sleepRecovery: Number\(form\.get\("sleepRecovery"\)\)/);
  assert.match(html, /socialConnection: String\(form\.get\("socialConnection"\)/);
  assert.match(html, /睡眠质量/);
  assert.match(html, /关系状态/);
});

test("published workbench keeps wellbeing form values on the selected date after saving", () => {
  const html = read("outputs/index.html");
  assert.match(html, /const date = String\(\$\("#wellbeingDate"\)\.value \|\| form\.get\("date"\) \|\| activeDate \|\| todayKey\(\)\)/);
  assert.match(html, /activeDate = date;[\s\S]*?\$\("#wellbeingDate"\)\.value = date;/);
  assert.match(html, /state\.wellbeing\[date\] = \{[\s\S]*?saveState\(\);[\s\S]*?render\(\);/);
});

test("published workbench defers cloud refresh while a form has unsaved edits", () => {
  const html = read("outputs/index.html");
  assert.match(html, /let unsavedDraft = false/);
  assert.match(html, /document\.addEventListener\("input", \(event\) => \{[\s\S]*?unsavedDraft = true/);
  assert.match(html, /function applyCloudRow\(row\) \{[\s\S]*?if \(unsavedDraft\) \{[\s\S]*?return;/);
  assert.match(html, /async function synchronizeNow\(\) \{[\s\S]*?if \(unsavedDraft\) return false/);
});

test("published workbench clears the draft guard after every saved form", () => {
  const html = read(".publish-worktree/index.html");
  const strength = html.match(/if \(event\.target\.id === "strengthForm"\)[\s\S]*?(?=\n        if \(event\.target\.id === "readingForm")/)?.[0] || "";
  const reading = html.match(/if \(event\.target\.id === "readingForm"\)[\s\S]*?(?=\n        if \(event\.target\.id === "mediaForm")/)?.[0] || "";
  const editor = html.match(/if \(event\.target\.id === "editorForm"\)[\s\S]*?(?=\n      \}\);)/)?.[0] || "";
  assert.match(strength, /unsavedDraft = false;/);
  assert.match(reading, /unsavedDraft = false;/);
  assert.match(editor, /unsavedDraft = false;/);
});

test("published workbench does not rerender wellbeing fields over an active draft", () => {
  const html = read(".publish-worktree/index.html");
  const renderFn = html.match(/function render\(\) \{[\s\S]*?(?=\n      function hasReviewData)/)?.[0] || "";
  assert.match(renderFn, /if \(!unsavedDraft\) renderWellbeing\(\);/);
});

test("published workbench merges local changes before the first cloud sync update", () => {
  const html = read("outputs/index.html");
  assert.match(html, /state = normalizeState\(syncApi\.mergeCloudStates\(state, existing\.state\)\)/);
  assert.match(html, /syncRevision = existing\.revision;[\s\S]*?row = await syncClient\.updateState\(state, syncRevision\)/);
  assert.doesNotMatch(html, /if \(existing\) \{[\s\S]*?applyCloudRow\(existing\);[\s\S]*?return;/);
});

test("published workbench allows editing the daily hydration target", () => {
  const html = read("outputs/index.html");
  assert.match(html, /id="hydrationTarget"/);
  assert.match(html, /data-action="hydration-target"/);
  assert.match(html, /function saveHydrationTarget\(/);
  assert.match(html, /const target = Math\.max\(250, Math\.min\(9999/);
});

test("published workbench renders a three-metric sleep heatmap below sleep entry", () => {
  const html = read("outputs/index.html");
  assert.match(html, /id="sleepHeatmapCard"/);
  assert.match(html, /id="sleepHeatmap"/);
  assert.match(html, /睡眠热力图/);
  assert.match(html, /data-sleep-heatmap-range="7"/);
  assert.match(html, /data-sleep-heatmap-range="30"/);
  assert.match(html, /data-sleep-heatmap-range="90"/);
  assert.match(html, /function renderSleepHeatmap\(/);
  assert.match(html, /sleepHeatmapRange/);
  assert.match(html, /睡眠时长.*睡眠质量.*恢复感/);
  assert.match(html, /const sleepLabel = item\.sleep \? `\$\{escapeHtml\(item\.sleep\)\}h`/);
  assert.match(html, /const qualityLabel = item\.sleepQuality \? `\$\{escapeHtml\(item\.sleepQuality\)\}\/5`/);
  assert.match(html, /const recoveryLabel = item\.sleepRecovery \? `\$\{escapeHtml\(item\.sleepRecovery\)\}\/5`/);
  assert.match(html, /\.sleep-heatmap-bar \{ min-height:1\.1rem/);
});

test("published workbench only treats appearance option buttons as theme changes", () => {
  const html = read("outputs/index.html");
  assert.match(html, /event\.target\.closest\("\.appearance-option\[data-appearance-theme\]"\)/);
  assert.match(html, /const target = event\.target\.closest\("\[data-action\], \[data-filter\], \[data-period\], \[data-habit-period\], \[data-finance-scope\], \[data-strength-period\], \[data-reading-period\]"\)/);
  assert.doesNotMatch(html, /event\.target\.closest\("\[data-action\], \[data-filter\], \[data-period\], \[data-habit-period\], \[data-finance-scope\], \[data-strength-period\], \[data-appearance-theme\]"\)/);
});

test("published workbench does not schedule cloud sync when rendered state has not changed", () => {
  const html = read("outputs/index.html");
  const saveState = html.match(/function saveState\(\{ syncCloud = true \} = \{\}\) \{[\s\S]*?(?=\n      function escapeHtml)/)?.[0] || "";
  assert.match(saveState, /const serialized = JSON\.stringify\(state\);/);
  assert.match(saveState, /const changed = serialized !== lastSavedState;/);
  assert.match(saveState, /if \(!changed\) return true;/);
  assert.match(saveState, /if \(syncCloud && !syncApplying/);
});

test("published workbench does not overwrite a manual-sync error with a success message", () => {
  const html = read("outputs/index.html");
  const synchronize = html.match(/async function synchronizeNow\(\) \{[\s\S]*?(?=\n      function formatDateLabel)/)?.[0] || "";
  assert.match(synchronize, /return true;/);
  assert.match(synchronize, /handleSyncError\(error\);[\s\S]*?return false;/);
  const handler = html.match(/\$\("#syncNowBtn"\)\.addEventListener\("click", async \(event\) => \{[\s\S]*?\n      \}\);/)?.[0] || "";
  assert.match(handler, /const synced = await synchronizeNow\(\);/);
  assert.match(handler, /if \(synced\) setSyncDialogMessage\("已使用云端最新数据。"\);/);
});

test("published workbench gives filters and gratitude controls accurate accessible semantics", () => {
  const html = read("outputs/index.html");
  assert.match(html, /id="gratitudeNote"[^>]*aria-label="感恩日记内容"/);
  assert.match(html, /id="habitPeriodTabs" role="group"/);
  assert.match(html, /aria-label="支出统计范围"/);
  assert.match(html, /aria-label="复盘周期"/);
  assert.match(html, /setAttribute\("aria-pressed", String\(active\)\)/);
  assert.match(html, /role="tablist"[^>]*aria-label="影视类型"/);
  assert.match(html, /role="tab"[^>]*data-media-type=/);
});

function blockEditorMarkup(html) {
  const match = html.match(/block:\s*\{[\s\S]*?summary:\s*\{/);
  assert.ok(match, "time block editor markup should exist");
  return match[0];
}

function timelineSlotsForBlockFrom(html) {
  const match = html.match(/function timeToMinutes[\s\S]*?(?=\n      function renderAiSummary)/);
  assert.ok(match, "timeline helper functions should exist");
  return new Function(`${match[0]}; return timelineSlotsForBlock;`)();
}

function categoryDurationsFrom(html) {
  const match = html.match(/function timeToMinutes[\s\S]*?(?=\n      function renderAiSummary)/);
  assert.ok(match, "timeline duration helpers should exist");
  return new Function(`const TIME_CATEGORIES = ["工作", "学习", "生活", "健康", "社交", "娱乐", "休息", "阅读"]; ${match[0]}; return categoryDurationsForBlocks;`)();
}

function readingPeriodHelpersFrom(html) {
  const month = html.match(/function readingBooksForMonth\(books, monthKey\) \{[\s\S]*?\n      \}/)?.[0];
  const year = html.match(/function readingBooksForYear\(books, year\) \{[\s\S]*?\n      \}/)?.[0];
  assert.ok(month && year, "reading period helpers should exist");
  return new Function(`${month}\n${year}; return { readingBooksForMonth, readingBooksForYear };`)();
}

function localStructuredSummaryFrom(html) {
  const timeline = html.match(/function timeToMinutes[\s\S]*?(?=\n      function renderAiSummary)/);
  const summary = html.match(/function localStructuredSummary\(context\) \{[\s\S]*?(?=\n      async function generateAiSummary)/);
  assert.ok(timeline && summary, "daily advice helpers should exist");
  return new Function(`const TIME_CATEGORIES = ["工作", "学习", "生活", "健康", "社交", "娱乐", "休息", "阅读"]; ${timeline[0]} ${summary[0]}; return localStructuredSummary;`)();
}

test("published workbench adds reading to time-axis categories and duration summaries", () => {
  const html = read("outputs/index.html");
  assert.match(html, /const TIME_CATEGORIES = \["工作", "学习", "生活", "健康", "社交", "娱乐", "休息", "阅读"\]/);
  assert.match(html, /axis-block\[data-category="阅读"\]/);
  assert.match(html, /category-bar-row\[data-category="阅读"\]/);
  const durations = categoryDurationsFrom(html);
  const result = durations([{ category: "阅读", start: "09:00", end: "10:30" }]);
  assert.deepEqual(result, [{ category: "阅读", minutes: 90 }]);
});

function darkModeCss(html) {
  const start = html.indexOf("@media (prefers-color-scheme: dark)");
  assert.ok(start >= 0, "dark mode styles should exist");
  return html.slice(start);
}

function financeCategoryTotalsFrom(html) {
  const match = html.match(/function financeCategoryTotals[\s\S]*?(?=\n      function renderFinance\()/);
  assert.ok(match, "finance category helpers should exist");
  return new Function(`${match[0]}; return financeCategoryTotals;`)();
}

function financeRecordsForChartFrom(html) {
  const match = html.match(/function monthKeyFromDate[\s\S]*?(?=\n      const FINANCE_CHART_COLORS)/);
  assert.ok(match, "finance chart range helpers should exist");
  return new Function(`${match[0]}; return financeRecordsForChart;`)();
}

function financeRecordsForListFrom(html) {
  const match = html.match(/function financeRecordsForList[\s\S]*?(?=\n      function renderFinanceCategoryChart\()/);
  assert.ok(match, "finance record list helper should exist");
  return new Function(`${match[0]}; return financeRecordsForList;`)();
}

function manualFinanceRecordFrom(html) {
  const match = html.match(/function normalizeFinanceAllocation[\s\S]*?function manualFinanceRecord[\s\S]*?(?=\n      async function importFinance\()/);
  assert.ok(match, "manual finance helper should exist");
  return new Function(`function uid() { return "generated-id"; } function todayKey() { return "2026-08-09"; } ${match[0]}; return manualFinanceRecord;`)();
}

function habitChartHelpersFrom(html) {
  const match = html.match(/function daysInMonth[\s\S]*?(?=\n      function renderHabitChart\()/);
  assert.ok(match, "habit chart helpers should exist");
  return new Function(`function todayKey(date = new Date()) { const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10); } ${match[0]}; return { habitChartSeries, shiftHabitChartAnchor, habitChartPeriodLabel };`)();
}

function financeRowNormalizerFrom(html) {
  const match = html.match(/function normalizeHeader[\s\S]*?(?=\n      function manualFinanceRecord)/);
  assert.ok(match, "finance row normalizer should exist");
  return new Function(`function todayKey() { return "2026-08-12"; } ${match[0]}; return normalizeFinanceRow;`)();
}

function financePlanHelpersFrom(html) {
  const match = html.match(/function financePlanDefaults[\s\S]*?(?=\n      function renderFinance\()/);
  assert.ok(match, "finance plan helpers should exist");
  return new Function(`${match[0]}; return { financePlanDefaults, normalizeFinancePlan, financeMonthlyFundingSnapshot };`)();
}

function decisionSupportHelpersFrom(html) {
  const lowEnergy = html.match(/function lowEnergyTrend[\s\S]*?(?=\n      function renderLowEnergyNotice)/);
  const meals = html.match(/function mealCompletenessInsight[\s\S]*?(?=\n      function renderMealCompletenessInsight)/);
  assert.ok(lowEnergy && meals, "decision-support helpers should exist");
  return new Function(`${lowEnergy[0]} ${meals[0]}; return { lowEnergyTrend, mealCompletenessInsight };`)();
}

function maintenanceHelpersFrom(html) {
  const match = html.match(/function maintenanceDateObject[\s\S]*?(?=\n      function renderMaintenance\()/);
  assert.ok(match, "maintenance cycle helpers should exist");
  return new Function(`function todayKey(date = new Date()) { return date.toISOString().slice(0, 10); } ${match[0]}; return { maintenancePeriodProgress, maintenanceDateKey };`)();
}

function recurringTaskHelpersFrom(html) {
  const match = html.match(/function taskOccursOn[\s\S]*?(?=\n      function filteredTasks\()/);
  assert.ok(match, "recurring task helpers should exist");
  return new Function(`${match[0]}; return { taskOccursOn, taskDoneOnDate };`)();
}

function appearanceThemesFrom(html) {
  const match = html.match(/const APPEARANCE_THEMES = \[[\s\S]*?\n      \];/);
  assert.ok(match, "appearance theme definitions should exist");
  const tones = html.match(/const APPEARANCE_BACKGROUND_TONES = \{[\s\S]*?\n      \};/);
  assert.ok(tones, "appearance background tones should exist");
  return new Function(`${match[0]}; ${tones[0]}; APPEARANCE_THEMES.forEach((theme) => Object.assign(theme.light, APPEARANCE_BACKGROUND_TONES[theme.id])); return APPEARANCE_THEMES;`)();
}

function colorDistance(first, second) {
  const channels = (hex) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  const a = channels(first);
  const b = channels(second);
  return Math.hypot(...a.map((channel, index) => channel - b[index]));
}

function backgroundSystemDistance(first, second) {
  return Math.hypot(
    colorDistance(first.bg, second.bg),
    colorDistance(first.surface2, second.surface2),
    colorDistance(first.sidebar, second.sidebar)
  );
}

for (const file of files) {
  test(`${file} puts the time block name before date and time`, () => {
    const markup = blockEditorMarkup(read(file));
    const nameIndex = markup.indexOf("时间块名称");
    const dateIndex = markup.indexOf("日期");
    const startIndex = markup.indexOf("开始时间");
    assert.ok(nameIndex >= 0);
    assert.ok(nameIndex < dateIndex);
    assert.ok(nameIndex < startIndex);
  });

  test(`${file} renders the timeline in one-hour slots`, () => {
    const html = read(file);
    assert.match(html, /for \(let minutes = 0; minutes < 1440; minutes \+= 60\)/);
    assert.match(html, /timelineSlotsForBlock\(block\)/);
    assert.match(html, /const duration = 60;/);
    assert.doesNotMatch(html, /for \(let minutes = 0; minutes < 1440; minutes \+= 30\)/);
  });

  test(`${file} allows minute-precise start and end times`, () => {
    const markup = blockEditorMarkup(read(file));
    assert.match(markup, /id="editorStart"[^>]*step="60"/);
    assert.match(markup, /id="editorEnd"[^>]*step="60"/);
    assert.doesNotMatch(markup, /step="3600"/);
  });

  test(`${file} stores an explicit one-hour end when a time block starts and ends together`, () => {
    const html = read(file);
    const editorSubmit = html.match(/if \(editorType === "block"\) \{[\s\S]*?(?=\n          if \(editorType === "summary"\))/)?.[0] || "";
    assert.match(editorSubmit, /const requestedEnd = String\(form\.get\("end"\) \|\| addMinutes\(start, 60\)\);/);
    assert.match(editorSubmit, /const end = requestedEnd === start \? addMinutes\(start, 60\) : requestedEnd;/);
  });

  test(`${file} does not repeat a block in the hour where it ends`, () => {
    const timelineSlotsForBlock = timelineSlotsForBlockFrom(read(file));
    assert.deepEqual(timelineSlotsForBlock({ start: "09:43", end: "10:00" }), ["09:00"]);
    assert.deepEqual(timelineSlotsForBlock({ start: "10:00", end: "11:00" }), ["10:00"]);
    assert.deepEqual(timelineSlotsForBlock({ start: "09:43", end: "10:43" }), ["09:00", "10:00"]);
  });

  test(`${file} counts overlapping tasks independently in category duration`, () => {
    const categoryDurationsForBlocks = categoryDurationsFrom(read(file));
    const overlapping = categoryDurationsForBlocks([
      { category: "工作", start: "09:00", end: "10:00" },
      { category: "工作", start: "09:30", end: "10:30" }
    ]);
    assert.deepEqual(overlapping, [{ category: "工作", minutes: 120 }]);

    const adjacent = categoryDurationsForBlocks([
      { category: "工作", start: "09:00", end: "10:00" },
      { category: "工作", start: "10:00", end: "11:00" }
    ]);
    assert.deepEqual(adjacent, [{ category: "工作", minutes: 120 }]);

    const crossCategory = categoryDurationsForBlocks([
      { category: "工作", start: "09:00", end: "12:00" },
      { category: "健康", start: "10:00", end: "11:00" }
    ]);
    assert.deepEqual(crossCategory, [
      { category: "工作", minutes: 180 },
      { category: "健康", minutes: 60 }
    ]);
  });

  test(`${file} shows each review timeline task duration`, () => {
    const html = read(file);
    assert.match(html, /今日时间轴[\s\S]*?formatDuration\(blockDurationMinutes\(block\)\)/);
  });

  test(`${file} filters reading records by month and year`, () => {
    const { readingBooksForMonth, readingBooksForYear } = readingPeriodHelpersFrom(read(file));
    const books = [
      { id: "aug-early", title: "第一本", date: "2026-08-03", updatedAt: "2026-08-03T10:00:00.000Z" },
      { id: "aug-late", title: "第二本", date: "2026-08-18", updatedAt: "2026-08-18T10:00:00.000Z" },
      { id: "jul", title: "七月书", date: "2026-07-09", updatedAt: "2026-07-09T10:00:00.000Z" },
      { id: "old", title: "去年书", date: "2025-12-30", updatedAt: "2025-12-30T10:00:00.000Z" }
    ];
    assert.deepEqual(readingBooksForMonth(books, "2026-08").map((book) => book.id), ["aug-late", "aug-early"]);
    assert.deepEqual(readingBooksForYear(books, "2026").map((book) => book.id), ["jul", "aug-early", "aug-late"]);
  });

  test(`${file} adds lightweight decision support without new navigation pages`, () => {
    const html = read(file);
    const { lowEnergyTrend, mealCompletenessInsight } = decisionSupportHelpersFrom(html);
    assert.deepEqual(lowEnergyTrend({
      "2026-08-18": { energy: 2 },
      "2026-08-19": { energy: 1 }
    }, "2026-08-19"), { days: 2, average: 1.5 });
    assert.equal(lowEnergyTrend({ "2026-08-19": { energy: 2 } }, "2026-08-19"), null);

    const meals = mealCompletenessInsight({
      "2026-08-18": { breakfast: "鸡蛋", lunch: "面", dinner: "" },
      "2026-08-19": { breakfast: "", lunch: "盖饭", dinner: "青菜" }
    }, "2026-08-19");
    assert.equal(meals.recordedDays, 2);
    assert.equal(meals.meals, 4);
    assert.equal(meals.mostMissing, "早餐");
    assert.equal(meals.completeness, 19);

    assert.match(html, /id="lowEnergyNotice"/);
    assert.doesNotMatch(html, /id="financeWeeklyInsight"/);
    assert.match(html, /id="mealCompletenessInsight"/);
    assert.doesNotMatch(html, /data-view="patterns"|data-view="decisions"/);
  });

  test(`${file} carries weekly direction focus and vision changes into period review`, () => {
    const html = read(file);
    assert.match(html, /weeklyFocus: String\(source\.weeklyFocus/);
    assert.match(html, /name="weeklyFocus"/);
    assert.match(html, /本周主线/);
    const periodContext = html.match(/function periodSummaryContext[\s\S]*?(?=\n      function localPeriodSummary)/)?.[0] || "";
    assert.match(periodContext, /goalProgressEntries/);
    assert.match(periodContext, /visionEntries/);
    assert.match(periodContext, /方向推进/);
    assert.match(periodContext, /愿景状态/);
  });

  test(`${file} keeps the linked-plan legend horizontal`, () => {
    const html = read(file);
    assert.match(html, /\.task-link-field legend \{[\s\S]*?writing-mode:\s*horizontal-tb;/);
    assert.match(html, /\.task-link-field legend \{[\s\S]*?white-space:\s*nowrap;/);
  });

  test(`${file} lets the timeline panel stretch with the AI summary rail`, () => {
    const html = read(file);
    assert.match(html, /#timeblocks \{[\s\S]*?display:\s*flex;[\s\S]*?align-self:\s*start;/);
    assert.match(html, /#timeblocks \.panel-body \{[\s\S]*?flex:\s*1;[\s\S]*?min-height:\s*0;/);
    assert.match(html, /#timeline\.timeline-axis \{[\s\S]*?flex:\s*1;[\s\S]*?min-height:\s*0;/);
    assert.doesNotMatch(html, /#timeline\.timeline-axis \{[\s\S]*?max-height:\s*36rem;/);
    assert.match(html, /function syncTimelineHeight\(\) \{[\s\S]*?daySummaryTimeline[\s\S]*?timeblocks\.style\.height/);
    assert.match(html, /new ResizeObserver\(syncTimelineHeight\)/);
  });

 test(`${file} classifies timeline blocks and keeps time distribution in Review`, () => {
    const html = read(file);
    const markup = blockEditorMarkup(html);
    assert.match(markup, /时间分类/);
    assert.match(markup, /name="category"/);
    assert.match(html, /function categoryDurationsForBlocks\(/);
    assert.doesNotMatch(html, /id="timeCategoryChart"/);
    assert.match(html, /id="reviewTimeCategoryChart"/);
    assert.match(html, /data-category=/);
  });

  test(`${file} summarizes time by category instead of showing total task time`, () => {
    const html = read(file);
    assert.match(html, /分类用时/);
    assert.match(html, /categoryDurationText/);
    assert.doesNotMatch(html, /时间轴共安排 \$\{context\.blocks\.length\} 个事项，约 \$\{scheduledMinutes\} 分钟/);
    assert.match(html, /完成与未完成的模式、分类时间分配/);
  });

  test(`${file} restores cloud sync automatically when a saved session exists`, () => {
    const html = read(file);
    assert.match(html, /const SYNC_META_KEY = "life-workbench-sync-meta-v1"/);
    assert.match(html, /else if \(syncClient\.getSession\(\)\) \{[\s\S]*?initializeCloudSync\(\)\.catch\(handleSyncError\)/);
    assert.match(html, /function initializeCloudSync\(\) \{[\s\S]*?if \(decision === "use-cloud"\) \{[\s\S]*?applyCloudRow\(cloudRow\)/);
    assert.doesNotMatch(html, /function mergeCloudRow\(/);
    assert.doesNotMatch(html, /id="keepLocalStateBtn"/);
    assert.match(html, /if \(syncDirty && cloudRow\.revision === syncRevision\) \{[\s\S]*?await pushLocalState\(\)/);
  });

  test(`${file} renders an imported expense category pie chart`, () => {
    const html = read(file);
    const categoryTotals = financeCategoryTotalsFrom(html);
    assert.deepEqual(categoryTotals([
      { type: "expense", category: "餐饮", amount: 30 },
      { type: "expense", category: "餐饮", amount: 20 },
      { type: "expense", category: "交通", amount: 50 },
      { type: "income", category: "工资", amount: 5000 }
    ]), [
      { category: "餐饮", amount: 50 },
      { category: "交通", amount: 50 }
    ]);
    assert.match(html, /id="financeCategoryChart"/);
    assert.match(html, /function renderFinanceCategoryChart\(/);
    assert.match(html, /conic-gradient/);
    assert.match(html, /renderFinanceCategoryChart\(\)/);
  });

  test(`${file} filters finance chart by selected month or all expenses`, () => {
    const html = read(file);
    const financeRecordsForChart = financeRecordsForChartFrom(html);
    const records = [
      { type: "expense", date: "2026-07-31", amount: 30 },
      { type: "expense", date: "2026-08-01", amount: 20 },
      { type: "income", date: "2026-08-01", amount: 5000 }
    ];
    assert.deepEqual(financeRecordsForChart(records, "month", "2026-08"), [records[1], records[2]]);
    assert.deepEqual(financeRecordsForChart(records, "all", "2026-08"), records);
    assert.match(html, /data-finance-scope="month"/);
    assert.match(html, /data-finance-scope="all"/);
    assert.match(html, /data-action="finance-prev"/);
    assert.match(html, /data-action="finance-next"/);
    assert.match(html, /id="financeChartMonthLabel"/);
  });

  test(`${file} saves manual finance entries in the same chart-ready format`, () => {
    const manualFinanceRecord = manualFinanceRecordFrom(read(file));
    const record = manualFinanceRecord({
      type: "expense",
      amount: "35.5",
      category: "餐饮",
      name: "午餐",
      date: "2026-08-09",
      note: "和朋友一起"
    });
    assert.deepEqual(record, {
      key: "manual:generated-id",
      externalId: "",
      type: "expense",
      amount: 35.5,
      category: "餐饮",
      name: "午餐",
      date: "2026-08-09",
      note: "和朋友一起",
      allocation: "unclassified",
      source: "手动记账",
      updatedAt: record.updatedAt
    });
    assert.equal(manualFinanceRecord({ type: "income", amount: "", category: "工资", name: "工资" }), null);
  });

  test(`${file} uses a finance type select and keeps date with the note on a second row`, () => {
    const html = read(file);
    const form = html.match(/<form class="finance-entry-form"[\s\S]*?<\/form>/)?.[0] || "";
    assert.match(form, /<select id="financeEntryType" name="type"[^>]*>/);
    assert.match(form, /<option value="expense">支出<\/option>/);
    assert.match(form, /<option value="income">收入<\/option>/);
    assert.doesNotMatch(form, /finance-entry-choice/);
    assert.match(form, /class="field field-date"/);
    assert.match(form, /class="field field-note"/);
    assert.match(html, /\.finance-entry-form \.field-date \{[\s\S]*?grid-column:\s*1\s*\/\s*span 2;/);
    assert.match(html, /\.finance-entry-form \.field-note \{[\s\S]*?grid-column:\s*3\s*\/\s*span 3;/);
    assert.match(html, /\.finance-entry-form > \.btn \{[\s\S]*?height:\s*2\.65rem;/);
  });

  test(`${file} displays recorded bills and filters manual entries`, () => {
    const html = read(file);
    const financeRecordsForList = financeRecordsForListFrom(html);
    const records = [
      { date: "2026-08-01", source: "导入账单", name: "地铁" },
      { date: "2026-08-03", source: "手动记账", name: "午餐" },
      { date: "2026-08-02", source: "手动记账", name: "咖啡" }
    ];
    assert.deepEqual(financeRecordsForList(records, "manual").map((record) => record.name), ["午餐", "咖啡"]);
    assert.deepEqual(financeRecordsForList(records, "import").map((record) => record.name), ["地铁"]);
    assert.match(html, /id="financeRecordSourceFilter"/);
    assert.match(html, /id="financeRecordsButton"/);
    assert.match(html, /id="financeRecordsDialog"/);
    assert.match(html, /id="financeRecordList"/);
    assert.match(html, /finance-record-day-divider/);
    assert.match(html, /\.finance-record-list \{[\s\S]*?margin-top:\s*0\.8rem;/);
    assert.match(html, /\.finance-record-list \{[\s\S]*?margin-right:\s*-1\.1rem;/);
    assert.match(html, /\.finance-record-list \{[\s\S]*?padding-right:\s*1\.1rem;/);
    assert.match(html, /finance-record-day-count/);
    assert.match(html, /\.finance-record-day-divider \{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto;/);
    assert.doesNotMatch(html, /\.finance-record-day-divider::after/);
    assert.match(html, /function renderFinanceRecords\(/);
  });

  test(`${file} distinguishes finance imports from cloud synchronization`, () => {
    const html = read(file);
    assert.match(html, /最近一次导入：/);
    assert.match(html, /云端状态请看页面顶部/);
    assert.doesNotMatch(html, /最近一次同步：\$\{state\.lastImport/);
  });

  test(`${file} provides a guarded control to clear only finance records`, () => {
    const html = read(file);
    const dialog = html.match(/<dialog id="financeRecordsDialog"[\s\S]*?<\/dialog>/)?.[0] || "";
    assert.match(dialog, /id="clearFinanceRecordsBtn"/);
    assert.match(dialog, /清除账单数据/);
    assert.match(html, /function clearFinanceRecords\(\)/);
    assert.match(html, /clearFinanceRecordsBtn[\s\S]*?clearFinanceRecords\(\)/);
    assert.match(html, /确定清除全部账单记录吗？/);
    assert.match(html, /state\.financeRecords\s*=\s*\[\]/);
    const clearFinance = html.match(/function clearFinanceRecords\(\) \{[\s\S]*?(?=\n      function renderFinanceCategoryChart)/)?.[0] || "";
    assert.match(clearFinance, /state\.financeRecords = \[\];[\s\S]*?saveState\(\);/);
  });

  test(`${file} keeps finance import compact beside the heading`, () => {
    const html = read(file);
    const moneySection = html.match(/<section class="panel view-panel" id="money"[\s\S]*?<section class="panel view-panel" id="health"/)?.[0] || "";
    const header = moneySection.match(/<header class="panel-header">[\s\S]*?<\/header>/)?.[0] || "";
    assert.match(header, /id="financeImportButton"/);
    assert.match(header, /导入账单/);
    assert.match(html, /\$\("#financeImportButton"\)\.addEventListener\("click",[\s\S]*?\$\("#financeFile"\)\.click\(\)/);
    assert.match(header, /id="financeFile"[^>]*aria-label="选择要导入的账单文件"/);
    assert.doesNotMatch(moneySection, /class="import-zone"/);
  });

  test(`${file} recognizes common WeChat and Alipay export headers`, () => {
    const normalizeFinanceRow = financeRowNormalizerFrom(read(file));
    const record = normalizeFinanceRow({
      "交易时间": "2026-08-12 12:30:00",
      "交易对方": "测试商户",
      "商品说明": "午餐",
      "金额(元)": "¥12.50",
      "收/支": "支出",
      "一级分类": "餐饮"
    }, "账单.csv");

    assert.equal(record.amount, 12.5);
    assert.equal(record.type, "expense");
    assert.equal(record.name, "午餐");
    assert.equal(record.category, "餐饮");
    assert.equal(record.date, "2026-08-12");
  });

  test(`${file} prefers a detailed category and keeps the imported ledger`, () => {
    const normalizeFinanceRow = financeRowNormalizerFrom(read(file));
    const record = normalizeFinanceRow({
      "交易时间": "2026-08-12 12:30:00",
      "商品说明": "生活用品",
      "金额(元)": "35",
      "收/支": "支出",
      "一级分类": "其他",
      "二级分类": "购物",
      "账本": "购物账本"
    }, "账单.csv");

    assert.equal(record.category, "购物");
    assert.equal(record.ledger, "购物账本");

    const recategorized = normalizeFinanceRow({
      "交易时间": "2026-08-12 12:30:00",
      "商品说明": "生活用品",
      "金额(元)": "35",
      "收/支": "支出",
      "一级分类": "其他"
    }, "账单.csv");
    assert.equal(recategorized.key, record.key);
  });

  test(`${file} calculates the monthly funding plan`, () => {
    const html = read(file);
    const { financePlanDefaults, normalizeFinancePlan, financeMonthlyFundingSnapshot } = financePlanHelpersFrom(html);
    const plan = financePlanDefaults();
    assert.equal(plan.monthlyIncome, 2500);
    assert.equal(plan.monthlySaving, 1000);
    const monthly = financeMonthlyFundingSnapshot([
      { type: "expense", amount: 120, date: "2026-08-02", category: "餐饮" },
      { type: "expense", amount: 80, date: "2026-07-31", category: "餐饮" },
      { type: "income", amount: 100, date: "2026-08-03", category: "工资" }
    ], "2026-08", plan);
    assert.equal(monthly.spent, 0);
    assert.equal(monthly.unclassifiedSpent, 120);
    assert.equal(monthly.free, 1500);
    assert.equal(monthly.remaining, 1500);
    const migrated = normalizeFinancePlan({ dailyIncome: 100, dailySaving: 40, monthlyIncomeDays: 25 });
    assert.equal(migrated.monthlyIncome, 2500);
    assert.equal(migrated.monthlySaving, 1000);
  });

  test(`${file} stores finance plans by month and supports copying them forward`, () => {
    const html = read(file);
    assert.match(html, /financePlans:\s*\{\}/);
    assert.match(html, /function financePlanForMonth\(/);
    assert.match(html, /function copyFinancePlanToNextMonth\(/);
    assert.match(html, /id="financePlanMonthLabel"/);
    assert.match(html, /data-action="finance-plan-prev"/);
    assert.match(html, /data-action="finance-plan-next"/);
    assert.match(html, /id="financePlanCopyNextButton"/);
  });

  test(`${file} distinguishes expected and actual income and marks overspending`, () => {
    const html = read(file);
    assert.match(html, />预计收入</);
    assert.match(html, />实际收入</);
    assert.match(html, /id="financePlanStatus"/);
    assert.match(html, /classList\.toggle\("over", funding\.remaining < 0\)/);
  });

  test(`${file} separates imported spending by funding purpose`, () => {
    const html = read(file);
    const match = html.match(/function normalizeFinanceAllocation[\s\S]*?(?=\n      function financeMonthlyFundingSnapshot)/);
    assert.ok(match);
    const helpers = html.match(/function normalizeFinanceAllocation[\s\S]*?(?=\n      function financePlanForMonth)/);
    const funding = html.match(/function financeMonthlyFundingSnapshot[\s\S]*?(?=\n      function monthKeyFromDate)/);
    assert.ok(helpers && funding);
    const { normalizeFinanceAllocation, financeMonthlyFundingSnapshot } = new Function(`${helpers[0]} ${funding[0]}; return { normalizeFinanceAllocation, financeMonthlyFundingSnapshot };`)();
    assert.equal(normalizeFinanceAllocation(undefined, "expense"), "unclassified");
    const result = financeMonthlyFundingSnapshot([
      { type: "expense", amount: 30, date: "2026-09-02", allocation: "free" },
      { type: "expense", amount: 80, date: "2026-09-03", allocation: "repayment" },
      { type: "expense", amount: 50, date: "2026-09-04", allocation: "essential" },
      { type: "expense", amount: 20, date: "2026-09-05" }
    ], "2026-09", { monthlyIncome: 2500, monthlySaving: 1000, monthlyRepayment: 200, goalAmount: 100 });
    assert.deepEqual({ spent: result.spent, repaymentSpent: result.repaymentSpent, essentialSpent: result.essentialSpent, unclassifiedSpent: result.unclassifiedSpent, remaining: result.remaining }, { spent: 30, repaymentSpent: 80, essentialSpent: 50, unclassifiedSpent: 20, remaining: 1170 });
    assert.match(html, /id="financeEntryAllocation"/);
    assert.match(html, /data-action="set-finance-allocation"/);
    assert.match(html, /id="financePlanUnclassifiedSpent"/);
  });

  test(`${file} lets a finance record be edited, deleted, and exported by month`, () => {
    const html = read(file);
    assert.match(html, /id="financeRecordEditDialog"/);
    assert.match(html, /data-action="edit-finance-record"/);
    assert.match(html, /data-action="delete-finance-record"/);
    assert.match(html, /function exportFinanceMonth\(/);
    assert.match(html, /id="financeExportMonthButton"/);
  });

  test(`${file} keeps shopping and thoughts optional and removes the daily one-line summary`, () => {
    const html = read(file);
    assert.match(html, /id="moduleSettingsDialog"/);
    assert.match(html, /name="shopping"/);
    assert.match(html, /name="thoughts"/);
    assert.match(html, /function applyModuleVisibility\(/);
    assert.doesNotMatch(html, /id="dailySelfSummary"/);
    assert.doesNotMatch(html, /state\.dailySelfSummaries|dailySelfSummaries:\s*\{/);
  });

  test(`${file} does not reveal inactive optional views during a rerender`, () => {
    const html = read(file);
    const source = html.match(/function applyModuleVisibility\(\) \{[\s\S]*?\n      \}/)?.[0];
    assert.ok(source);
    const nodes = {
      shopping: [
        { hidden: false, classList: { contains: () => false } },
        { hidden: true, classList: { contains: (name) => name === "view-panel" } }
      ],
      thoughts: [
        { hidden: false, classList: { contains: () => false } },
        { hidden: true, classList: { contains: (name) => name === "view-panel" } }
      ]
    };
    const document = {
      querySelectorAll: (selector) => nodes[selector.match(/data-module="([^"]+)/)[1]],
      querySelector: () => null
    };
    const state = { moduleVisibility: { shopping: true, thoughts: true } };
    const applyModuleVisibility = new Function("state", "document", "$", `${source}; return applyModuleVisibility;`)(
      state,
      document,
      () => null
    );
    applyModuleVisibility();
    assert.deepEqual(nodes.shopping.map((node) => node.hidden), [false, true]);
    assert.deepEqual(nodes.thoughts.map((node) => node.hidden), [false, true]);
    state.moduleVisibility.shopping = false;
    applyModuleVisibility();
    assert.deepEqual(nodes.shopping.map((node) => node.hidden), [true, true]);
  });

  test(`${file} renders the finance plan without seed bills`, () => {
    const html = read(file);
    const moneySection = html.match(/<section class="panel view-panel" id="money"[\s\S]*?<section class="panel view-panel" id="health"/)?.[0] || "";
    assert.match(html, /financePlans:/);
    assert.match(moneySection, /月度资金安排/);
    assert.match(moneySection, /自由资金/);
    assert.match(moneySection, /本月还可使用/);
    assert.match(html, /function financeMonthlyFundingSnapshot\(/);
    assert.match(html, /financeRecords:\s*\[\]/);
  });

  test(`${file} keeps imported bills visible in the finance page and provides an editable plan dialog`, () => {
    const html = read(file);
    const moneySection = html.match(/<section class="panel view-panel" id="money"[\s\S]*?<section class="panel view-panel" id="health"/)?.[0] || "";
    assert.match(moneySection, /id="financeRecordsButton"/);
    assert.doesNotMatch(moneySection, /financeInlineRecordList/);
    assert.match(moneySection, /id="financePlanEditButton"/);
    assert.match(html, /id="financePlanDialog"/);
    assert.match(html, /id="financePlanForm"/);
    assert.match(html, /id="financePlanMonthlyIncome"/);
    assert.match(html, /id="financePlanGoalAmount"/);
    assert.match(html, /function renderFinanceRecordsInto\(/);
    assert.match(html, /renderFinanceRecordsInto\(\$\("#financeRecordList"\)/);
    assert.match(html, /#financeRecordsDialog \{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;[\s\S]*?width:\s*min\(46rem, calc\(100vw - 2rem\)\);[\s\S]*?height:\s*min\(80dvh, 42rem\);[\s\S]*?margin:\s*auto;[\s\S]*?border-radius:\s*var\(--radius\);/);
    assert.doesNotMatch(html, /#financeRecordsDialog \{[^}]*display:\s*grid;/);
    assert.match(html, /#financeRecordsDialog\[open\] \{[\s\S]*?display:\s*grid;/);
  });

  test(`${file} keeps finance editor fields inside a narrow dialog`, () => {
    const html = read(file);
    assert.match(html, /@media \(max-width: 560px\) \{[\s\S]*?\.finance-entry-form \.field-note \{[\s\S]*?grid-column:\s*1\s*\/\s*-1;/);
    assert.match(html, /#financePlanDialog \{[\s\S]*?width:\s*min\(42rem, calc\(100vw - 2rem\)\);/);
  });

  test(`${file} uses shrinkable desktop finance form columns`, () => {
    const html = read(file);
    assert.match(html, /\.finance-entry-form \{[\s\S]*?grid-template-columns:\s*minmax\(0, 0\.75fr\) minmax\(0, 0\.75fr\) minmax\(0, 1fr\) minmax\(0, 1fr\) minmax\(6rem, auto\);/);
  });

  test(`${file} only shows written daily review content in the selected day panel`, () => {
    const html = read(file);
    assert.doesNotMatch(html, /这一天有行动记录，但还没有写文字/);
    assert.doesNotMatch(html, /id="periodList"/);
    assert.match(html, /function hasWrittenReview\(key\)/);
    assert.match(html, /hasReviewData\(reviewDate\) \? "有记录" : "暂无记录"/);
  });

  test(`${file} keeps daily history in the calendar instead of duplicate page lists`, () => {
    const html = read(file);
    assert.doesNotMatch(html, /id="wellbeingHistory"/);
    assert.doesNotMatch(html, /id="mealHistory"/);
    assert.doesNotMatch(html, /data-action="open-wellbeing"/);
    assert.doesNotMatch(html, /data-action="open-meal"/);
    assert.match(html, /id="reviewDayDetails"/);
   assert.match(html, /function reviewDayDetails\(key\)/);
 });

  test("combines quick capture and plan entry with an optional date", () => {
    const html = read(file);
    const todaySection = html.match(/<section class="panel view-panel" id="today"[\s\S]*?<section class="panel view-panel" id="timeblocks"/)?.[0] || "";
    assert.match(todaySection, /id="planForm"/);
    assert.doesNotMatch(todaySection, /id="quickForm"/);
    assert.doesNotMatch(todaySection, /id="taskForm"/);
    assert.match(todaySection, /id="taskDate"[^>]*type="date"/);
    assert.match(todaySection, /id="taskDateLabel"[^>]*>选择日期<\/span>/);
    assert.doesNotMatch(todaySection, /id="taskDate"[^>]*required/);
    assert.match(html, /function isUnscheduledTask\(task\)/);
  });

  test("aligns the combined plan controls and keeps the helper below them", () => {
    const html = read(file);
    assert.match(html, /\.task-form-row input,[\s\S]*?min-height: 2\.65rem;[\s\S]*?height: 2\.65rem;/);
    assert.match(html, /\.task-form-row input,[\s\S]*?padding-top: 0;[\s\S]*?line-height: 2\.65rem;/);
    assert.match(html, /\.task-form-row select \{[\s\S]*?line-height: 2\.4rem;/);
    assert.match(html, /input\[type="date"\]::-webkit-datetime-edit[\s\S]*?font-size: 1rem;[\s\S]*?line-height: 2\.65rem;/);
    assert.match(html, /\.task-form-row input\[type="date"\] \{[\s\S]*?-webkit-appearance: none;[\s\S]*?appearance: none;/);
    assert.match(html, /::-webkit-datetime-edit-text \{[\s\S]*?color: var\(--muted\);/);
    assert.match(html, /\.optional-date-field input\[type="date"\]::-webkit-datetime-edit[\s\S]*?color: transparent !important;/);
    assert.match(html, /\.optional-date-label \{[\s\S]*?line-height: 2\.65rem;[\s\S]*?transform: translateY\(1px\);/);
    assert.match(html, /\.plan-form-hint \{[\s\S]*?margin: 0\.35rem 0 0\.8rem;/);
  });

  test(`${file} shows category time distribution in the selected review day`, () => {
    const html = read(file);
    assert.match(html, /id="reviewTimeDistribution"/);
    assert.match(html, /id="reviewTimeCategoryChart"/);
    assert.match(html, /function renderReviewTimeDistribution\(\)/);
    assert.match(html, /categoryChartMarkup\(durations\)/);
  });

  test("review panels align at the top", () => {
    const html = read(file);
    assert.match(html, /\.review-layout \{[\s\S]*?align-items: start;/);
    assert.match(html, /\.review-day-panel \{[\s\S]*?margin-top: 0;[\s\S]*?align-self: start;/);
  });

  test("keeps the global search dialog within the viewport", () => {
    const html = read(file);
    assert.match(html, /#globalSearchDialog \{[\s\S]*?width: min\(42rem, calc\(100vw - 2rem\)\);/);
    assert.match(html, /\.search-dialog-form \{[\s\S]*?width: 100%;[\s\S]*?min-width: 0;/);
  });

  test(`${file} generates daily AI only from Today and keeps Review read-only`, () => {
    const html = read(file);
    const reviewStart = html.indexOf('<section class="panel view-panel" id="review"');
    const reviewEnd = html.indexOf('<dialog', reviewStart);
    const reviewSection = html.slice(reviewStart, reviewEnd);
    assert.match(html, /id="generateAiSummaryBtn"/);
    assert.doesNotMatch(html, /id="generateReviewAiBtn"/);
    assert.doesNotMatch(html, /function generateReviewAiSummary\(/);
    assert.doesNotMatch(html, /generateAiSummaryForDate\(/);
    assert.doesNotMatch(reviewSection, /id="dailyNote"/);
    assert.doesNotMatch(reviewSection, /id="saveNoteBtn"/);
    assert.match(reviewSection, /id="reviewDayDetails"/);
    assert.match(reviewSection, /id="reviewDayAi"/);
    assert.match(html, /function reviewDayAi\(key\)/);
    assert.match(html, /function summaryAdviceFromText\(text\)/);
    assert.match(html, />下一步建议<\/strong>/);
    assert.doesNotMatch(html, /AI 下一步建议/);
    assert.doesNotMatch(reviewSection, /每日 AI 总结/);
    assert.match(html, /length: "long"/);
    assert.match(html, /给出 3-5 条明天可执行的建议/);
    assert.match(reviewSection, /从复盘日历点选日期，这里会显示当天详情/);
    assert.match(html, /id="generatePeriodAiBtn"/);
  });

  test(`${file} offers 20 psychologically framed appearance palettes`, () => {
    const html = read(file);
    const themes = appearanceThemesFrom(html);
    assert.equal(themes.length, 20);
    assert.equal(new Set(themes.map((theme) => theme.id)).size, 20);
    themes.forEach((theme) => {
      assert.ok(theme.name);
      assert.ok(theme.mood);
      assert.match(theme.light.accent, /^#[0-9a-f]{6}$/i);
      assert.match(theme.dark.accent, /^#[0-9a-f]{6}$/i);
      assert.ok(Array.isArray(theme.swatches));
      assert.equal(theme.swatches.length, 4);
    });
    for (let first = 0; first < themes.length; first += 1) {
      for (let second = first + 1; second < themes.length; second += 1) {
        const pair = `${themes[first].name} / ${themes[second].name}`;
        assert.ok(colorDistance(themes[first].light.accent, themes[second].light.accent) >= 25, `${pair} light accents are too similar`);
        assert.ok(colorDistance(themes[first].dark.accent, themes[second].dark.accent) >= 20, `${pair} dark accents are too similar`);
        assert.ok(backgroundSystemDistance(themes[first].light, themes[second].light) >= 10, `${pair} background systems are too similar`);
      }
    }
    assert.match(html, /id="appearanceButton"/);
    assert.match(html, /id="appearanceDialog"/);
    assert.match(html, /id="appearanceThemeGrid"/);
    assert.match(html, /appearance:\s*\{\s*theme:/);
    assert.match(html, /saveState\(\{\s*syncCloud:\s*false\s*\}\)/);
    assert.match(html, /const localAppearance = state\.appearance/);
    assert.match(html, /appearance:\s*localAppearance/);
    assert.match(html, /function applyAppearanceTheme\(/);
    assert.match(html, /function mixHexColors\(/);
    assert.match(html, /prefers-color-scheme: dark/);
    const burgundy = themes.find((theme) => theme.id === "cherry");
    assert.equal(burgundy.name, "勃艮第");
    assert.equal(burgundy.light.accent, "#5d1228");
    assert.equal(burgundy.light.bg, "#f9f4f1");
    assert.equal(burgundy.light.surface, "#fffdf9");
    const mintChocolate = themes.find((theme) => theme.id === "peach-tea");
    assert.equal(mintChocolate.name, "薄荷巧克力");
    assert.equal(mintChocolate.light.accent, "#3b241e");
    assert.equal(mintChocolate.light.bg, "#d7eddf");
    assert.match(html, /"peach-tea": "#3f9f73"/);
    assert.doesNotMatch(html, /name: "桃茶"/);
    assert.match(html, /const preview = lowGlarePalette\(theme\.light, false, theme\.id\)/);
    assert.match(html, /\[preview\.bg, preview\.surface, preview\.accent, APPEARANCE_ART_ACCENTS\[theme\.id\]\]/);
    assert.match(html, /const APPEARANCE_ART_ACCENTS = \{/);
    assert.match(html, /--theme-contrast/);
    assert.match(html, /--theme-contrast-soft/);
  });

  test(`${file} themes destructive controls, timeline surfaces, and wellbeing ranges`, () => {
    const html = read(file);
    const themedCss = html.slice(html.indexOf("html[data-appearance-theme] body"));
    assert.match(themedCss, /\.btn\.danger[\s\S]*?--theme-danger/);
    assert.match(themedCss, /input::placeholder,[\s\S]*?--theme-muted/);
    assert.match(themedCss, /\.thought-list-item\.active[\s\S]*?--theme-accent/);
    assert.match(themedCss, /#thoughtBody:focus-visible[\s\S]*?--theme-surface/);
    assert.match(themedCss, /\.panel,[\s\S]*?box-shadow:[\s\S]*?--theme-accent/);
    assert.match(themedCss, /\.brand-mark,[\s\S]*?\.btn:not\([\s\S]*?background:\s*var\(--theme-accent\)/);
    assert.match(themedCss, /\.period-tab:not\(\.active\)[\s\S]*?--theme-muted/);
    assert.match(themedCss, /\.metric:nth-child\(2\)::before[\s\S]*?--theme-contrast/);
    assert.match(themedCss, /\.axis-prompt[\s\S]*?--theme-accent-soft/);
    assert.match(themedCss, /\.icon-btn[\s\S]*?--theme-surface-2/);
    assert.match(themedCss, /\.range-field input\[type="range"\][\s\S]*?background:\s*transparent/);
    assert.match(themedCss, /#timeline\.timeline-axis[\s\S]*?--theme-surface/);
    assert.match(themedCss, /\.time-slot[\s\S]*?--theme-line/);
    assert.match(themedCss, /\.slot-add[\s\S]*?--theme-accent/);
    assert.match(themedCss, /\.axis-block[\s\S]*?color-mix\(/);
    assert.match(themedCss, /\.selected-time[\s\S]*?--theme-accent-soft/);
    assert.match(themedCss, /\.category-bar-track[\s\S]*?--theme-surface-2/);
    assert.match(themedCss, /\.range-field[\s\S]*?--theme-surface-2/);
    assert.match(html, /\.range-control::after[\s\S]*?--range-value/);
    assert.match(html, /function updateWellbeingRange\(/);
    assert.match(html, /style\.setProperty\("--range-value"/);
    assert.match(html, /\.range-field input\[type="range"\]::-webkit-slider-runnable-track/);
    assert.match(html, /\.range-field input\[type="range"\]::-webkit-slider-thumb/);
    assert.match(html, /class="range-scale"[^>]*><span>1<\/span><span>2<\/span><span>3<\/span><span>4<\/span><span>5<\/span>/);
  });

  test(`${file} keeps the sidebar fixed and centers navigation labels`, () => {
    const html = read(file);
    assert.doesNotMatch(html, /id="sidebarToggle"|SIDEBAR_COLLAPSED_KEY|setSidebarCollapsed|sidebar-collapsed/);
    assert.match(html, /\.nav a\s*\{[\s\S]*?grid-template-columns:\s*1\.75rem minmax\(0, 1fr\) 1\.75rem/);
    assert.match(html, /\.nav-label\s*\{[\s\S]*?text-align:\s*center/);
    assert.match(html, /class="nav-balance" aria-hidden="true"/);
  });

  test(`${file} uses a low-glare palette and aligns wellbeing values with range ticks`, () => {
    const html = read(file);
    assert.match(html, /function lowGlarePalette\(/);
    assert.match(html, /const palette = lowGlarePalette\(/);
    assert.match(html, /html\[data-appearance-theme\] \.sidebar[\s\S]*?background:\s*var\(--theme-accent\)/);
    assert.doesNotMatch(html, /class="range-current"/);
    assert.doesNotMatch(html, /id="moodOutput"|id="energyOutput"/);
  });

  test(`${file} uses icons without legacy character markers`, () => {
    const html = read(file);
    assert.match(html, /class="nav-icon" aria-hidden="true"><svg/);
    assert.doesNotMatch(html, /class="nav-kbd"[^>]*>(今|标|习|财|身|想|盘)</);
  });

  test(`${file} gives pinning a consistent button style and a visible contrast-color state`, () => {
    const html = read(file);
    assert.match(html, /class="btn secondary small" id="thoughtPinBtn"/);
    assert.match(html, /#thoughtPinBtn\[aria-pressed="true"\][\s\S]*?--theme-contrast/);
    assert.match(html, /\.appearance-swatches[\s\S]*?grid-template-columns:\s*5\.5fr 2\.3fr 1\.4fr 0\.8fr/);
    assert.match(html, /\.nav a\.active::before[\s\S]*?background:\s*var\(--theme-contrast\)/);
    assert.match(html, /\.period-tab\.active,[\s\S]*?\.chip\.active[\s\S]*?background:\s*var\(--theme-contrast-soft\)/);
  });

  test(`${file} keeps Burgundy on an ivory canvas with a deep wine accent`, () => {
    const burgundy = appearanceThemesFrom(read(file)).find((theme) => theme.id === "cherry");
    assert.equal(burgundy.light.bg, "#f9f4f1");
    assert.equal(burgundy.light.surface, "#fffdf9");
    assert.equal(burgundy.light.accent, "#5d1228");
  });

  test(`${file} removes button-like goal instructions`, () => {
    const html = read(file);
    assert.doesNotMatch(html, /class="guide-grid"/);
    assert.doesNotMatch(html, /class="guide-card"/);
  });

  test(`${file} redesigns goals around life directions and progress reflections`, () => {
    const html = read(file);
    const goalSection = html.match(/<section class="panel view-panel" id="goals"[\s\S]*?<section class="panel view-panel" id="habits"/)?.[0] || "";

    assert.match(goalSection, /生活方向/);
    assert.match(goalSection, /id="goalActiveCount"/);
    assert.doesNotMatch(goalSection, /goalAverage|平均\s*\d*%|class="progress"/);
    assert.match(html, /为什么这件事重要/);
    assert.match(html, /我想看到的变化/);
    assert.match(html, /当前状态/);
    assert.match(html, /下一步/);
    assert.match(html, /function normalizeGoal\(/);
    assert.match(html, /checkIns:/);
    assert.match(html, /editorType === "goal-checkin"/);
    assert.match(html, /data-action="log-goal"/);
    assert.match(html, /记录进展/);
  });

  test(`${file} keeps goal progress compact and moves goal links into a separate editor`, () => {
    const html = read(file);
    const goalEditor = html.match(/goal: \{[\s\S]*?\n          \},\n          \"goal-links\": \{/)?.[0] || "";

    assert.match(html, /查看成果/);
    assert.match(html, /data-action="view-goal-progress"/);
    assert.match(html, /openEditor\("goal-progress", goal\)/);
    assert.match(html, /data-action="link-goal"/);
    assert.match(html, /openEditor\("goal-links", goal\)/);
    assert.match(html, /goal-links/);
    assert.match(html, /管理关联/);
    assert.doesNotMatch(html, /name="trackingMode"/);
    assert.doesNotMatch(html, /推进方式/);
    assert.match(html, /name="linkedTasks"/);
    assert.match(html, /name="linkedHabits"/);
    assert.match(html, /关联计划/);
    assert.match(html, /关联习惯/);
    assert.match(html, /const linkParts = \[\];/);
    assert.match(html, /linkedHabitIds/);
    assert.match(html, /function goalLinkFieldset\(/);
    assert.match(html, /\.task-link-field input\[type=\"checkbox\"\][\s\S]*?-webkit-appearance:\s*checkbox;[\s\S]*?appearance:\s*checkbox;[\s\S]*?width:\s*1rem;[\s\S]*?height:\s*1rem;[\s\S]*?padding:\s*0;/);
    assert.doesNotMatch(goalEditor, /goalLinkFieldset\(seed\)/);
    assert.doesNotMatch(html, /updateGoalLinkMode/);
    assert.doesNotMatch(html, /goal-checkins/);
  });

  test(`${file} constrains native date controls on narrow iPhone layouts`, () => {
    const html = read(file);
    const mobileCss = html.slice(html.indexOf("@media (max-width: 560px)"));
    assert.match(mobileCss, /input\[type="date"\][\s\S]*?min-width:\s*0;[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*100%;/);
    assert.match(mobileCss, /::-webkit-date-and-time-value[\s\S]*?text-align:\s*center;/);
    assert.match(html, /@media \(max-width: 760px\)[\s\S]*?input\[type="date"\][\s\S]*?inline-size:\s*100% !important;[\s\S]*?max-inline-size:\s*100%;/);
    assert.match(html, /@media \(max-width: 760px\)[\s\S]*?input\[type="date"\]::-webkit-datetime-edit[\s\S]*?min-inline-size:\s*0;/);
    assert.match(html, /@media \(max-width: 760px\)[\s\S]*?\.maintenance-log-date\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;/);
    assert.match(html, /@media \(max-width: 760px\)[\s\S]*?#maintenanceLogDate\s*\{[^}]*inline-size:\s*100% !important;/);
  });

  test(`${file} keeps the Today overview and time editor inside a narrow phone viewport`, () => {
    const html = read(file);
    assert.match(html, /\.today-glance\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
    assert.match(html, /\.today-glance \.metric small,[\s\S]*?\.today-glance \.metric span\s*\{[\s\S]*?overflow-wrap:\s*anywhere;/);
    assert.match(html, /#editorDialog input\[type="time"\][\s\S]*?width:\s*auto\s*!important;[\s\S]*?inline-size:\s*auto\s*!important;[\s\S]*?justify-self:\s*stretch;/);
    assert.match(html, /#editorDialog \.dialog-fields,[\s\S]*?#editorDialog \.dual[\s\S]*?min-width:\s*0;/);
    assert.match(html, /#editorDialog form\s*\{[\s\S]*?inline-size:\s*100%;[\s\S]*?overflow-x:\s*hidden;/);
    assert.match(html, /#editorDialog input\[type="time"\]::-webkit-date-and-time-value[\s\S]*?inline-size:\s*100%;[\s\S]*?min-inline-size:\s*0;/);
    assert.match(html, /#dayNavigator \.btn\s*\{\s*width:\s*auto;/);
    assert.match(html, /#dayNavigator input\s*\{[\s\S]*?flex:\s*1 1 8rem;/);
  });

  test(`${file} makes the local daily-summary fallback depend on that day's records`, () => {
    const html = read(file);
    const fallback = html.match(/function localStructuredSummary\(context\) \{[\s\S]*?(?=\n      async function generateAiSummary)/)?.[0] || "";
    assert.match(fallback, /context\.doneTasks/);
    assert.match(fallback, /context\.blocks/);
    assert.match(fallback, /context\.completedHabits/);
    assert.match(fallback, /context\.wellbeing/);
    assert.match(fallback, /context\.gratitude/);
    assert.match(fallback, /context\.notes/);
    assert.match(html, /function summarySourceSignature\(context\)/);
    assert.match(html, /sourceSignature:\s*summarySourceSignature\(context\)/);
    assert.match(html, /记录已更新，建议重新生成/);
  });

  test(`${file} changes daily advice with the day's strongest signals`, () => {
    const summarize = localStructuredSummaryFrom(read(file));
    const base = { tasks: [], doneTasks: [], pendingTasks: [], completedHabits: [], mealRecord: null, gratitude: "", notes: "", thoughts: [] };
    const tired = summarize({ ...base, text: "日期：2026-08-12", blocks: [{ start: "09:00", end: "18:00", category: "工作", title: "上班" }], wellbeing: { mood: 2, energy: 1, sleep: 5, drain: "加班", nextStep: "早点睡" } });
    const leisure = summarize({ ...base, text: "日期：2026-08-12", blocks: [{ start: "12:00", end: "20:00", category: "娱乐", title: "看小说" }], wellbeing: { mood: 4, energy: 4, sleep: 8, drain: "", nextStep: "" } });
    assert.notEqual(tired, leisure);
    assert.match(tired, /早点睡|睡眠|加班/);
    assert.match(leisure, /看小说|娱乐/);
    assert.doesNotMatch(tired, /不必再靠加满日程来证明自己/);
    assert.doesNotMatch(leisure, /睡前记下一件具体的小事/);
  });

  test(`${file} varies daily-advice wording without changing it on repeated generation`, () => {
    const summarize = localStructuredSummaryFrom(read(file));
    const context = {
      tasks: [],
      doneTasks: [],
      pendingTasks: [],
      blocks: [{ start: "09:00", end: "18:00", category: "工作", title: "整理项目" }],
      completedHabits: [],
      wellbeing: { mood: 2, energy: 1, sleep: 5, drain: "临时会议", nextStep: "早点睡" },
      mealRecord: null,
      gratitude: "",
      notes: "",
      thoughts: []
    };
    const sameDay = summarize({ ...context, text: "日期：2026-08-12" });
    assert.equal(sameDay, summarize({ ...context, text: "日期：2026-08-12" }));

    const variants = new Set(Array.from({ length: 12 }, (_, offset) =>
      summarize({ ...context, text: `日期：2026-08-${String(offset + 1).padStart(2, "0")}` })
    ));
    assert.ok(variants.size > 1, "different dates should be able to select different wording");
    for (const advice of variants) {
      assert.match(advice, /早点睡/);
      assert.match(advice, /临时会议/);
    }
  });

  test(`${file} also varies empty-day prompts by date`, () => {
    const summarize = localStructuredSummaryFrom(read(file));
    const empty = { tasks: [], doneTasks: [], pendingTasks: [], blocks: [], completedHabits: [], wellbeing: null, mealRecord: null, gratitude: "", notes: "", thoughts: [] };
    const prompts = new Set(Array.from({ length: 12 }, (_, offset) =>
      summarize({ ...empty, text: `日期：2026-07-${String(offset + 1).padStart(2, "0")}` })
    ));
    assert.ok(prompts.size > 1, "empty days should not always receive the same prompt");
  });

  test(`${file} keeps the selected-date overview limited to daily signals`, () => {
    const html = read(file);
    const overview = html.match(/<section class="summary today-glance"[\s\S]*?<\/section>/)?.[0] || "";
    assert.equal((overview.match(/<article class="metric">/g) || []).length, 3);
    assert.doesNotMatch(overview, /本月支出|moneyMetric|moneyHint/);
    assert.doesNotMatch(html, /\$\("#money(?:Metric|Hint)"\)/);
    assert.match(html, /\.today-glance\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  });

  test(`${file} uses date-neutral copy when editing a selected day`, () => {
    const html = read(file);
    assert.match(html, /<h2>时间轴<\/h2>/);
    assert.match(html, /记下一件值得感谢的人、事或小瞬间。/);
    assert.match(html, /placeholder="我感谢……"/);
    assert.match(html, />会按所选日期保存<\/span>/);
    assert.doesNotMatch(html, /<h2>今日时间轴<\/h2>|今天值得感谢|placeholder="今天我感谢|会按今天保存/);
  });

  test(`${file} labels daily summaries according to the actual generation mode`, () => {
    const html = read(file);
    const dailySummary = html.match(/<section class="panel" id="daySummaryTimeline">[\s\S]*?<\/section>/)?.[0] || "";
    assert.match(dailySummary, /<h2>每日建议<\/h2>/);
    assert.doesNotMatch(dailySummary, /AI 每日总结|每日 AI 建议/);
    assert.doesNotMatch(html, /每日 AI 总结|AI 下一步建议/);
    assert.match(html, /let mode = "本地记录建议"/);
    assert.match(html, /mode = "浏览器本地 AI"/);
    assert.match(html, /\$\("#aiSummaryMeta"\)\.textContent = `\$\{summary\.mode\}/);
  });

  test(`${file} keeps plain meal logging after removing the estimator`, () => {
    const html = read(file);
    assert.match(html, /id="mealForm"/);
    assert.match(html, /name="breakfast"/);
    assert.match(html, /name="lunch"/);
    assert.match(html, /name="dinner"/);
    assert.match(html, /mealRecords:\s*\{\}/);
    assert.match(html, /renderMealRecord\(\)/);
  });

  test(`${file} supports daily, weekly, and monthly recurring plans`, () => {
    const html = read(file);
    const { taskOccursOn, taskDoneOnDate } = recurringTaskHelpersFrom(html);
    assert.equal(taskOccursOn({ date: "2026-08-03", repeat: "daily" }, "2026-08-05"), true);
    assert.equal(taskOccursOn({ date: "2026-08-03", repeat: "weekly" }, "2026-08-10"), true);
    assert.equal(taskOccursOn({ date: "2026-08-03", repeat: "weekly" }, "2026-08-11"), false);
    assert.equal(taskOccursOn({ date: "2026-08-03", repeat: "monthly" }, "2026-09-03"), true);
    assert.equal(taskDoneOnDate({ date: "2026-08-03", repeat: "weekly", completions: { "2026-08-10": true } }, "2026-08-10"), true);
    assert.match(html, /name="repeat"/);
    assert.match(html, /每天/);
    assert.match(html, /每周/);
    assert.match(html, /每月/);
  });

  test(`${file} can edit a selected previous day from the Today workspace`, () => {
    const html = read(file);
    assert.match(html, /id="activeDate"/);
    assert.match(html, /data-action="day-prev"/);
    assert.match(html, /data-action="day-today"/);
    assert.match(html, /let activeDate = todayKey\(\)/);
    assert.match(html, /state\.aiSummaries\[activeDate\]/);
    assert.match(html, /state\.gratitude\[activeDate\]/);
    assert.match(html, /\(block\.date \|\| todayKey\(\)\) === activeDate/);
  });

  test(`${file} provides global search and recoverable task archives`, () => {
    const html = read(file);
    assert.match(html, /id="globalSearchDialog"/);
    assert.match(html, /id="globalSearchInput"/);
    assert.match(html, /function globalSearchEntries\(/);
    assert.match(html, /data-action="archive-task"/);
    assert.match(html, /data-action="restore-task"/);
    assert.match(html, /const options = \["全部", "已完成", "归档"\]/);
  });

  test(`${file} removes the estimator and portion controls`, () => {
    const html = read(file);
    assert.doesNotMatch(html, /estimateMealNutrition|MEAL_NUTRIENTS|NUTRITION_ESTIMATOR_VERSION|mealNutrition|nutrition/);
    assert.doesNotMatch(html, /mealBreakfastPortion|mealLunchPortion|mealDinnerPortion/);
  });

  test(`${file} provides a dated strengths log and review`, () => {
    const html = read(file);
    assert.match(html, /data-view="strengths" aria-label="优点"/);
    assert.match(html, /<span class="nav-label">优点<\/span>/);
    assert.match(html, /strengths: \[\]/);
    assert.match(html, /id="strengthForm"/);
    assert.match(html, /id="strengthTitle"/);
    assert.match(html, /id="strengthEvidence"/);
    assert.match(html, /function normalizeStrength\(/);
    assert.match(html, /function renderStrengths\(/);
    assert.match(html, /data-action="delete-strength"/);
    assert.match(html, /data-strength-period/);
  });

  test(`${file} carries strengths into daily and period review context`, () => {
    const html = read(file);
    assert.match(html, /state\.strengths\.filter\(/);
    assert.match(html, /strengthEntries/);
    assert.match(html, /优点证据/);
    assert.match(html, /hasReviewData\(key\)[\s\S]*?state\.strengths/);
    assert.match(html, /context\.strengths/);
  });

  test(`${file} presents goals as life directions and keeps Today compact`, () => {
    const html = read(file);
    assert.match(html, /data-view="goals" aria-label="方向"/);
    assert.match(html, /<span class="nav-label">方向<\/span>/);
    assert.match(html, /heading: "生活方向"/);
    assert.match(html, /class="summary today-glance"/);
    assert.doesNotMatch(html, /id="timeCategoryChart"/);
    assert.match(html, /id="reviewTimeCategoryChart"/);
  });

  test(`${file} provides a private memo workspace with optional writing templates`, () => {
    const html = read(file);
    const thoughtSection = html.match(/<section class="panel view-panel thought-panel"[\s\S]*?<section class="panel view-panel" id="review"/)?.[0] || "";
    const thoughtForm = html.match(/<form id="thoughtForm"[\s\S]*?<\/form>/)?.[0] || "";
    assert.match(html, /data-view="thoughts"/);
    assert.match(html, /id="thoughts"[^>]*data-panel="thoughts"/);
    assert.doesNotMatch(thoughtSection, /<header class="panel-header">/);
    assert.match(html, /id="thoughtList"/);
    assert.match(html, /id="thoughtForm"/);
    assert.match(html, /id="thoughtBody"/);
    assert.match(html, /id="thoughtSearch"/);
    assert.match(html, /id="thoughtWordCount"/);
    assert.match(html, /id="exportThoughtBtn"/);
    assert.match(html, /const THOUGHT_TEMPLATES = \{/);
    assert.match(html, /blank:\s*\{/);
    assert.match(html, /letter:\s*\{/);
    assert.match(html, /dream:\s*\{/);
    assert.doesNotMatch(thoughtSection, /id="thoughtTemplate"/);
    assert.match(html, /data-thought-template="blank"/);
    assert.match(html, /data-thought-template="dream"/);
    assert.match(html, /data-thought-template="reading"/);
    assert.match(html, /function createThought\(templateId = "blank"\)/);
    assert.match(html, /function openThoughtTemplatePicker\(\)/);
    assert.match(html, /\$\("#newThoughtBtn"\)\.addEventListener\("click", openThoughtTemplatePicker\)/);
    assert.doesNotMatch(html, /if \(!selectedThoughtId && state\.thoughts\.length\)/);
    assert.match(html, /template:\s*thoughtTemplateFor\(source\.template\)\.id/);
    assert.match(html, /thoughts:\s*\[\]/);
    assert.match(html, /function renderThoughts\(/);
    assert.match(html, /function scheduleThoughtAutosave\(/);
    assert.match(html, /thoughtSaveTimer\s*=\s*window\.setTimeout/);
    assert.ok(thoughtForm.indexOf('id="thoughtBody"') < thoughtForm.indexOf('id="thoughtSignature"'));
    assert.ok(thoughtForm.indexOf('id="thoughtSignature"') < thoughtForm.indexOf('id="thoughtDate"'));
    assert.match(html, /#thoughtTitle:focus-visible,[\s\S]*?#thoughtBody:focus-visible[\s\S]*?outline:\s*none;/);
    assert.match(html, /#thoughtDate\s*\{[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?font-family:\s*var\(--serif\);/);
    assert.match(html, /#thoughtDate\s*\{[^}]*border-bottom:\s*1px solid var\(--line\);[^}]*font-size:\s*1rem;/);
    assert.doesNotMatch(html, /\.thought-date-line\s*\{[^}]*font-size:\s*0\.82rem;/);
    assert.match(html, /#thoughtSignature,\s*#thoughtDate\s*\{[^}]*color:\s*var\(--ink\);[^}]*font-family:\s*var\(--serif\);[^}]*font-size:\s*1rem;/);
    assert.match(html, /#thoughtDate::-webkit-date-and-time-value\s*\{[^}]*text-align:\s*right;/);
    assert.match(html, /#thoughtDate\s*\{[^}]*direction:\s*rtl;/);
    assert.match(html, /#thoughtDate::-webkit-datetime-edit\s*\{[^}]*width:\s*100%;[^}]*text-align:\s*right;/);
    assert.match(html, /\.thought-workspace\s*\{[\s\S]*?grid-template-columns:\s*18rem minmax\(0, 1fr\)/);
    assert.match(html, /@media \(max-width: 700px\)[\s\S]*?\.thought-workspace\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
    const darkCss = darkModeCss(html);
    assert.match(darkCss, /\.thought-list-pane,[\s\S]*?\.thought-editor-pane\s*\{[\s\S]*?background:/);
    assert.match(darkCss, /\.thought-list-item\.active\s*\{[\s\S]*?background:/);
  });

  test(`${file} renders habit check-in charts by week, month, and year`, () => {
    const html = read(file);
    const { habitChartSeries, shiftHabitChartAnchor, habitChartPeriodLabel } = habitChartHelpersFrom(html);
    const habits = [
      { title: "喝水", completions: { "2026-08-01": true, "2026-08-02": true } },
      { title: "阅读", completions: { "2026-08-01": true } }
    ];
    const today = new Date(2026, 7, 2);
    const week = habitChartSeries(habits, "week", today, today);
    assert.equal(week.length, 7);
    assert.deepEqual(week.at(-1), {
      key: "2026-08-02",
      label: "日",
      completed: 1,
      possible: 2,
      rate: 50
    });
    const month = habitChartSeries(habits, "month", today, today);
    assert.equal(month.length, 31);
    assert.equal(month[0].completed, 2);
    assert.equal(month[1].completed, 1);
    assert.equal(month[2].possible, 0);
    const previousMonth = habitChartSeries(habits, "month", new Date(2026, 6, 2), today);
    assert.equal(previousMonth.length, 31);
    assert.equal(previousMonth[30].possible, 2);
    const year = habitChartSeries(habits, "year", today, today);
    assert.equal(year.length, 12);
    assert.equal(year[7].label, "8月");
    assert.equal(year[7].completed, 3);
    assert.equal(year[7].possible, 4);
    assert.equal(year[8].possible, 0);
    assert.equal(shiftHabitChartAnchor(today, "week", -1).getDate(), 20);
    assert.equal(shiftHabitChartAnchor(today, "month", -1).getMonth(), 6);
    assert.equal(shiftHabitChartAnchor(today, "year", -1).getFullYear(), 2025);
    assert.equal(habitChartPeriodLabel("month", today), "2026年8月");
    assert.match(html, /id="habitChartBars"/);
    assert.match(html, /id="habitChartPeriodLabel"/);
    assert.match(html, /data-habit-period="week"/);
    assert.match(html, /data-action="habit-prev"/);
    assert.match(html, /data-action="habit-next"/);
    assert.match(html, /class="habit-chart-grid"/);
    assert.match(html, /class="habit-bar-value"/);
    assert.match(html, /class="habit-bar-column"/);
    assert.match(html, /function renderHabitChart\(/);
  });

  test(`${file} calculates maintenance progress and next due dates`, () => {
    const { maintenancePeriodProgress, maintenanceDateKey } = maintenanceHelpersFrom(read(file));
    const floor = {
      interval: 1,
      unit: "week",
      targetCount: 2,
      anchorDate: "2026-08-03",
      completions: ["2026-08-04"]
    };
    const floorProgress = maintenancePeriodProgress(floor, "2026-08-06");
    assert.equal(floorProgress.completed, 1);
    assert.equal(floorProgress.remaining, 1);
    assert.equal(floorProgress.nextDueDate, "2026-08-07");

    const toothbrush = {
      interval: 3,
      unit: "month",
      targetCount: 1,
      anchorDate: "2026-08-05",
      completions: ["2026-08-05"]
    };
    const toothbrushProgress = maintenancePeriodProgress(toothbrush, "2026-10-20");
    assert.equal(toothbrushProgress.completed, 1);
    assert.equal(toothbrushProgress.remaining, 0);
    assert.equal(toothbrushProgress.nextDueDate, "2026-11-05");
    assert.equal(maintenanceDateKey(new Date(2026, 10, 5)), "2026-11-05");
  });

  test(`${file} provides a focused maintenance view with empty-safe controls`, () => {
    const html = read(file);
    assert.match(html, /data-view="maintenance"/);
    assert.match(html, /id="maintenance" data-panel="maintenance"/);
    assert.match(html, /id="maintenanceForm"/);
    assert.match(html, /id="maintenanceList"/);
    assert.match(html, /id="maintenanceLogDate"/);
    assert.match(html, /data-action="maintenance-complete"/);
    assert.match(html, /本周期还差/);
    assert.match(html, /state\.maintenance\.some\(\(item\) => item\.completions\?\.includes\(key\)\)/);
  });

  test(`${file} cycles contrasting colors through habit chart bars`, () => {
    const html = read(file);
    for (let color = 1; color <= 5; color += 1) {
      assert.match(html, new RegExp(`\\.habit-bar:nth-child\\(5n \\+ ${color}\\)[\\s\\S]*?--habit-bar-color:\\s*#[0-9a-f]{6}`, "i"));
    }
    assert.match(html, /\.habit-bar-fill\s*\{[^}]*background:\s*var\(--habit-bar-color\)/);
    const darkCss = darkModeCss(html);
    assert.match(darkCss, /\.habit-bar-fill\s*\{[^}]*background:\s*var\(--habit-bar-color\)/);
  });

  test(`${file} gives timeline categories and the time chart complete dark mode colors`, () => {
    const darkCss = darkModeCss(read(file));
    assert.match(darkCss, /\.axis-block\[data-category="学习"\][^{]*\{[^}]*background:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.axis-block\[data-category="娱乐"\][^{]*\{[^}]*background:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.block-category\s*\{[^}]*color:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.category-bar-label\s*\{[^}]*color:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.category-bar-track\s*\{[^}]*background:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.category-bar-time\s*\{[^}]*color:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.range-field\s*\{[^}]*background:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.finance-chart-card\s*\{[^}]*background:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.finance-pie::after\s*\{[^}]*background:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.habit-chart-card,/);
    assert.match(darkCss, /\.habit-chart-stat\s*\{[^}]*background:\s*#[0-9a-f]{6}/i);
    assert.match(darkCss, /\.habit-chart-bars\s*\{[^}]*background:/i);
    assert.match(darkCss, /\.habit-bar-value\s*\{[^}]*color:\s*var\(--habit-bar-color\)/i);
    assert.match(darkCss, /\.habit-bar-fill\s*\{[^}]*background:\s*var\(--habit-bar-color\)/i);
  });

  test(`${file} renders exactly one schedule label for each recent plan`, () => {
    const html = read(file);
    const renderTasks = html.match(/function renderTasks\(\) \{[\s\S]*?(?=\n      function renderTimeline)/)?.[0] || "";
    assert.match(renderTasks, /<span class="pill">\$\{escapeHtml\(taskScheduleLabel\(task\)\)\}<\/span>/);
    assert.doesNotMatch(renderTasks, /repeatLabel \? `\$\{repeatLabel\} · 起始/);
  });

  test(`${file} groups backup and destructive controls under one data menu`, () => {
    const html = read(file);
    const topbar = html.match(/<header class="topbar">[\s\S]*?<\/header>/)?.[0] || "";
    assert.match(topbar, /<details class="data-menu" id="dataMenu">/);
    assert.match(topbar, /<summary class="btn secondary">数据<\/summary>/);
    assert.match(topbar, /for="backupFile">导入备份/);
    assert.match(topbar, /id="exportBtn"/);
    assert.match(topbar, /id="clearBtn"/);
    assert.match(html, /\.top-commands\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  });

  test(`${file} persists clearing the whole workbench so cloud data cannot immediately return`, () => {
    const html = read(file);
    const clearHandler = html.match(/\$\("#clearBtn"\)\.addEventListener\("click", \(\) => \{[\s\S]*?\n      \}\);/)?.[0] || "";
    assert.match(clearHandler, /state = emptyState\(\);/);
    assert.match(clearHandler, /saveState\(\);/);
    assert.doesNotMatch(clearHandler, /localStorage\.removeItem\(STORAGE_KEY\)/);
  });

  test(`${file} themes list items with the selected appearance`, () => {
    const html = read(file);
    const themedLists = html.match(/html\[data-appearance-theme\] \.task,[\s\S]*?\{[\s\S]*?background:\s*var\(--theme-surface\);/)?.[0] || "";
    for (const selector of [".task", ".timeline-item", ".habit-item", ".expense-item", ".contact-item"]) {
      assert.ok(themedLists.includes(selector), `${selector} should use the active theme surface`);
    }
  });

  test(`${file} keeps daily review focused on next-step advice`, () => {
    const html = read(file);
    const reviewAi = html.match(/function reviewDayAi\(key\) \{[\s\S]*?(?=\n      function renderReviewCalendar)/)?.[0] || "";
    assert.match(html, /function summaryAdviceFromText\(text\)/);
    assert.match(reviewAi, /summaryAdviceFromText\(summary\.text\)/);
    assert.match(reviewAi, /class="review-ai-list"/);
    assert.doesNotMatch(reviewAi, /localStructuredSummary\(summaryContext\(key\)\)/);
  });

  test(`${file} synchronizes mobile navigation and closes the more menu when a view changes`, () => {
    const html = read(file);
    const setView = html.match(/function setView\(requestedView, updateHistory = false\) \{[\s\S]*?\n      \}/)?.[0] || "";
    assert.match(setView, /#mobileNav \[data-view-target\]/);
    assert.match(setView, /mobileMoreMenu[\s\S]*?hidden = true/);
    assert.equal((html.match(/dataset\.viewTarget === view/g) || []).length, 1);
  });

  test(`${file} gives every primary mobile destination an icon and a short label`, () => {
    const html = read(file);
    const mobileNav = html.match(/<nav class="mobile-nav"[\s\S]*?<\/nav>/)?.[0] || "";
    assert.equal((mobileNav.match(/class="mobile-nav-icon"/g) || []).length, 5);
    assert.equal((mobileNav.match(/<span>[^<]+<\/span>/g) || []).length, 5);
  });

  test(`${file} counts today's overview as categories instead of individual items`, () => {
    const html = read(file);
    const overview = html.match(/function renderTodayActionOverview\(\) \{[\s\S]*?\n      \}/)?.[0] || "";
    assert.match(overview, /groups\.length\} 类/);
    assert.doesNotMatch(overview, /groups\.length\} 项/);
  });

  test(`${file} replaces an empty hydration chart with a compact prompt`, () => {
    const html = read(file);
    const hydration = html.match(/function renderHydration\(\) \{[\s\S]*?\n      \}/)?.[0] || "";
    assert.match(hydration, /entries\.some\(\(item\) => item\.amount > 0\)/);
    assert.match(hydration, /hydration-empty/);
    assert.match(html, /\.hydration-trend\.empty\s*\{[^}]*min-height:\s*0/);
  });

  test(`${file} keeps review category bars tied to the active appearance`, () => {
    const html = read(file);
    const themedCategoryBars = html.match(/html\[data-appearance-theme\][\s\S]*?\.category-bar-row\[data-category="学习"\][\s\S]*?\.category-bar-fill/)?.[0] || "";
    assert.match(themedCategoryBars, /background:\s*(?:var\(--theme-|color-mix\()/);
  });
}
