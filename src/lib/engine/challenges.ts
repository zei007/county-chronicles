/**
 * challenges.ts — 县长生涯 · 挑战模式（v1.2）
 *
 * 设计原则：
 * - 通用挑战：阈值以「真实终点值 / 引擎参数」为基准的相对口径，
 *   不做逐城配置即可覆盖全部城市（资源枯竭叙事 + 增长叙事两套基准）；
 * - 三档星级逐级递进：三星门槛包含二星，二星包含一星；
 *   星级 = 自一星起连续达成的档数（断档即止）；
 * - 评估为纯函数：输入终局状态 → { 星级 0-3, 逐条达成明细 }，UI 据此渲染。
 */
import type { SimState } from "@/lib/types";
import type { CitySimParams } from "./simulator";

export interface ChallengeLine {
  /** 门槛描述（如「终局人口 ≥ 真实终点 105%」） */
  label: string;
  /** 是否达成 */
  hit: boolean;
  /** 玩家实际值（用于对照展示） */
  value: string;
}

export interface ChallengeResult {
  /** 0-3 星 */
  stars: number;
  lines: ChallengeLine[];
}

export interface SimChallenge {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  evaluate: (s: SimState, p: CitySimParams) => ChallengeResult;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;
const wan = (p: number) => `${(p / 10000).toFixed(1)}万`;

/** 按三档门槛评估（自一星起连续达成才累计星级） */
function tiered(rows: { target: string; ok: boolean; value: string }[]): ChallengeResult {
  let stars = 0;
  for (const r of rows) {
    if (!r.ok) break;
    stars++;
  }
  return { stars, lines: rows.map((r) => ({ label: r.target, hit: r.ok, value: r.value })) };
}

export const SIM_CHALLENGES: SimChallenge[] = [
  {
    id: "population",
    name: "人口保卫战",
    emoji: "🏘️",
    desc: "把人口守在真实历史之上：留住每一届毕业生，接住每一位返乡人。",
    evaluate: (s, p) => {
      const last = s.history.at(-1);
      const base = Math.max(1, p.finalPopReal);
      // 增长叙事城市：人口乘数存在 0.75 地板（增长大势不可逆），以 76%/78%/81% 为档
      const tiers = p.growthMode ? [0.76, 0.78, 0.81] : [1.0, 1.05, 1.12];
      const v = (last?.pop ?? 0) / base;
      return tiered([
        { target: `终局人口 ≥ 真实终点（${wan(base)}）的 ${pct(tiers[0])}`, ok: v >= tiers[0], value: `${wan(last?.pop ?? 0)}（${pct(v)}）` },
        { target: `终局人口 ≥ 真实终点的 ${pct(tiers[1])}`, ok: v >= tiers[1], value: pct(v) },
        { target: `终局人口 ≥ 真实终点的 ${pct(tiers[2])}`, ok: v >= tiers[2], value: pct(v) },
      ]);
    },
  },
  {
    id: "transform",
    name: "转型突围",
    emoji: "🔄",
    desc: "把产业结构调过来：多元化指数是本作最硬的成长指标。",
    evaluate: (s) => {
      const v = s.diversification;
      return tiered([
        { target: "多元化指数 ≥ 60", ok: v >= 60, value: v.toFixed(0) },
        { target: "多元化指数 ≥ 78", ok: v >= 78, value: v.toFixed(0) },
        { target: "多元化指数 ≥ 92", ok: v >= 92, value: v.toFixed(0) },
      ]);
    },
  },
  {
    id: "ecology",
    name: "绿水青山",
    emoji: "🌳",
    desc: "环境分越高越难挣，一边治污一边保住基本盘才算本事。",
    evaluate: (s, p) => {
      const env = s.environment;
      const gdpOk = s.gdp >= p.finalGdpReal * 0.5;
      const rows = [65, 78, 90].map((t) => ({
        target: `环境值 ≥ ${t} 且 GDP ≥ 真实终点 50%`,
        ok: env >= t && gdpOk,
        value: `环境 ${env.toFixed(0)} · GDP ${s.gdp.toFixed(0)}亿`,
      }));
      return tiered(rows);
    },
  },
  {
    id: "livelihood",
    name: "民生福地",
    emoji: "🏥",
    desc: "教育、医疗、社保一件不落：民生值是人口留存的地基。",
    evaluate: (s) => {
      const v = s.livelihood;
      return tiered([
        { target: "民生指数 ≥ 75", ok: v >= 75, value: v.toFixed(0) },
        { target: "民生指数 ≥ 86", ok: v >= 86, value: v.toFixed(0) },
        { target: "民生指数 ≥ 95", ok: v >= 95, value: v.toFixed(0) },
      ]);
    },
  },
  {
    id: "allround",
    name: "全面发展",
    emoji: "🎯",
    desc: "人口、经济、环境、民生一个都不能少，全能型县长的试金石。",
    evaluate: (s, p) => {
      const last = s.history.at(-1);
      const base = Math.max(1, p.finalPopReal);
      const popLo = p.growthMode ? 0.8 : 0.95;
      const popOk = (last?.pop ?? 0) >= base * popLo;
      const gdpOk = s.gdp >= p.finalGdpReal * 0.85;
      const mid = popOk && gdpOk && s.environment >= 60 && s.livelihood >= 70;
      const full = mid && s.environment >= 75 && s.livelihood >= 85 && s.diversification >= 65;
      return tiered([
        { target: `人口 ≥ 真实终点 ${pct(popLo)} 且 GDP ≥ 真实终点 85%`, ok: popOk && gdpOk, value: `${wan(last?.pop ?? 0)} · GDP ${s.gdp.toFixed(0)}亿` },
        { target: "再达成：环境 ≥ 60 且 民生 ≥ 70", ok: mid, value: `环境 ${s.environment.toFixed(0)} · 民生 ${s.livelihood.toFixed(0)}` },
        { target: "再达成：环境 ≥ 75 · 民生 ≥ 85 · 多元化 ≥ 65", ok: full, value: `环境 ${s.environment.toFixed(0)} · 民生 ${s.livelihood.toFixed(0)} · 多元 ${s.diversification.toFixed(0)}` },
      ]);
    },
  },
  {
    id: "fiscal",
    name: "家底殷实",
    emoji: "💰",
    desc: "城市还在、人口未散，结束时留下真金白银：结余+储备合计达城市体量一定比例。",
    evaluate: (s, p) => {
      const cash = s.fiscal + s.reserve;
      const base = Math.max(1, p.finalGdpReal);
      const alive = (s.history.at(-1)?.pop ?? 0) >= p.finalPopReal * (p.growthMode ? 0.76 : 0.7); // 防摆烂刷星：人走了钱再多也不算
      return tiered([
        { target: `结余+储备 ≥ 真实终点 GDP 的 5%（${(base * 0.05).toFixed(0)}亿）且人口 ≥ 真实终点 70%`, ok: alive && cash >= base * 0.05, value: `${cash.toFixed(0)}亿 · 人口${pct((s.history.at(-1)?.pop ?? 0) / p.finalPopReal)}` },
        { target: "结余+储备 ≥ 真实终点 GDP 的 10%", ok: alive && cash >= base * 0.1, value: `${cash.toFixed(0)}亿` },
        { target: "结余+储备 ≥ 真实终点 GDP 的 18%", ok: alive && cash >= base * 0.18, value: `${cash.toFixed(0)}亿` },
      ]);
    },
  },
];

export const CHALLENGE_MAP: Record<string, SimChallenge> = Object.fromEntries(SIM_CHALLENGES.map((c) => [c.id, c]));

/** 评估某挑战（未知 id 返回 null） */
export function evaluateChallenge(id: string | null | undefined, state: SimState, params: CitySimParams): ChallengeResult | null {
  if (!id) return null;
  const ch = CHALLENGE_MAP[id];
  return ch ? ch.evaluate(state, params) : null;
}
