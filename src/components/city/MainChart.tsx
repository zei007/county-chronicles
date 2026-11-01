"use client";

/**
 * MainChart.tsx — 城市探索页主图表（综合趋势 / 产业结构 / 空间对比）
 */
import * as React from "react";
import { EChart } from "@/components/EChart";
import type { CityData } from "@/lib/types";
import { buildSeries, getSpaceAt } from "@/lib/engine/interp";

const GOLD = "#c9a84c";
const BLUE = "#3b82f6";

export function buildChartOption(city: CityData, type: "combined" | "industry" | "space", currentYear: number): Record<string, unknown> {
  if (type === "combined") {
    const { years, pop, gdp, indicators } = buildSeries(city, 2);
    const inds = city.config.primaryIndicators;
    return {
      backgroundColor: "transparent",
      animationDuration: 400,
      grid: { left: 58, right: 56, top: 44, bottom: 42 },
      tooltip: { trigger: "axis", axisPointer: { type: "cross" }, backgroundColor: "rgba(20,22,28,0.94)", borderColor: "rgba(201,168,76,0.4)", textStyle: { color: "#e5e7eb", fontSize: 12 } },
      legend: { data: ["人口", ...inds.map((i) => i.label), "GDP"], bottom: 0, top: "auto", type: "scroll", icon: "roundRect", itemWidth: 12, itemHeight: 7, itemGap: 8, textStyle: { color: "#94a3b8", fontSize: 10 } },
      xAxis: {
        type: "category", data: years,
        axisLine: { lineStyle: { color: "#475569" } },
        axisLabel: { color: "#64748b", fontSize: 10 },
      },
      yAxis: [
        { type: "value", name: "人口(万)", position: "left", axisLabel: { color: "#94a3b8", fontSize: 10, formatter: (v: number) => (v >= 10000 ? (v / 10000).toFixed(0) + "万" : String(v)) }, splitLine: { lineStyle: { color: "rgba(30,41,59,0.8)" } }, nameTextStyle: { color: "#64748b" } },
        { type: "value", name: `${inds.map((i) => i.label).join("/")}/GDP`, position: "right", axisLabel: { color: "#94a3b8", fontSize: 10 }, splitLine: { show: false }, nameTextStyle: { color: "#64748b" } },
      ],
      series: [
        {
          name: "人口", type: "line", data: pop, smooth: true, yAxisIndex: 0,
          lineStyle: { color: GOLD, width: 2 }, itemStyle: { color: GOLD },
          areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(201,168,76,0.25)" }, { offset: 1, color: "rgba(201,168,76,0)" }] } },
          markLine: { silent: true, symbol: "none", data: [{ xAxis: currentYear }], lineStyle: { color: GOLD, width: 1.6, type: "dashed" }, label: { show: false } },
        },
        ...inds.map((ind) => ({
          name: ind.label, type: "line", data: indicators[ind.key], smooth: true, yAxisIndex: 1,
          lineStyle: { color: ind.color, width: 2 }, itemStyle: { color: ind.color },
        })),
        { name: "GDP", type: "line", data: gdp, smooth: true, yAxisIndex: 1, lineStyle: { color: BLUE, width: 2, type: "dashed" }, itemStyle: { color: BLUE } },
        {
          type: "scatter", z: 10, symbolSize: 8,
          data: years.map((y) => {
            const t = city.timeline.find((x) => x.year === y);
            return t?.event ? { value: [y, pop[years.indexOf(y)]], title: t.title } : null;
          }).filter(Boolean),
          itemStyle: { color: GOLD, borderColor: "#fff", borderWidth: 1.5 },
          tooltip: { formatter: (p: { data: { title?: string; value: [string, number] } }) => `<b>${p.data.title ?? ""}</b><br/>人口 ${(p.data.value[1] / 10000).toFixed(1)}万` },
        },
      ],
    };
  }

  if (type === "industry") {
    const { start, end } = city.config.timeRange;
    const inds = city.config.primaryIndicators;
    const years: number[] = [];
    const rows: { year: number; shares: Record<string, number>; other: number }[] = [];
    for (let y = start; y <= end; y += 5) {
      const s = getSpaceAt(city, y);
      void s;
      const snap = getYearSnapshotSafe(city, y);
      let used = 0;
      const shares: Record<string, number> = {};
      inds.forEach((ind, idx) => {
        const maxV = ind.max || 100;
        const share = Math.max(0, Math.min(100 - used, (snap.indicators[ind.key] ?? 0) / maxV * (60 - idx * 20)));
        shares[ind.key] = Math.round(share);
        used += share;
      });
      years.push(y);
      rows.push({ year: y, shares, other: Math.round(100 - used) });
    }
    return {
      backgroundColor: "transparent",
      animationDuration: 400,
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: "rgba(20,22,28,0.94)", borderColor: "rgba(201,168,76,0.4)", textStyle: { color: "#e5e7eb", fontSize: 12 } },
      grid: { left: 46, right: 18, top: 30, bottom: 38 },
      legend: { data: [...inds.map((i) => i.label + "产业"), "其他"], bottom: 0, top: "auto", type: "scroll", icon: "roundRect", itemWidth: 12, itemHeight: 7, itemGap: 8, textStyle: { color: "#94a3b8", fontSize: 10 } },
      xAxis: { type: "category", data: years, axisLabel: { color: "#64748b", fontSize: 10 } },
      yAxis: { type: "value", max: 100, axisLabel: { color: "#94a3b8", fontSize: 10, formatter: "{value}%" }, splitLine: { lineStyle: { color: "rgba(30,41,59,0.8)" } } },
      series: [
        ...inds.map((ind) => ({
          name: ind.label + "产业", type: "bar", stack: "total",
          data: rows.map((r) => r.shares[ind.key]), itemStyle: { color: ind.color },
          markLine: { silent: true, symbol: "none", data: [{ xAxis: currentYear }], lineStyle: { color: GOLD, width: 1.6, type: "dashed" }, label: { show: false } },
        })),
        { name: "其他", type: "bar", stack: "total", data: rows.map((r) => r.other), itemStyle: { color: "#475569" } },
      ],
    };
  }

  // space
  const st = city.space_timeline;
  const isDual = city.config.spaceType === "dual_city";
  const rows = st.map((s) => ({
    year: s.year,
    old: Number(s.old_area ?? s.built ?? 0),
    new: Number(s.new_area ?? 0),
    vacancy: Math.round(Number(s.vacancy ?? s.vacant ?? 0) * 100),
  }));
  const legendData = isDual ? ["老城面积", "新城面积", "空置率"] : ["建成区面积", "空置率"];
  return {
    backgroundColor: "transparent",
    animationDuration: 400,
    tooltip: { trigger: "axis", backgroundColor: "rgba(20,22,28,0.94)", borderColor: "rgba(201,168,76,0.4)", textStyle: { color: "#e5e7eb", fontSize: 12 } },
    grid: { left: 46, right: 44, top: 30, bottom: 38 },
    legend: { data: legendData, bottom: 0, top: "auto", type: "scroll", icon: "roundRect", itemWidth: 12, itemHeight: 7, itemGap: 8, textStyle: { color: "#94a3b8", fontSize: 10 } },
    xAxis: { type: "category", data: rows.map((r) => r.year), axisLabel: { color: "#64748b", fontSize: 10 } },
    yAxis: [
      { type: "value", name: "面积(km²)", axisLabel: { color: "#94a3b8", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(30,41,59,0.8)" } }, nameTextStyle: { color: "#64748b" } },
      { type: "value", name: "空置率", axisLabel: { color: "#94a3b8", fontSize: 10, formatter: "{value}%" }, splitLine: { show: false }, nameTextStyle: { color: "#64748b" } },
    ],
    series: [
      { name: isDual ? "老城面积" : "建成区面积", type: "bar", data: rows.map((r) => r.old), itemStyle: { color: "#e05252", opacity: 0.75 } },
      ...(isDual ? [{ name: "新城面积", type: "bar", data: rows.map((r) => r.new), itemStyle: { color: "#34d399", opacity: 0.75 } }] : []),
      {
        name: "空置率", type: "line", yAxisIndex: 1, data: rows.map((r) => r.vacancy),
        itemStyle: { color: "#f87171" }, lineStyle: { width: 2.5 },
        markLine: { silent: true, symbol: "none", data: [{ xAxis: currentYear }], lineStyle: { color: GOLD, width: 1.6, type: "dashed" }, label: { show: false } },
      },
    ],
  };
}

function getYearSnapshotSafe(city: CityData, year: number) {
  // 局部引用避免循环依赖
  const tl = city.timeline;
  let before = tl[0], after = tl[tl.length - 1];
  for (let i = 0; i < tl.length - 1; i++) {
    if (year >= tl[i].year && year <= tl[i + 1].year) { before = tl[i]; after = tl[i + 1]; break; }
  }
  const ratio = before.year === after.year ? 0 : (year - before.year) / (after.year - before.year);
  const indicators: Record<string, number> = {};
  for (const ind of city.config.primaryIndicators) {
    const a = Number(before[ind.key] ?? 0), b = Number(after[ind.key] ?? 0);
    indicators[ind.key] = Math.round((a + (b - a) * ratio) * 10) / 10;
  }
  return { indicators };
}

export function MainChart({ option }: { option: Record<string, unknown> }) {
  return <EChart option={option} className="h-full min-h-64 w-full" notMerge={false} />;
}
