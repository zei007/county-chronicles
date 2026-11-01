/**
 * interp.ts — 时间轴插值与派生指标
 * 与参考实现 city-core.getYearData 等价，但补全了空间/指标插值与趋势计算。
 */
import type { CityData, TimelineEntry, SpaceEntry } from "@/lib/types";

const NUM_FIELDS_HINT = ["pop", "gdp"] as const;

export interface YearSnapshot {
  year: number;
  pop: number;
  gdp: number;
  indicators: Record<string, number>;
  event: TimelineEntry | null;
  prevAnchor: TimelineEntry;
  nextAnchor: TimelineEntry;
  ratio: number;
  space: { oldArea: number; newArea: number; built: number; vacancy: number };
}

/** 任意年份快照（线性插值） */
export function getYearSnapshot(city: CityData, year: number): YearSnapshot {
  const tl = city.timeline;
  let before = tl[0];
  let after = tl[tl.length - 1];
  for (let i = 0; i < tl.length - 1; i++) {
    if (year >= tl[i].year && year <= tl[i + 1].year) { before = tl[i]; after = tl[i + 1]; break; }
  }
  if (year < tl[0].year) { before = after = tl[0]; }
  if (year > tl[tl.length - 1].year) { before = after = tl[tl.length - 1]; }
  const ratio = before.year === after.year ? 0 : (year - before.year) / (after.year - before.year);
  const lerp = (a: number | undefined, b: number | undefined) =>
    a == null || b == null ? (a ?? b ?? 0) : a + (b - a) * ratio;

  const indicators: Record<string, number> = {};
  for (const ind of city.config.primaryIndicators) {
    indicators[ind.key] = Math.round(lerp(Number(before[ind.key] ?? 0), Number(after[ind.key] ?? 0)) * 10) / 10;
  }
  const space = getSpaceAt(city, year);
  return {
    year,
    pop: Math.round(lerp(before.pop, after.pop)),
    gdp: Math.round(lerp(Number(before.gdp ?? 0), Number(after.gdp ?? 0)) * 10) / 10,
    indicators,
    event: before.event && year === before.year ? before : after.event && year === after.year ? after : null,
    prevAnchor: before,
    nextAnchor: after,
    ratio,
    space,
  };
}

/** 空间数据标准化（兼容 dual_city 与 built_up 两种字段模型） */
export function normSpace(s: SpaceEntry) {
  return {
    oldArea: Number(s.old_area ?? s.built ?? 0),
    newArea: Number(s.new_area ?? 0),
    built: Number(s.built ?? s.old_area ?? 0),
    vacancy: Number(s.vacancy ?? s.vacant ?? 0),
    pop: Number(s.old_pop ?? s.density ?? 0),
  };
}

export function getSpaceAt(city: CityData, year: number) {
  const st = city.space_timeline ?? [];
  if (!st.length) return { oldArea: 0, newArea: 0, built: 0, vacancy: 0 };
  let before = st[0], after = st[st.length - 1];
  for (let i = 0; i < st.length - 1; i++) {
    if (year >= st[i].year && year <= st[i + 1].year) { before = st[i]; after = st[i + 1]; break; }
  }
  if (year <= st[0].year) before = after = st[0];
  if (year >= st[st.length - 1].year) before = after = st[st.length - 1];
  const ratio = before.year === after.year ? 0 : (year - before.year) / (after.year - before.year);
  const b = normSpace(before), a = normSpace(after);
  return {
    oldArea: Math.round((b.oldArea + (a.oldArea - b.oldArea) * ratio) * 10) / 10,
    newArea: Math.round((b.newArea + (a.newArea - b.newArea) * ratio) * 10) / 10,
    built: Math.round((b.built + (a.built - b.built) * ratio) * 10) / 10,
    vacancy: Math.round((b.vacancy + (a.vacancy - b.vacancy) * ratio) * 1000) / 1000,
  };
}

/** 图表数据序列（隔 step 年采样） */
export function buildSeries(city: CityData, step = 2) {
  const { start, end } = city.config.timeRange;
  const years: number[] = [];
  const pop: number[] = [];
  const gdp: number[] = [];
  const indicators: Record<string, number[]> = {};
  city.config.primaryIndicators.forEach((i) => (indicators[i.key] = []));
  for (let y = start; y <= end; y += step) {
    const s = getYearSnapshot(city, y);
    years.push(y); pop.push(s.pop); gdp.push(s.gdp);
    city.config.primaryIndicators.forEach((i) => indicators[i.key].push(s.indicators[i.key]));
  }
  return { years, pop, gdp, indicators };
}

/** 获取当前年份所处阶段 */
export function phaseOf(city: CityData, year: number) {
  return city.config.phases.find((p) => year >= p.start && year <= p.end) ?? city.config.phases[0];
}

export { NUM_FIELDS_HINT };
