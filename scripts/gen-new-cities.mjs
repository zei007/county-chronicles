/**
 * gen-new-cities.mjs — 把 new-cities-a/b.mjs 的创作数据装配为完整城市 JSON
 *
 * 功能：
 *  1. 装配 CityData 结构（timeline/chains/diagnosis/space/migration/achievements）
 *  2. 从事件自动生成城市成就（visit + impact≥8 的年份事件 + chain 拼图）
 *  3. 更新 _index.json（按 key 排序插入）并调用 gen-index.mjs 重建 index.ts
 *
 * 用法：node scripts/gen-new-cities.mjs [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { NEW_CITIES_A } from "./new-cities-a.mjs";
import { NEW_CITIES_B } from "./new-cities-b.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CITIES_DIR = path.join(ROOT, "src/data/cities");
const DRY = process.argv.includes("--dry");

const SKIP_EVENT_FIELDS = new Set(["title", "category", "desc", "impact", "event"]);

function buildCity(raw) {
  const chainKeys = Object.keys(raw.chains);
  const timeline = raw.events.map((e) => {
    const entry = { year: e.year, title: e.title, category: e.category, desc: e.desc, impact: e.impact, event: !!e.event };
    for (const [k, v] of Object.entries(e)) {
      if (SKIP_EVENT_FIELDS.has(k)) continue;
      if (k === "pop" || k === "gdp") { entry[k] = v; continue; }
      entry[k] = v ?? 0; // 主导指标数值
    }
    return entry;
  });
  timeline.sort((a, b) => a.year - b.year);

  // 成就：首访 + 最多 3 个 impact≥8 的真实事件 + 拼图
  const achievements = [
    { id: `${raw.key}_first_visit`, name: `${raw.profile.name.replace(/市|区|县$/, "")}初见`, desc: `首次进入${raw.profile.name}`, condition: "visit", year: null },
  ];
  for (const e of raw.events.filter((e) => e.event && e.impact >= 8).slice(0, 3)) {
    achievements.push({ id: `${raw.key}_y${e.year}`, name: e.title, desc: `见证${e.year}年${e.title}`, condition: "year", year: e.year });
  }
  achievements.push({
    id: `${raw.key}_chain`,
    name: `${raw.profile.tags[0]}拼图大师`,
    desc: `完成${raw.profile.name}产业链拼图，匹配度≥80%`,
    condition: "chain",
    year: null,
  });

  return {
    profile: raw.profile,
    config: {
      timeRange: raw.config.timeRange,
      phases: raw.config.phases,
      primaryIndicators: raw.config.primaryIndicators,
      spaceType: "built_up",
      spaceLabels: { built: "建成区", density: "人口密度" },
      cityKey: raw.key,
      chainKeys,
      chainContainerIds: chainKeys.map((k) => `${k}Chain`),
      currentStatus: raw.config.currentStatus,
      transformationAssessment: raw.config.transformationAssessment,
      transformationDetail: raw.config.transformationDetail,
      reportStamp: raw.config.reportStamp ?? "ARCHIVED",
    },
    timeline,
    chains: raw.chains,
    diagnosis: raw.diagnosis,
    space_timeline: raw.space.timeline,
    space: {
      built_up_area_km2: raw.space.built_up_area_km2,
      current_pop: raw.space.current_pop,
      peak_pop: raw.space.peak_pop,
      vacancy_rate: raw.space.vacancy_rate,
      housing_price_rank: raw.space.housing_price_rank,
      landmark: raw.space.landmark,
    },
    migration: raw.migration,
    achievements,
    sources: [],
    real_anchors: {},
  };
}

/* 校验 */
function validate(city) {
  const errs = [];
  const { config, timeline, chains, diagnosis, space_timeline, migration } = city;
  const { start, end } = config.timeRange;
  if (!timeline.some((t) => t.year === end)) errs.push("缺少终点年条目");
  if (timeline[0].year !== start) errs.push("首条目年份≠起始年");
  const sumD = diagnosis.decline_factors.reduce((s, f) => s + f.weight, 0);
  const sumR = diagnosis.rebirth_factors.reduce((s, f) => s + f.weight, 0);
  if (sumD !== 100) errs.push(`decline 权重和=${sumD} ≠100`);
  if (sumR !== 100) errs.push(`rebirth 权重和=${sumR} ≠100`);
  for (const k of config.chainKeys) {
    const ch = chains[k];
    if (!ch) errs.push(`缺链 ${k}`);
    else for (const n of ch.nodes) if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) errs.push(`链 ${k} 节点 ${n.id} 缺坐标`);
  }
  const t = timeline.at(-1);
  if (space_timeline.at(-1)?.year !== end && !space_timeline.some((s) => s.year === end)) errs.push("space_timeline 缺终点年");
  const mSum = migration.destinations.reduce((s, d) => s + d.count, 0);
  if (Math.abs(mSum - migration.outflow_total) > migration.outflow_total * 0.35) {
    errs.push(`迁徙去向合计 ${mSum} 与 outflow_total ${migration.outflow_total} 偏差>35%`);
  }
  // 人口跳变粗检：矿业城市早期聚集可出现 5-6 倍级跳变（与既有城市数据一致），>6.5x 视为异常
  for (let i = 1; i < timeline.length; i++) {
    const a = timeline[i - 1].pop ?? 0, b = timeline[i].pop ?? 0;
    if (a > 0 && b > 0 && (b / a > 6.5 || a / b > 6.5)) errs.push(`人口跳变 ${timeline[i - 1].year}(${a})→${timeline[i].year}(${b})`);
  }
  if (t?.pop != null && city.space.peak_pop > 0 && t.pop / city.space.peak_pop > 1.1) errs.push("终点人口>峰值人口 110%");
  return errs;
}

const ALL = [...NEW_CITIES_A, ...NEW_CITIES_B];
let ok = 0;
const report = [];
for (const raw of ALL) {
  const city = buildCity(raw);
  const errs = validate(city);
  if (errs.length) {
    report.push(`FAIL ${raw.key}: ${errs.join("; ")}`);
    continue;
  }
  report.push(`OK   ${raw.key}: ${city.profile.name} · ${city.config.timeRange.start}-${city.config.timeRange.end} · 事件${city.timeline.length}条 · 成就${city.achievements.length}项`);
  if (!DRY) fs.writeFileSync(path.join(CITIES_DIR, `${raw.key}.json`), JSON.stringify(city, null, 1) + "\n", "utf8");
  ok++;
}

/* 更新 _index.json */
if (!DRY && ok === ALL.length) {
  const idxPath = path.join(CITIES_DIR, "_index.json");
  const idx = JSON.parse(fs.readFileSync(idxPath, "utf8"));
  const existing = new Set(idx.cities.map((c) => c.key));
  for (const raw of ALL) {
    if (existing.has(raw.key)) continue;
    idx.cities.push({
      key: raw.key,
      file: `${raw.key}.json`,
      name: raw.profile.name,
      province: raw.profile.province,
      coords: raw.profile.coordinates,
      tags: raw.profile.tags,
      timeRange: raw.config.timeRange,
    });
  }
  idx.cities.sort((a, b) => a.key.localeCompare(b.key));
  idx.generatedAt = new Date().toISOString();
  fs.writeFileSync(idxPath, JSON.stringify(idx, null, 1) + "\n", "utf8");

  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts/gen-index.mjs")], { stdio: "inherit" });
  if (r.status !== 0) { console.error("gen-index 失败"); process.exit(1); }
}

console.log(report.join("\n"));
if (ok !== ALL.length) {
  console.error(`\nFAIL: ${ALL.length - ok} 城校验未通过`);
  process.exit(1);
}
console.log(`\nDone: ${ok}/${ALL.length} cities ${DRY ? "(dry run)" : "written"}`);
