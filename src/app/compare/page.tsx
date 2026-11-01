"use client";

/**
 * 双城对比 — 同步时间轴 + 人口/GDP 曲线叠加 + 衰落因子雷达 + 事件对比
 */
import * as React from "react";
import Link from "next/link";
import { CITY_LIST } from "@/data/cities";
import { EChart } from "@/components/EChart";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { buildSeries, getYearSnapshot } from "@/lib/engine/interp";
import { recordCompared, recordVisit } from "@/lib/progress";
import { onCompareUsed, onCityVisit } from "@/lib/achievements";
import { audio } from "@/lib/audio";
import { fmtPop, fmtGdp } from "@/lib/utils";
import { ArrowLeft, Swords } from "lucide-react";

const COLORS = ["#eab308", "#22d3ee"];

export default function ComparePage() {
  const [aKey, setAKey] = React.useState("yumen");
  const [bKey, setBKey] = React.useState("hegang");
  const [year, setYear] = React.useState(2000);

  const a = CITY_LIST.find((c) => c.key === aKey)!.data;
  const b = CITY_LIST.find((c) => c.key === bKey)!.data;

  React.useEffect(() => {
    recordCompared();
    recordVisit(aKey);
    recordVisit(bKey);
    onCompareUsed();
    onCityVisit(a);
    onCityVisit(b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = Math.max(a.config.timeRange.start, b.config.timeRange.start);
  const end = Math.min(a.config.timeRange.end, b.config.timeRange.end);
  const snapA = getYearSnapshot(a, Math.min(end, Math.max(start, year)));
  const snapB = getYearSnapshot(b, Math.min(end, Math.max(start, year)));

  const curveOption = React.useMemo(() => {
    const sa = buildSeries(a, 2);
    const sb = buildSeries(b, 2);
    return {
      backgroundColor: "transparent",
      grid: { left: 52, right: 52, top: 34, bottom: 24 },
      tooltip: { trigger: "axis", backgroundColor: "rgba(20,22,28,0.94)", borderColor: "rgba(201,168,76,0.4)", textStyle: { color: "#e5e7eb", fontSize: 11 } },
      legend: { data: [`${a.profile.name}人口`, `${b.profile.name}人口`], top: 4, textStyle: { color: "#94a3b8", fontSize: 10 } },
      xAxis: { type: "category", data: sa.years.map(String), axisLabel: { color: "#64748b", fontSize: 9 } },
      yAxis: [
        { type: "value", name: "人口(万)", axisLabel: { color: "#94a3b8", fontSize: 9, formatter: (v: number) => (v >= 10000 ? (v / 10000).toFixed(0) + "万" : String(v)) }, splitLine: { lineStyle: { color: "rgba(30,41,59,0.7)" } }, nameTextStyle: { color: "#64748b", fontSize: 9 } },
        { type: "value", name: "GDP(亿)", axisLabel: { color: "#94a3b8", fontSize: 9 }, splitLine: { show: false }, nameTextStyle: { color: "#64748b", fontSize: 9 } },
      ],
      series: [
        { name: `${a.profile.name}人口`, type: "line", data: sa.pop, smooth: true, symbol: "none", lineStyle: { color: COLORS[0], width: 2 }, itemStyle: { color: COLORS[0] } },
        { name: `${b.profile.name}人口`, type: "line", data: sb.pop, smooth: true, symbol: "none", lineStyle: { color: COLORS[1], width: 2 }, itemStyle: { color: COLORS[1] } },
        { type: "line", data: sa.gdp, yAxisIndex: 1, smooth: true, symbol: "none", lineStyle: { color: COLORS[0], width: 1.4, type: "dashed", opacity: 0.7 }, itemStyle: { color: COLORS[0] } },
        { type: "line", data: sb.gdp, yAxisIndex: 1, smooth: true, symbol: "none", lineStyle: { color: COLORS[1], width: 1.4, type: "dashed", opacity: 0.7 }, itemStyle: { color: COLORS[1] } },
        { type: "line", data: [], markLine: { silent: true, symbol: "none", data: [{ xAxis: String(Math.min(end, Math.max(start, year))) }], lineStyle: { color: "#fbbf24", type: "dashed", width: 1.6 }, label: { show: false } } },
      ],
    };
  }, [a, b, year, start, end]);

  const radarOption = React.useMemo(() => {
    const indicators = [
      { name: "人口留存", max: 100 },
      { name: "经济规模", max: 100 },
      { name: "转型成效", max: 100 },
      { name: "时间跨度", max: 100 },
      { name: "空间扩张", max: 100 },
    ];
    const valueOf = (city: typeof a) => {
      const tl = city.timeline;
      const peakPop = Math.max(...tl.map((t) => t.pop ?? 0));
      const lastPop = tl.at(-1)?.pop ?? 0;
      const peakGdp = Math.max(...tl.map((t) => Number(t.gdp ?? 0)));
      const lastGdp = Number(tl.at(-1)?.gdp ?? 0);
      const transformEvents = tl.filter((t) => t.category === "transformation").length;
      const span = city.config.timeRange.end - city.config.timeRange.start;
      const maxArea = Math.max(1, ...city.space_timeline.map((s) => Number(s.new_area ?? 0) + Number(s.built ?? s.old_area ?? 0)));
      return [
        Math.round((lastPop / peakPop) * 100),
        Math.round(Math.min(100, (lastGdp / Math.max(peakGdp, 1)) * 100)),
        Math.min(100, transformEvents * 25),
        Math.min(100, Math.round((span / 120) * 100)),
        Math.min(100, Math.round(maxArea / 3)),
      ];
    };
    return {
      backgroundColor: "transparent",
      tooltip: {},
      legend: { data: [a.profile.name, b.profile.name], bottom: 0, textStyle: { color: "#94a3b8", fontSize: 10 } },
      radar: { indicator: indicators, splitArea: { areaStyle: { color: ["rgba(30,34,44,0.4)", "rgba(30,34,44,0.2)"] } }, axisLine: { lineStyle: { color: "rgba(201,168,76,0.25)" } }, splitLine: { lineStyle: { color: "rgba(201,168,76,0.2)" } }, axisName: { color: "#94a3b8", fontSize: 10 } },
      series: [{
        type: "radar",
        data: [
          { value: valueOf(a), name: a.profile.name, lineStyle: { color: COLORS[0] }, itemStyle: { color: COLORS[0] }, areaStyle: { color: "rgba(234,179,8,0.15)" } },
          { value: valueOf(b), name: b.profile.name, lineStyle: { color: COLORS[1] }, itemStyle: { color: COLORS[1] }, areaStyle: { color: "rgba(34,211,238,0.15)" } },
        ],
      }],
    };
  }, [a, b]);

  const eventsA = a.timeline.filter((t) => t.event);
  const eventsB = b.timeline.filter((t) => t.event);
  const allYears = [...new Set([...eventsA.map((e) => e.year), ...eventsB.map((e) => e.year)])].sort((x, y) => x - y);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button variant="ghost" size="iconSm" asChild><Link href="/"><ArrowLeft className="size-4" /></Link></Button>
          <Swords className="size-5 text-amber-400" />
          <h1 className="title-font text-base font-bold text-amber-100 sm:text-lg">双城对比模式</h1>
          <div className="ml-auto flex items-center gap-2">
            <CitySelect value={aKey} onChange={(v) => { setAKey(v); audio.play("click"); }} exclude={bKey} />
            <span className="text-xs text-muted-foreground">vs</span>
            <CitySelect value={bKey} onChange={(v) => { setBKey(v); audio.play("click"); }} exclude={aKey} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-3 p-3 sm:p-4">
        {/* 同步快照 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <CitySnapshot city={a} snap={snapA} color={COLORS[0]} />
          <div className="flex items-center justify-center">
            <div className="rounded-full border border-border bg-card px-3 py-1.5 text-center">
              <div className="year-display text-xl">{Math.min(end, Math.max(start, year))}</div>
              <div className="text-[9px] text-muted-foreground">同步年份</div>
            </div>
          </div>
          <CitySnapshot city={b} snap={snapB} color={COLORS[1]} align="right" />
        </div>

        {/* 同步时间轴 */}
        <div className="panel p-3.5">
          <Slider value={[Math.min(end, Math.max(start, year))]} min={start} max={end} step={1} onValueChange={([v]) => { setYear(v); audio.play("slide"); }} />
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground"><span>{start}</span><span>重叠期 {start}—{end}</span><span>{end}</span></div>
        </div>

        {/* 图表区 */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="panel p-3.5">
            <h3 className="panel-title mb-1">人口 / GDP 轨迹叠加</h3>
            <p className="mb-1 text-[10px] text-muted-foreground">实线=人口（左轴），虚线=GDP（右轴）</p>
            <EChart option={curveOption} className="h-64 w-full" notMerge={false} />
          </div>
          <div className="panel p-3.5">
            <h3 className="panel-title mb-1">衰落因子雷达</h3>
            <EChart option={radarOption} className="h-64 w-full" notMerge={false} />
          </div>
        </div>

        {/* 事件对比 */}
        <div className="panel p-3.5">
          <h3 className="panel-title mb-3">事件时间线对比</h3>
          <div className="space-y-1">
            {allYears.map((y) => {
              const ea = eventsA.find((e) => e.year === y);
              const eb = eventsB.find((e) => e.year === y);
              if (!ea && !eb) return null;
              return (
                <div key={y} className="grid grid-cols-[52px_1fr_1fr] items-start gap-2 rounded border border-border/40 bg-secondary/30 p-2 text-[11px]">
                  <span className="font-bold tabular-nums text-amber-400">{y}</span>
                  <div className={ea ? "text-foreground/85" : "text-muted-foreground/40"}>{ea ? <>🟡 {ea.title}</> : "—"}</div>
                  <div className={eb ? "text-foreground/85" : "text-muted-foreground/40"}>{eb ? <>🔵 {eb.title}</> : "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function CitySelect({ value, onChange, exclude }: { value: string; onChange: (v: string) => void; exclude: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
    >
      {CITY_LIST.filter((c) => c.key !== exclude).map((c) => (
        <option key={c.key} value={c.key}>{c.data.profile.name}</option>
      ))}
    </select>
  );
}

function CitySnapshot({ city, snap, color, align = "left" }: { city: typeof CITY_LIST[number]["data"]; snap: ReturnType<typeof getYearSnapshot>; color: string; align?: "left" | "right" }) {
  return (
    <div className={`panel p-3.5 ${align === "right" ? "sm:text-right" : ""}`}>
      <div className="mb-1 flex items-center gap-2" style={{ flexDirection: align === "right" ? "row-reverse" : "row" }}>
        <span className="inline-block size-2.5 rounded-full" style={{ background: color }} />
        <h3 className="title-font text-sm font-bold text-foreground">{city.profile.name}</h3>
        <Badge variant="peak">{city.profile.province}</Badge>
      </div>
      <p className="mb-2 line-clamp-2 text-[11px] text-muted-foreground">{city.profile.description}</p>
      <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
        <div className="rounded bg-secondary/60 p-1.5"><div className="text-muted-foreground">人口</div><div className="font-bold">{fmtPop(snap.pop)}</div></div>
        <div className="rounded bg-secondary/60 p-1.5"><div className="text-muted-foreground">GDP</div><div className="font-bold">{fmtGdp(snap.gdp)}</div></div>
        <div className="rounded bg-secondary/60 p-1.5"><div className="text-muted-foreground">主导产业</div><div className="truncate font-bold" title={city.config.primaryIndicators[0]?.label}>{city.config.primaryIndicators[0]?.label ?? "—"}</div></div>
      </div>
    </div>
  );
}
