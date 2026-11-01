/**
 * progress.ts — 全局进度持久化（localStorage + 可选云端同步）
 * 记录：访问过的城市、解锁成就、探索模式进度、模拟经营最高分、玩家ID。
 */
"use client";

import type { SimState } from "@/lib/types";

const NS = "crf.v1";
const K_PLAYER = `${NS}.playerId`;
const K_VISITS = `${NS}.visits`;
const K_ACH = `${NS}.achievements`;
const K_EXPLORE = `${NS}.explore`;
const K_SIM = `${NS}.sim`;
const K_COMPARE = `${NS}.compare`;
const K_CHALLENGE = `${NS}.challenges`;

export interface ExploreProgress {
  [cityKey: string]: { maxYear: number; reports: number; diagnosisBest: number; chainBest: number };
}

export interface SimRecord {
  score: number;
  grade: string;
  endingTitle: string;
  year: number;
  pop: number;
  gdp: number;
  savedAt: number;
  /** 自动存档（中途退出可继续） */
  state?: SimState;
  /** 随机数流内部状态（与 state 配套，续玩时恢复随机序列） */
  rngState?: number;
}

export interface ProgressData {
  playerId: string;
  visits: string[];
  achievements: string[];
  explore: ExploreProgress;
  sim: Record<string, SimRecord>;
  compared: boolean;
  /** 挑战模式历史最佳星级：cityKey → challengeId → stars(0-3) */
  challengeBest: Record<string, Record<string, number>>;
}

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, v: string) {
  try { localStorage.setItem(key, v); } catch { /* 隐私模式忽略 */ }
}

export function getPlayerId(): string {
  let id = safeGet(K_PLAYER);
  if (!id) {
    id = "p_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    safeSet(K_PLAYER, id);
  }
  return id;
}

export function loadProgress(): ProgressData {
  return {
    playerId: getPlayerId(),
    visits: JSON.parse(safeGet(K_VISITS) ?? "[]"),
    achievements: JSON.parse(safeGet(K_ACH) ?? "[]"),
    explore: JSON.parse(safeGet(K_EXPLORE) ?? "{}"),
    sim: JSON.parse(safeGet(K_SIM) ?? "{}"),
    compared: safeGet(K_COMPARE) === "1",
    challengeBest: JSON.parse(safeGet(K_CHALLENGE) ?? "{}"),
  };
}

export function recordVisit(cityKey: string): string[] {
  const visits: string[] = JSON.parse(safeGet(K_VISITS) ?? "[]");
  if (!visits.includes(cityKey)) visits.push(cityKey);
  safeSet(K_VISITS, JSON.stringify(visits));
  return visits;
}

export function recordAchievement(id: string): string[] {
  const list: string[] = JSON.parse(safeGet(K_ACH) ?? "[]");
  if (!list.includes(id)) list.push(id);
  safeSet(K_ACH, JSON.stringify(list));
  return list;
}

export function recordExplore(cityKey: string, patch: Partial<{ maxYear: number; reports: number; diagnosisBest: number; chainBest: number }>) {
  const all: ExploreProgress = JSON.parse(safeGet(K_EXPLORE) ?? "{}");
  const cur = all[cityKey] ?? { maxYear: 0, reports: 0, diagnosisBest: 0, chainBest: 0 };
  all[cityKey] = {
    maxYear: Math.max(cur.maxYear, patch.maxYear ?? 0),
    reports: Math.max(cur.reports, patch.reports ?? 0),
    diagnosisBest: Math.max(cur.diagnosisBest, patch.diagnosisBest ?? 0),
    chainBest: Math.max(cur.chainBest, patch.chainBest ?? 0),
  };
  safeSet(K_EXPLORE, JSON.stringify(all));
  return all;
}

export function recordSim(cityKey: string, rec: SimRecord) {
  const all: Record<string, SimRecord> = JSON.parse(safeGet(K_SIM) ?? "{}");
  const prev = all[cityKey];
  if (!prev || rec.score >= prev.score) all[cityKey] = rec;
  else all[cityKey] = { ...prev, state: rec.state ?? prev.state }; // 保底更新自动存档
  safeSet(K_SIM, JSON.stringify(all));
  return all;
}

/**
 * 县长生涯中途自动存档：每年推进/事件选择后调用。
 * 已有历史最佳成绩记录时仅更新存档字段，不覆盖最佳分数。
 */
export function saveSimState(cityKey: string, state: SimState, rngState?: number) {
  const all: Record<string, SimRecord> = JSON.parse(safeGet(K_SIM) ?? "{}");
  const prev = all[cityKey];
  if (prev && (prev.state || prev.rngState !== undefined)) {
    all[cityKey] = { ...prev, year: state.year, pop: state.pop, gdp: state.gdp, savedAt: Date.now(), state, rngState };
  } else {
    all[cityKey] = {
      score: 0, grade: "", endingTitle: "",
      year: state.year, pop: state.pop, gdp: state.gdp,
      savedAt: Date.now(), state, rngState,
    };
  }
  safeSet(K_SIM, JSON.stringify(all));
}

/** 清除某城自动存档（重新开局时调用；保留历史最佳成绩） */
export function clearSimState(cityKey: string) {
  const all: Record<string, SimRecord> = JSON.parse(safeGet(K_SIM) ?? "{}");
  const prev = all[cityKey];
  if (!prev) return;
  delete prev.state;
  delete prev.rngState;
  all[cityKey] = prev;
  safeSet(K_SIM, JSON.stringify(all));
}

export function recordCompared() {
  safeSet(K_COMPARE, "1");
}

/** 记录挑战模式星级（取历史最佳），返回该挑战当前最佳星级 */
export function recordChallenge(cityKey: string, challengeId: string, stars: number): number {
  const all: Record<string, Record<string, number>> = JSON.parse(safeGet(K_CHALLENGE) ?? "{}");
  const city = all[cityKey] ?? {};
  const best = Math.max(0, stars, city[challengeId] ?? 0);
  city[challengeId] = best;
  all[cityKey] = city;
  safeSet(K_CHALLENGE, JSON.stringify(all));
  return best;
}

/** 清空全部进度 */
export function resetProgress() {
  [K_VISITS, K_ACH, K_EXPLORE, K_SIM, K_COMPARE, K_CHALLENGE].forEach((k) => { try { localStorage.removeItem(k); } catch {} });
}

/** 云端同步（可离线：失败静默） */
export async function syncToCloud(data: ProgressData): Promise<boolean> {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch { return false; }
}
