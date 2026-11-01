/**
 * achievements.ts — 成就系统统一入口
 * - 全局成就目录（GLOBAL_ACHIEVEMENTS）：跨城市的行为成就
 * - 城市成就：来自城市 JSON 的 achievements 数组（visit / year / chain 等条件）
 * - unlockXxx 内部去重：只有**新解锁**才弹 Toast + 音效
 */
import { toast } from "sonner";
import { audio } from "@/lib/audio";
import { recordAchievement, loadProgress } from "@/lib/progress";
import { CITY_LIST } from "@/data/cities";
import type { Achievement } from "@/lib/types";

export interface GlobalAchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

/** 全局成就目录（不计入城市 JSON 的城市成就） */
export const GLOBAL_ACHIEVEMENTS: GlobalAchievementDef[] = [
  { id: "first_footstep", name: "初来乍到", desc: "首次踏入一座资源城市", icon: "👣" },
  { id: "explorer_5", name: "行者无疆", desc: "探索 5 座城市", icon: "🧭" },
  { id: "explorer_all", name: "踏遍山河", desc: "探索全部资源城市", icon: "🗺️" },
  { id: "time_traveler", name: "时光尽端", desc: "把任意城市的时间轴推到终点年", icon: "⏳" },
  { id: "chain_80", name: "拼图高手", desc: "任一产业链拼图匹配 ≥80%", icon: "🧩" },
  { id: "chain_100", name: "天衣无缝", desc: "任一产业链拼图匹配 100%", icon: "💎" },
  { id: "diag_85", name: "望闻问切", desc: "衰落诊断匹配度 ≥85%", icon: "🩺" },
  { id: "diag_100", name: "诊断圣手", desc: "衰落诊断匹配度 100%", icon: "🏅" },
  { id: "report_1", name: "城市志编纂者", desc: "生成首份城市兴衰档案", icon: "📜" },
  { id: "migra_watcher", name: "候鸟观察员", desc: "打开人口迁徙飞线图", icon: "🦅" },
  { id: "space_watcher", name: "空中之眼", desc: "打开城市空间实景图", icon: "🛰️" },
  { id: "compare_1", name: "双城记", desc: "使用一次双城对比", icon: "⚔️" },
  { id: "sim_first", name: "首任县长", desc: "完成一局县长生涯", icon: "🧑‍💼" },
  { id: "sim_85", name: "转型典范", desc: "县长生涯单局评分 ≥85", icon: "🏆" },
  { id: "sim_challenge_3", name: "金牌施政", desc: "任一施政挑战拿到三星评价", icon: "⭐" },
];

const GLOBAL_MAP = new Map(GLOBAL_ACHIEVEMENTS.map((g) => [g.id, g]));

function unlock(id: string, name: string, desc: string, icon: string) {
  const before = loadProgress().achievements;
  if (before.includes(id)) return;
  const after = recordAchievement(id);
  if (after.length > before.length) {
    toast.success(`${icon} 成就解锁「${name}」`, { description: desc, duration: 4000 });
    audio.play("achieve");
  }
}

/** 全局成就解锁入口 */
export function unlockGlobal(id: string) {
  const def = GLOBAL_MAP.get(id);
  if (def) unlock(def.id, def.name, def.desc, def.icon);
}

/** 城市 JSON 内置成就（visit / year / chain / diagnosis 条件） */
function unlockCityAch(a: Achievement) {
  unlock(a.id, a.name, a.desc, "🏙️");
}

/* ---------------- 业务事件 → 成就 ---------------- */

/** 进入一座城市（探索模式挂载时调用） */
export function onCityVisit(city: { config: { cityKey: string }; achievements?: Achievement[] }) {
  for (const a of city.achievements ?? []) {
    if (a.condition === "visit") unlockCityAch(a);
  }
  const cityKeys = new Set(CITY_LIST.map((c) => c.key));
  const visited = loadProgress().visits.filter((v) => cityKeys.has(v)).length;
  unlockGlobal("first_footstep");
  if (visited >= 5) unlockGlobal("explorer_5");
  if (visited >= CITY_LIST.length) unlockGlobal("explorer_all");
}

/** 时间轴年份变化（CityGame 年份 effect 调用） */
export function onCityYear(city: { config: { timeRange: { end: number } }; achievements?: Achievement[] }, year: number) {
  for (const a of city.achievements ?? []) {
    if (a.condition === "year" && a.year === year) unlockCityAch(a);
  }
  if (year >= city.config.timeRange.end) unlockGlobal("time_traveler");
}

/** 产业链拼图出分 */
export function onChainResult(city: { achievements?: Achievement[] } | null, match: number) {
  if (city) {
    for (const a of city.achievements ?? []) {
      if (a.condition === "chain" && match >= 80) unlockCityAch(a);
    }
  }
  if (match >= 80) unlockGlobal("chain_80");
  if (match >= 100) unlockGlobal("chain_100");
}

/** 衰落诊断出分 */
export function onDiagnosisResult(city: { achievements?: Achievement[] } | null, match: number) {
  if (city) {
    for (const a of city.achievements ?? []) {
      if (a.condition === "diagnosis" && match >= 85) unlockCityAch(a);
    }
  }
  if (match >= 85) unlockGlobal("diag_85");
  if (match >= 100) unlockGlobal("diag_100");
}

/** 生成城市档案 */
export function onReportCreated() {
  unlockGlobal("report_1");
}

/** 打开迁徙图 / 空间实景 */
export function onMigrationView() {
  unlockGlobal("migra_watcher");
}
export function onSpaceView() {
  unlockGlobal("space_watcher");
}

/** 使用双城对比 */
export function onCompareUsed() {
  unlockGlobal("compare_1");
}

/** 县长生涯结局结算 */
export function onSimFinished(score: number) {
  unlockGlobal("sim_first");
  if (score >= 85) unlockGlobal("sim_85");
}

/** 挑战模式星级结算（三星解锁金牌施政） */
export function onChallengeStars(stars: number) {
  if (stars >= 3) unlockGlobal("sim_challenge_3");
}
