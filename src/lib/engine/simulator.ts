/**
 * simulator.ts — 模拟经营引擎《县长生涯》（v2 真实锚定模型）
 *
 * 设计原则（v1 教训：自由反馈模型会人口爆炸/GDP崩溃）：
 * - 一切指标以真实历史曲线（timeline 插值）为锚：什么都不做 ⇒ 游戏复现真实历史；
 * - 玩家政策产生"偏离乘数"（gdpMult/popMult）与储量偏移，量级受钳制，永不失控；
 * - 资源储量按真实产量路径累计消耗，扩产加速耗竭、限产保储，枯竭触发产出闸门；
 * - 纯函数、可回放（rng 注入）。
 */
import type { CityData, SimState, SimPolicyInput, SimYearResult, SimEventOutcome, SimEnding, SimChoice } from "@/lib/types";

export const EMPTY_POLICY: SimPolicyInput = { industry: 0, transform: 0, infra: 0, livelihood: 0, environment: 0, reserve: 0 };

/* ---------------- 随机数（xorshift，可回放） ---------------- */
/** 可调用随机函数，附带内部状态读写（用于自动存档续玩时恢复随机流） */
export type Rng = (() => number) & { getState(): number; setState(v: number): void };

export function makeRng(seed: number): Rng {
  let s = seed >>> 0 || 1;
  const fn = (() => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  }) as Rng;
  fn.getState = () => s;
  fn.setState = (v: number) => { s = v >>> 0 || 1; };
  return fn;
}

/* ---------------- 城市参数标定 ---------------- */
export interface CitySimParams {
  startYear: number;
  endYear: number;
  peakPrimary: number;
  peakYear: number;
  declineStart: number;
  collapseYear: number;
  peakPop: number;
  startPop: number;
  startGdp: number;
  peakGdpReal: number;
  finalGdpReal: number;
  finalPopReal: number;
  peakBuiltArea: number;
  primaryLabel: string;
  primaryUnit: string;
  primaryKey: string;
  ind2Key?: string;
  /** 增长叙事模式（对照组城市）：无资源枯竭闸门，挑战与结局采用增长口径 */
  growthMode: boolean;
  /** 真实历史逐年插值序列 */
  realSeries: { year: number; gdp: number; pop: number; out: number }[];
  /** 产量-储量换算系数：按真实路径消耗至 collapseYear 时储量≈0.12 */
  reserveK: number;
  histEvents: { year: number; title: string; desc: string; icon: string }[];
}

export const EVENT_ICON: Record<string, string> = {
  discovery: "🛢️", peak: "🏆", decline: "📉", relocation: "🚚", transformation: "♻️", culture: "⭐",
};

function lerpAt<T>(arr: T[], year: number, getYear: (t: T) => number, pick: (t: T) => number): number {
  if (!arr.length) return 0;
  if (year <= getYear(arr[0])) return pick(arr[0]);
  if (year >= getYear(arr[arr.length - 1])) return pick(arr[arr.length - 1]);
  for (let i = 0; i < arr.length - 1; i++) {
    const a = arr[i], b = arr[i + 1];
    if (year >= getYear(a) && year <= getYear(b)) {
      const r = (year - getYear(a)) / Math.max(1, getYear(b) - getYear(a));
      return pick(a) + (pick(b) - pick(a)) * r;
    }
  }
  return pick(arr[arr.length - 1]);
}

export function calibrate(city: CityData): CitySimParams {
  const cfg = city.config;
  const tl = city.timeline;
  const p0 = cfg.primaryIndicators[0];
  let peakPrimary = 0, peakYear = cfg.timeRange.start;
  for (const t of tl) {
    const v = Number(t[p0.key] ?? 0);
    if (v > peakPrimary) { peakPrimary = v; peakYear = t.year; }
  }
  const firstChain = city.chains?.[cfg.chainKeys[0]];
  const lc = firstChain?.lifecycle;
  const gdps = tl.map((t) => Number(t.gdp ?? 0));
  const pops = tl.map((t) => t.pop ?? 0);
  const st = city.space_timeline ?? [];
  const peakBuilt = Math.max(0, ...st.map((s) => Number(s.built ?? s.old_area ?? 0) || 0));
  const last = tl[tl.length - 1];

  // 真实逐年序列（gdp/pop/产量占比）
  const realSeries: { year: number; gdp: number; pop: number; out: number }[] = [];
  for (let y = cfg.timeRange.start; y <= cfg.timeRange.end; y++) {
    realSeries.push({
      year: y,
      gdp: Math.max(0.01, lerpAt(tl, y, (t) => t.year, (t) => Number(t.gdp ?? 0))),
      pop: Math.max(500, lerpAt(tl, y, (t) => t.year, (t) => t.pop ?? 0)),
      out: peakPrimary > 0 ? Math.max(0, Math.min(1, lerpAt(tl, y, (t) => t.year, (t) => Number(t[p0.key] ?? 0)) / peakPrimary)) : 0,
    });
  }
  // 储量系数：真实路径消耗到 collapseYear 时剩余≈0.12
  const collapse = lc?.collapse ?? cfg.timeRange.end;
  let totalOut = 0;
  for (const r of realSeries) if (r.year <= collapse) totalOut += r.out;
  const reserveK = totalOut > 0 ? 0.88 / totalOut : 0.01;

  return {
    startYear: cfg.timeRange.start,
    endYear: cfg.timeRange.end,
    peakPrimary,
    peakYear,
    declineStart: lc?.decline ?? peakYear,
    collapseYear: collapse,
    peakPop: Math.max(...pops),
    startPop: tl[0]?.pop ?? 10000,
    startGdp: Number(tl[0]?.gdp ?? 0.1),
    peakGdpReal: Math.max(...gdps),
    finalGdpReal: Number(last?.gdp ?? 0),
    finalPopReal: Number(last?.pop ?? 0),
    peakBuiltArea: peakBuilt || 20,
    primaryLabel: p0.label,
    primaryUnit: p0.unit,
    primaryKey: p0.key,
    ind2Key: cfg.primaryIndicators[1]?.key,
    realSeries,
    reserveK,
    growthMode: city.simMode === "growth",
    histEvents: tl.filter((t) => t.event).map((t) => ({ year: t.year, title: t.title, desc: t.desc, icon: EVENT_ICON[t.category] ?? "📌" })),
  };
}

/* ---------------- 建档 ---------------- */
export function createSimState(city: CityData, seed = Date.now() % 2147483647): SimState {
  const p = calibrate(city);
  const startBuilt = Math.max(1, Number(city.space_timeline?.[0]?.built ?? city.space_timeline?.[0]?.old_area ?? 2) || 2);
  return {
    cityKey: city.config.cityKey,
    year: p.startYear,
    pop: p.realSeries[0]?.pop ?? p.startPop,
    gdp: p.realSeries[0]?.gdp ?? p.startGdp,
    fiscal: Math.max(0.5, Number(((p.realSeries[0]?.gdp ?? p.startGdp) * 0.09).toFixed(2))),
    reserve: 0,
    resourceLeft: 1,
    environment: 82,
    livelihood: 55,
    diversification: 8,
    unemployment: 0.05,
    vacancy: 0.03,
    builtArea: startBuilt,
    transformStock: 0,
    history: [],
    pendingEvents: [],
    finished: false,
    ...({ _momentum: 0, _gdpMult: 1, _popMult: 1, _prevRealOut: p.realSeries[0]?.out ?? 0, _infraExtra: 0, _seed: seed } as Record<string, number>),
  } as SimState;
}

/* ---------------- 通用随机事件池 ---------------- */
interface RandomEvent {
  id: string;
  title: string;
  desc: string;
  choices: SimChoice[];
  weight: number;
  minYearProgress?: number;
}

const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: "investment",
    title: "招商引资机遇",
    desc: "一家外部企业有意投资建厂，但要求三年免税并配套基建。",
    weight: 0.18,
    choices: [
      { label: "引进来", desc: "财政+3亿，多元化+4，环境-4", effects: { fiscal: 3, diversification: 4, environment: -4 } },
      { label: "提高门槛", desc: "环境+3，错过投资", effects: { environment: 3 } },
      { label: "婉拒", desc: "稳字当头", effects: {} },
    ],
  },
  {
    id: "accident",
    title: "安全事故预警",
    desc: "安监部门报告：矿区设备老化，重大事故风险上升。",
    weight: 0.15,
    minYearProgress: 0.12,
    choices: [
      { label: "停产整顿", desc: "财政-2亿，民生+2", effects: { fiscal: -2, livelihood: 2 } },
      { label: "带险生产", desc: "GDP乘数+2%，环境-6，民生-3", effects: { environment: -6, livelihood: -3, gdpMult: 0.02 } },
    ],
  },
  {
    id: "policy_wind",
    title: "上级政策窗口",
    desc: "省级出台资源型城市转型扶持政策，可申报试点。",
    weight: 0.14,
    choices: [
      { label: "申报试点", desc: "净获4亿拨款，多元化+6", effects: { fiscal: 4, diversification: 6 } },
      { label: "暂不申报", desc: "把精力放在日常", effects: {} },
    ],
  },
  {
    id: "price_swing",
    title: "初级产品价格波动",
    desc: "大宗商品市场价格剧烈波动，主导产业营收承压。",
    weight: 0.16,
    minYearProgress: 0.15,
    choices: [
      { label: "逆周期扩产", desc: "GDP乘数+3%，储量额外-2%", effects: { gdpMult: 0.03, resource: -0.02 } },
      { label: "顺势减产保价", desc: "财政-1亿，储量+2%", effects: { fiscal: -1, resource: 0.02 } },
    ],
  },
  {
    id: "brain_drain",
    title: "人才流失报告",
    desc: "教育局统计：重点中学升学后回乡率连续三年下滑。",
    weight: 0.13,
    minYearProgress: 0.1,
    choices: [
      { label: "设立返乡补贴", desc: "财政-1.5亿，民生+4", effects: { fiscal: -1.5, livelihood: 4 } },
      { label: "暂不处理", desc: "人口乘数-0.5%", effects: { popMult: -0.005 } },
    ],
  },
  {
    id: "env_inspection",
    title: "环保督察进驻",
    desc: "中央环保督察组进驻，若环境值过低将被通报问责。",
    weight: 0.14,
    minYearProgress: 0.22,
    choices: [
      { label: "立行立改", desc: "财政-2.5亿，环境+8", effects: { fiscal: -2.5, environment: 8 } },
      { label: "表面整改", desc: "蒙混过关（民生-4）", effects: { livelihood: -4 } },
    ],
  },
  {
    id: "rail_chance",
    title: "交通干线规划博弈",
    desc: "新建高铁/高速的线路走向论证会召开，设站与否将影响未来三十年。",
    weight: 0.12,
    minYearProgress: 0.08,
    choices: [
      { label: "全力争取设站", desc: "财政-3亿，人口乘数+1.5%", effects: { fiscal: -3, popMult: 0.015 } },
      { label: "量力而行", desc: "不变", effects: {} },
    ],
  },
];

/* ---------------- 单年推演（真实锚定模型） ---------------- */
export function simulateYear(
  state: SimState,
  policy: SimPolicyInput,
  city: CityData,
  rng: () => number,
): SimState {
  if (state.finished) return state;
  const p = calibrate(city);
  const year = state.year;
  const progress = (year - p.startYear) / Math.max(1, p.endYear - p.startYear);
  const ext = state as SimState & Record<string, number>;
  const real = p.realSeries.find((r) => r.year === year) ?? { year, gdp: state.gdp, pop: state.pop, out: 0 };
  const realPrev = p.realSeries.find((r) => r.year === year - 1) ?? real;

  /* 1. 财政支出结算 */
  let spentTotal = 0;
  const spend = (v: number) => { const s = Math.max(0, v); spentTotal += s; return s; };
  const sIndustry = spend(policy.industry);
  const sTransform = spend(policy.transform);
  const sInfra = spend(policy.infra);
  const sLivelihood = spend(policy.livelihood);
  const sEnv = spend(policy.environment);

  /* 2. 资源：真实产量路径为基准，扩产加速耗竭 / 限产保储（增长叙事城市无资源闸门） */
  const intensity = sIndustry / (real.gdp + 1);
  if (p.growthMode) {
    state.resourceLeft = 1;
    ext._momentum = 0;
    ext._prevRealOut = real.out;
  } else {
    const realDepletion = Math.max(0, (ext._prevRealOut - real.out)) * p.reserveK; // 真实路径本年消耗
    const extraDepletion = Math.max(0, ext._momentum) * 0.018 + intensity * 0.06;
    const conserve = Math.max(0, -ext._momentum) * 0.012;
    ext._prevRealOut = real.out;
    state.resourceLeft = clamp01(state.resourceLeft - realDepletion - extraDepletion + conserve);
    // 扩产动能：投入提升当期产量，随时间衰减
    ext._momentum = clamp(ext._momentum * 0.82 + intensity * 0.9 - 0.01, -0.35, 0.55);
  }

  /* 3. 经济：真实GDP ×（资源份额 × 产量闸门）× 乘数演化 + 转型产出 */
  // 资源份额：仅主导产业占比部分受储量闸门影响（多元化后期不再被整体惩罚）
  const resShare = p.growthMode ? 0 : Math.min(0.55, real.out * 1.1);
  const gate = p.growthMode
    ? 1
    : real.out > 0.04
      ? Math.max(0.2, Math.min(1.1, (1 + Math.max(-0.5, ext._momentum)) * Math.sqrt(Math.max(0.02, state.resourceLeft)) / Math.max(0.25, Math.min(1, real.out * 8 + 0.25))))
      : 1;
  // 转型积累（折旧随经济规模）
  state.transformStock = Math.max(0, state.transformStock + sTransform * 0.92 - newGdpPrev(state) * 0.006);
  const transformGdp = Math.min(state.transformStock * 0.2, real.gdp * 0.35);
  // gdpMult 演化：投资推动（上限+0.9%/年），放任 -0.7%/年，向 1 回归
  const investPush = (sTransform * 0.5 + sIndustry * 0.25 + sInfra * 0.2) / (real.gdp + 1);
  ext._gdpMult = clamp(ext._gdpMult * (1 + Math.min(0.009, investPush) - (spentTotal < state.fiscal * 0.35 ? 0.007 : 0)) * (1 + Math.max(0, ext._gdpMult - 1) * -0.045), 0.55, 1.7);
  let newGdp = Math.max(0.02, real.gdp * (1 - resShare + resShare * gate) * ext._gdpMult + transformGdp);
  if (state.environment < 30) newGdp *= 0.985; // 环境恶化拖累

  /* 4. 财政 */
  const taxIncome = newGdp * 0.085 + state.reserve * 0.02;
  let newFiscal = Math.max(0, state.fiscal + taxIncome);
  newFiscal += state.reserve; state.reserve = 0;
  const sReserve = Math.min(Math.max(0, newFiscal - spentTotal), Math.max(0, policy.reserve));
  newFiscal = Math.max(0, newFiscal - spentTotal - sReserve);
  state.reserve = sReserve;

  /* 5. 社会指标（收益边际递减：越接近满值越难提升；GDP 规模污染设上限防大城崩溃） */
  const envGain = sEnv > 0 ? Math.min(4, sEnv / (real.gdp + 1) * 260 + 0.4) * (1 - state.environment / 105) : 0;
  state.environment = clamp(state.environment + envGain - 0.7 - (sIndustry > 0 ? intensity * 10 : 0) - Math.min(2, newGdp * 0.002) + (real.out < 0.1 ? 0.3 : 0), 0, 100);
  const livGain = sLivelihood > 0 ? Math.min(3.5, sLivelihood / (real.gdp + 1) * 240 + 0.5) * (1 - state.livelihood / 105) : 0;
  state.livelihood = clamp(state.livelihood + livGain - 0.85 + (state.unemployment > 0.16 ? -1 : 0.25), 0, 100);
  const diversityTarget = clamp(8 + (state.transformStock / Math.max(0.5, p.peakGdpReal * 0.22)) * 85, 0, 100);
  state.diversification = clamp(state.diversification + (diversityTarget - state.diversification) * 0.3, 0, 100);
  state.unemployment = clamp(0.04 + Math.max(0, resShare * (1 - gate)) * 0.55 + Math.max(0, -ext._momentum) * 0.2 - state.diversification * 0.0022, 0.01, 0.5);

  /* 6. 人口：真实人口 × 偏离乘数（就业 pulls / 衰退 pushes，双向钳制） */
  const realGrowth = real.pop / Math.max(1, realPrev.pop) - 1;
  const jobPull = Math.max(0, 0.08 - state.unemployment) * 0.1; // 就业充裕吸引迁入
  const declinePush = Math.max(0, resShare) * Math.max(0, 1 - gate) * 0.22; // 资源衰退驱动外流
  const migrationRate = clamp(
    jobPull - declinePush + clamp((state.livelihood - 50) * 0.0006, -0.008, 0.008) - (state.environment < 35 ? 0.004 : 0) - Math.max(0, state.vacancy - 0.3) * 0.02,
    -0.05, 0.026,
  );
  ext._popMult = p.growthMode
    ? clamp(ext._popMult * (1 + migrationRate) / (1 + realGrowth), 0.75, 1.6)
    : clamp(ext._popMult * (1 + migrationRate) / (1 + realGrowth), 0.5, 1.5);
  state.pop = Math.max(300, Math.round(real.pop * ext._popMult));

  /* 7. 空间：建成区锚定真实曲线 + 基建偏移；空置率锚定真实曲线 + 人口/基建偏离 */
  const realBuilt = lerpAt(city.space_timeline ?? [], year, (s) => s.year, (s) => Number(s.built ?? s.old_area ?? 0) || 0);
  const realVac = lerpAt(city.space_timeline ?? [], year, (s) => s.year, (s) => Number(s.vacancy ?? s.vacant ?? 0) || 0);
  ext._infraExtra = Math.max(0, (ext._infraExtra ?? 0) * 0.96 + sInfra * 0.12);
  state.builtArea = Math.max(0.5, realBuilt * clamp(ext._popMult, 0.7, 1.4) + (ext._infraExtra ?? 0));
  const demandArea = state.pop / 13000;
  const oversupply = Math.max(0, (state.builtArea - demandArea) / Math.max(state.builtArea, 1));
  state.vacancy = clamp01(realVac * clamp(2 - ext._popMult, 0.6, 1.5) + oversupply * 0.35);

  /* 8. 事件 */
  const events: SimEventOutcome[] = [];
  for (const he of p.histEvents) {
    if (he.year === year) events.push({ id: `hist-${year}`, title: he.title, desc: he.desc, kind: "history" });
  }
  if (rng() < 0.32) {
    const pool = RANDOM_EVENTS.filter((e) => (e.minYearProgress ?? 0) <= progress);
    if (pool.length) {
      const pick = pool[Math.floor(rng() * pool.length)];
      // chosenIndex 留空：玩家做出选择前，报表不显示"你选择了…"（applyChoiceEffects 回填）
      events.push({ id: `${pick.id}-${year}`, title: pick.title, desc: pick.desc, kind: "random", choices: pick.choices });
    }
  }

  /* 9. 写回 */
  state.gdp = Math.round(newGdp * 100) / 100;
  state.fiscal = Math.round(newFiscal * 100) / 100;
  state.history.push({
    year,
    pop: state.pop,
    gdp: state.gdp,
    fiscal: state.fiscal,
    reserve: state.reserve,
    resourceLeft: state.resourceLeft,
    environment: state.environment,
    livelihood: state.livelihood,
    diversification: state.diversification,
    unemployment: state.unemployment,
    vacancy: state.vacancy,
    builtArea: Math.round(state.builtArea * 10) / 10,
    events,
    headline: events[0]?.title ?? headlineFor(state, p, year),
  });
  state.year = year + 1;
  if (state.year > p.endYear) {
    state.finished = true;
    state.ending = judgeEnding(state, city);
  }
  return state;
}

function newGdpPrev(state: SimState): number {
  const h = state.history[state.history.length - 1];
  return h?.gdp ?? state.gdp;
}

function headlineFor(state: SimState, p: CitySimParams, year: number): string {
  if (p.growthMode) {
    if (state.diversification > 60) return `新兴产业集聚成势，增长引擎持续换挡升级`;
    if (state.environment < 35) return `高速扩张带来环境代价，治理欠账开始显现`;
    if (state.livelihood < 40) return `公共服务跟不上人口流入，民生诉求增多`;
    const h = state.history[state.history.length - 1];
    return `${year}年：${h == null || state.gdp >= h.gdp ? "经济高速增长" : "增速有所放缓"}，城市能级持续跃升`;
  }
  if (state.resourceLeft < 0.15) return `${p.primaryLabel}濒临枯竭，转型刻不容缓`;
  if (state.diversification > 60) return `接续产业渐成气候，经济结构持续优化`;
  if (state.unemployment > 0.2) return `就业压力增大，人口外流加速`;
  if (state.environment < 35) return `环境污染问题突出，居民反映强烈`;
  const h = state.history[state.history.length - 1];
  return `${year}年：${h == null || state.gdp >= h.gdp ? "经济平稳运行" : "增长放缓"}，${p.primaryLabel}仍占主导`;
}

/* ---------------- 事件选择结算 ---------------- */
export function applyChoiceEffects(state: SimState, outcome: SimEventOutcome, choiceIndex: number): SimState {
  const choices = outcome.choices;
  if (!choices || !choices[choiceIndex]) return state;
  const e = choices[choiceIndex].effects as Partial<Record<string, number>>;
  const ext = state as SimState & Record<string, number>;
  if (e.fiscal) state.fiscal = Math.max(0, state.fiscal + e.fiscal);
  if (e.environment) state.environment = clamp(state.environment + e.environment, 0, 100);
  if (e.livelihood) state.livelihood = clamp(state.livelihood + e.livelihood, 0, 100);
  if (e.diversification) state.diversification = clamp(state.diversification + e.diversification, 0, 100);
  if (e.resource) state.resourceLeft = clamp01(state.resourceLeft + e.resource);
  if (e.gdpMult) ext._gdpMult = clamp(ext._gdpMult * (1 + e.gdpMult), 0.55, 1.7);
  if (e.popMult) ext._popMult = clamp(ext._popMult * (1 + e.popMult), 0.45, 2.4);
  const last = state.history[state.history.length - 1];
  if (last) {
    const ev = last.events.find((x) => x.id === outcome.id);
    if (ev) { ev.chosenIndex = choiceIndex; ev.desc = `${choices[choiceIndex].label}：${choices[choiceIndex].desc}`; }
  }
  return state;
}

/* ---------------- 结局评定 ---------------- */
export function judgeEnding(state: SimState, city: CityData): SimEnding {
  const p = calibrate(city);
  const gdpVsReal = state.gdp / Math.max(p.finalGdpReal, 0.5);
  const popVsReal = state.pop / Math.max(p.finalPopReal, 1);
  const score =
    clamp01(gdpVsReal / 1.25) * 26 +
    clamp01(popVsReal / 1.1) * 22 +
    (state.environment / 100) * 18 +
    (state.livelihood / 100) * 16 +
    (state.diversification / 100) * 12 +
    clamp01(state.resourceLeft + 0.1) * 6;
  const total = Math.round(score);
  let grade: SimEnding["grade"];
  let title: string;
  let detail: string;
  if (p.growthMode) {
    if (total >= 82) { grade = "S"; title = "时代标杆之城"; detail = "增长赛道上你交出了超额答卷：产业能级、民生保障、环境品质全面领先，成为同类城市争相学习的样板。"; }
    else if (total >= 68) { grade = "A"; title = "稳健增长之城"; detail = "高增长时代稳稳踩住节拍：新兴产业挑起大梁，公共服务跟上了人口涌入，城市在聚光灯下保持了自己的节奏。"; }
    else if (total >= 52) { grade = "B"; title = "发展放缓之城"; detail = "增长的天花板渐渐显现：接续动能培育偏慢、财政长期紧平衡。城市仍在向前，但与领跑者的差距在被拉开。"; }
    else if (total >= 36) { grade = "C"; title = "掉队之城"; detail = "政策摇摆错失了发展窗口，人口与产业加速流向更亮的地方，城市在区域竞争中逐渐边缘化。"; }
    else { grade = "D"; title = "错失时代之城"; detail = "大潮奔涌而来，这座城却在观望中错过了整个时代——机遇从不等待犹豫的人。"; }
  } else if (total >= 82) { grade = "S"; title = "转型典范之城"; detail = "你带领城市完成了从资源依赖到多元经济的惊险一跃，人口、环境、民生全面向好，被列为全国资源型城市转型样板。"; }
  else if (total >= 68) { grade = "A"; title = "平稳过渡之城"; detail = "主产业衰退的冲击被成功吸收，新兴产业挑起大梁，城市虽然不复巅峰荣光，但烟火气仍在延续。"; }
  else if (total >= 52) { grade = "B"; title = "艰难维持之城"; detail = "转型起步晚、步子慢，财政长期紧平衡。城市在阵痛中蹒跚前行，避免了最坏的结局。"; }
  else if (total >= 36) { grade = "C"; title = "衰退收缩之城"; detail = "资源枯竭后接续产业未能及时接棒，人口持续外流，城区出现明显收缩，留下大量空置房屋。"; }
  else { grade = "D"; title = "被遗忘的矿区"; detail = "单一的兴衰周期无情碾过：矿竭城空，人去楼空。你的城市成了教科书上『资源诅咒』的又一个注脚。"; }
  const vsReal = `真实历史中，${city.profile.name}终点人口为${(p.finalPopReal / 10000).toFixed(1)}万、GDP约${p.finalGdpReal.toFixed(0)}亿元。你的经营结果：人口${(state.pop / 10000).toFixed(1)}万（真实的${Math.round(popVsReal * 100)}%）、GDP${state.gdp.toFixed(0)}亿元（真实的${Math.round(gdpVsReal * 100)}%）。`;
  return { grade, score: total, title, detail, vsReal };
}

/* ---------------- 工具 ---------------- */
function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }
function clamp01(v: number) { return clamp(v, 0, 1); }

/* ---------------- 诊断排序评分 ---------------- */
export function scoreDiagnosis(userOrder: string[], factors: { id: string; weight: number }[]): { match: number; detail: { id: string; correctWeight: number; userRank: number; trueRank: number }[] } {
  const trueOrder = [...factors].sort((a, b) => b.weight - a.weight).map((f) => f.id);
  const n = factors.length;
  let concordant = 0, total = 0;
  const posOf = new Map(userOrder.map((id, i) => [id, i]));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      total++;
      const a = trueOrder[i], b = trueOrder[j];
      if ((posOf.get(a) ?? 99) < (posOf.get(b) ?? 99)) concordant++;
    }
  const match = total ? Math.round((concordant / total) * 100) : 0;
  const detail = factors.map((f) => ({
    id: f.id,
    correctWeight: f.weight,
    userRank: posOf.get(f.id) ?? -1,
    trueRank: trueOrder.indexOf(f.id),
  }));
  return { match, detail };
}

/* ---------------- 产业链拼图评分 ---------------- */
export function scoreChainPuzzle(userOrder: string[], correctOrder: string[]): number {
  let hit = 0;
  userOrder.forEach((id, i) => { if (id === correctOrder[i]) hit++; });
  return Math.round((hit / Math.max(1, correctOrder.length)) * 100);
}
