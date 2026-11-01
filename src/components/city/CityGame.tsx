"use client";

/**
 * CityGame.tsx — 城市探索模式主控（图表/时间轴/事件流/指标/空间/模态框编排）
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CityData } from "@/lib/types";
import { CITY_LIST } from "@/data/cities";
import { getYearSnapshot, phaseOf } from "@/lib/engine/interp";
import { audio } from "@/lib/audio";
import { recordVisit, recordExplore } from "@/lib/progress";
import { onCityVisit, onCityYear, onMigrationView, onSpaceView } from "@/lib/achievements";
import { fmtPop, fmtGdp, fmtNum, fmtPct, trendArrow } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/misc";
import { ArrowLeft, Play, Pause, Link2, Activity, Satellite, Stethoscope, FileArchive, Gamepad2, Map as MapIcon, Swords, Volume2, VolumeX, X } from "lucide-react";
import { IndustryChainModal } from "@/components/city/modals/IndustryChainModal";
import { DiagnosisModal } from "@/components/city/modals/DiagnosisModal";
import { MigrationModal } from "@/components/city/modals/MigrationModal";
import { SpaceMapModal } from "@/components/city/modals/SpaceMapModal";
import { ReportModal } from "@/components/city/modals/ReportModal";
import { MainChart, buildChartOption } from "@/components/city/MainChart";
import * as Dialog from "@/components/ui/dialog";

const TAG_MAP: Record<string, "discovery" | "peak" | "decline" | "relocation" | "transformation" | "culture" | "default"> = {
  discovery: "discovery", peak: "peak", decline: "decline", relocation: "relocation", transformation: "transformation", culture: "culture",
};
const TAG_LABEL: Record<string, string> = {
  discovery: "发现", peak: "鼎盛", decline: "衰败", relocation: "搬迁", transformation: "转型", culture: "文化",
};
const EVENT_ICON: Record<string, string> = {
  discovery: "🛢️", peak: "🏆", decline: "📉", relocation: "🚚", transformation: "♻️", culture: "⭐",
};

const PHASE_COLORS: Record<string, string> = {
  green: "bg-emerald-400", yellow: "bg-amber-400", red: "bg-red-400", teal: "bg-cyan-400", purple: "bg-purple-400", blue: "bg-sky-400", orange: "bg-orange-400",
};

export function CityGame({ city }: { city: CityData }) {
  const router = useRouter();
  const cfg = city.config;
  const { start, end } = cfg.timeRange;
  /** 对照组城市（特区/开放高地）不开放县长生涯：引擎以"资源枯竭"为核心叙事，不适用于上升型城市 */
  const simAvailable = CITY_LIST.some((c) => c.key === cfg.cityKey);
  const [year, setYear] = React.useState(start);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [chartType, setChartType] = React.useState<"combined" | "industry" | "space">("combined");
  const [modal, setModal] = React.useState<"chain" | "diag" | "migra" | "space" | "report" | null>(null);
  const [speedOpen, setSpeedOpen] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(true);
  const [showKbdGuide, setShowKbdGuide] = React.useState(false);

  const snap = React.useMemo(() => getYearSnapshot(city, year), [city, year]);
  const phase = phaseOf(city, year);

  // 首次访问记录 + 成就
  React.useEffect(() => {
    recordVisit(cfg.cityKey);
    onCityVisit(city);
  }, [cfg.cityKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // 年份进度记录 + 年份成就
  React.useEffect(() => {
    recordExplore(cfg.cityKey, { maxYear: year });
    onCityYear(city, year);
  }, [cfg.cityKey, year]); // eslint-disable-line react-hooks/exhaustive-deps

  // 音效开关状态同步（localStorage 可能在挂载前被其它页面改写）
  React.useEffect(() => {
    setSoundOn(audio.enabled);
    // 快捷键引导仅对精确指针设备（桌面）弹出；触屏设备无键盘
    try {
      if (localStorage.getItem("crf.v1.kbdHint") !== "1" && window.matchMedia("(pointer: fine)").matches) setShowKbdGuide(true);
    } catch { /* ignore */ }
  }, []);

  const dismissKbdGuide = () => {
    setShowKbdGuide(false);
    try { localStorage.setItem("crf.v1.kbdHint", "1"); } catch { /* ignore */ }
  };

  const toggleSound = () => setSoundOn(audio.toggle());

  // 播放循环
  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setYear((y) => {
        if (y >= end) { setPlaying(false); audio.play("warning"); return end; }
        audio.play("slide");
        return y + 1;
      });
    }, Math.round(320 / speed));
    return () => clearInterval(id);
  }, [playing, speed, end]);

  // 快捷键（滑块聚焦时交给 Radix 原生键盘处理，避免双重步进）
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.getAttribute?.("role") === "slider" || t.isContentEditable)) return;
      if (e.key === "ArrowLeft") setYear((y) => Math.max(start, y - 1));
      else if (e.key === "ArrowRight") setYear((y) => Math.min(end, y + 1));
      else if (e.key === " ") { e.preventDefault(); togglePlay(); }
      else if (e.key === "i" || e.key === "I") setModal((m) => (m === "chain" ? null : "chain"));
      else if (e.key === "d" || e.key === "D") setModal((m) => (m === "diag" ? null : "diag"));
      else if (e.key === "r" || e.key === "R") setModal((m) => (m === "report" ? null : "report"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, playing]);

  const togglePlay = () => {
    audio.play("play");
    setPlaying((p) => !p);
  };

  const jumpYear = (y: number) => { setPlaying(false); setYear(y); audio.play("click"); };

  const prevPop = React.useMemo(() => getYearSnapshot(city, Math.max(start, year - 1)).pop, [city, start, year]);
  const prevGdp = React.useMemo(() => getYearSnapshot(city, Math.max(start, year - 1)).gdp, [city, start, year]);
  const chartOption = React.useMemo(() => buildChartOption(city, chartType, year), [city, chartType, year]);

  const indList = cfg.primaryIndicators;
  const prevInds = React.useMemo(() => {
    const s = getYearSnapshot(city, Math.max(start, year - 1));
    return s.indicators;
  }, [city, start, year]);

  const isDual = cfg.spaceType === "dual_city";
  const spaceLabels = cfg.spaceLabels ?? {};

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-border/60 bg-background/85 px-3 py-2.5 backdrop-blur-md sm:px-6 sm:py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="iconSm" asChild className="shrink-0">
              <Link href="/"><ArrowLeft className="size-4" /></Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="min-w-0">
              <h1 className="title-font truncate text-sm font-bold text-amber-100 sm:text-lg">
                {city.profile.name} <span className="hidden text-xs font-normal text-muted-foreground sm:inline">{city.profile.province}{city.profile.prefecture ? " · " + city.profile.prefecture : ""}</span>
              </h1>
              <div className="mt-0.5 flex gap-1 overflow-x-auto">
                {city.profile.tags.map((t) => <Badge key={t} variant="peak" className="shrink-0">{t}</Badge>)}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <div className="text-center">
              <div className="year-display tabular-nums">{year}</div>
              <div className="hidden text-[10px] tracking-widest text-amber-600/80 sm:block">{phase?.name ?? ""}</div>
            </div>
            <div className="hidden items-center gap-1.5 md:flex">
              <Button variant="ghost" size="sm" onClick={() => { audio.play("click"); setModal("chain"); }}><Link2 className="size-3.5" /> 产业链</Button>
              <Button variant="ghost" size="sm" onClick={() => { audio.play("click"); setModal("migra"); onMigrationView(); }}><Activity className="size-3.5" /> 人口迁徙</Button>
              <Button variant="ghost" size="sm" onClick={() => { audio.play("click"); setModal("space"); onSpaceView(); }}><Satellite className="size-3.5" /> 空间实景</Button>
              <Button variant="ghost" size="sm" onClick={() => { audio.play("click"); setModal("diag"); }}><Stethoscope className="size-3.5" /> 衰落诊断</Button>
              <Button size="sm" onClick={() => { audio.play("click"); setModal("report"); }}><FileArchive className="size-3.5" /> 生成档案</Button>
              <Button variant="ghost" size="iconSm" title={soundOn ? "关闭音效" : "开启音效"} onClick={toggleSound}>
                {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </Button>
            </div>
            {simAvailable && (
              <Button variant="secondary" size="sm" asChild className="hidden lg:inline-flex">
                <Link href={`/play/${cfg.cityKey}`}><Gamepad2 className="size-3.5" /> 县长生涯</Link>
              </Button>
            )}
          </div>
        </div>
        {/* 移动端工具栏 */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto md:hidden">
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setModal("chain")}>产业链</Button>
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => { setModal("migra"); onMigrationView(); }}>迁徙</Button>
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => { setModal("space"); onSpaceView(); }}>空间实景</Button>
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setModal("diag")}>诊断</Button>
          <Button size="sm" className="shrink-0" onClick={() => setModal("report")}>档案</Button>
          {simAvailable && (
            <Button variant="secondary" size="sm" className="shrink-0" asChild><Link href={`/play/${cfg.cityKey}`}>🎮 经营</Link></Button>
          )}
          <Button variant="ghost" size="sm" className="shrink-0" title={soundOn ? "关闭音效" : "开启音效"} onClick={toggleSound}>
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
        </div>
      </header>

      {/* 主体三栏 */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-3 p-3 sm:p-4 lg:grid-cols-[270px_1fr] xl:grid-cols-[270px_1fr_300px]">
        {/* 左栏：概况 + 指标 + 空间 */}
        <aside className="order-2 flex flex-col gap-3 lg:order-1">
          <div className="panel p-3.5">
            <h3 className="panel-title mb-2">城市概况</h3>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{city.profile.description}</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="rounded bg-secondary/50 p-2"><span className="text-muted-foreground">面积</span><div className="text-foreground/90">{city.profile.area}</div></div>
              <div className="rounded bg-secondary/50 p-2"><span className="text-muted-foreground">现状</span><div className="truncate text-foreground/90" title={cfg.currentStatus}>{cfg.currentStatus}</div></div>
            </div>
          </div>

          <div className="panel p-3.5">
            <h3 className="panel-title mb-3">关键指标</h3>
            <div className="space-y-3">
              <MetricBlock
                label="常住人口" value={fmtPop(snap.pop)} trend={trendArrow(prevPop, snap.pop)}
                barPct={(snap.pop / (city.timeline.reduce((m, t) => Math.max(m, t.pop ?? 0), 0) || 1)) * 100}
              />
              <MetricBlock label="GDP" value={fmtGdp(snap.gdp)} trend={trendArrow(prevGdp, snap.gdp)} />
              {indList.map((ind) => {
                const v = snap.indicators[ind.key] ?? 0;
                const pv = prevInds[ind.key] ?? 0;
                return (
                  <MetricBlock
                    key={ind.key}
                    label={ind.label} value={`${fmtNum(v, 1)} ${ind.unit}`}
                    trend={trendArrow(pv, v)}
                    barPct={(v / (ind.max || 1)) * 100}
                    barColor={ind.color}
                  />
                );
              })}
            </div>
          </div>

          <div className="panel p-3.5">
            <h3 className="panel-title mb-3">空间变迁</h3>
            <div className="space-y-2 text-xs">
              {(isDual ? [
                { label: spaceLabels.old ?? "老城", val: snap.space.oldArea, cls: "bg-red-500/60" },
                { label: spaceLabels.new ?? "新城", val: snap.space.newArea, cls: "bg-emerald-500/60" },
              ] : [
                { label: spaceLabels.built ?? "建成区", val: snap.space.built, cls: "bg-sky-500/60" },
              ]).map((row) => {
                const maxV = Math.max(1, ...city.space_timeline.map((s) => Number(s.new_area ?? 0) + Number(s.built ?? s.old_area ?? 0)));
                return (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="w-12 shrink-0 text-muted-foreground">{row.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className={`h-full rounded-full transition-all duration-500 ${row.cls}`} style={{ width: `${Math.min(100, (row.val / maxV) * 100)}%` }} />
                    </div>
                    <span className="w-14 shrink-0 text-right text-foreground/80">{fmtNum(row.val, 1)} km²</span>
                  </div>
                );
              })}
              <div className="border-t border-border/60 pt-2">
                <span className="text-muted-foreground">{isDual ? "老城空置率" : "空置率"}: </span>
                <span className={`font-bold ${snap.space.vacancy > 0.3 ? "vacancy-blink text-red-400" : snap.space.vacancy > 0.15 ? "text-orange-300" : "text-foreground/80"}`}>
                  {fmtPct(snap.space.vacancy, 0)}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* 中栏：图表 + 时间轴 + 事件卡 */}
        <section className="order-1 flex min-w-0 flex-col gap-3 lg:order-2">
          <div className="panel relative min-h-72 flex-1 p-3 sm:p-4">
            <div className="absolute top-3 left-4 z-10 flex gap-1.5">
              {(["combined", "industry", "space"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setChartType(t); audio.play("click"); }}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${chartType === t ? "chart-tab active border-primary/40 bg-primary/15 text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {{ combined: "综合趋势", industry: "产业结构", space: "空间对比" }[t]}
                </button>
              ))}
            </div>
            <MainChart option={chartOption} />
            <div className="h-7 sm:hidden" />
          </div>

          {/* 时间轴 */}
          <div className="panel shrink-0 p-3.5">
            <div className="mb-2.5 flex items-center gap-3">
              <button onClick={togglePlay} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition hover:bg-primary/25" aria-label="播放/暂停">
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>
              <button onClick={() => { setSpeed((s) => (s === 4 ? 1 : s === 1 ? 2 : 4)); audio.play("click"); }} className="kbd-hint shrink-0 px-2 py-1" title="播放速度">×{speed}</button>
              <Slider value={[year]} min={start} max={end} step={1} onValueChange={([v]) => { setYear(v); audio.play("slide"); }} className="flex-1" />
              <div className="hidden shrink-0 gap-1 text-[10px] text-muted-foreground sm:flex">
                <span>{start}</span><span className="mx-1">|</span><span>{cfg.phases[Math.floor(cfg.phases.length / 2)]?.start ?? ""}</span><span className="mx-1">|</span><span>{end}</span>
              </div>
            </div>
            {/* 阶段色带 */}
            <div className="flex h-1.5 w-full gap-px overflow-hidden rounded-full">
              {cfg.phases.map((p) => (
                <div key={p.name} title={`${p.name} ${p.start}-${p.end}`} className={PHASE_COLORS[p.color] ?? "bg-gray-500"} style={{ width: `${((p.end - p.start + 1) / (end - start + 1)) * 100}%`, opacity: year >= p.start && year <= p.end ? 1 : 0.25 }} />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
              {cfg.phases.map((p) => (
                <span key={p.name} className={year >= p.start && year <= p.end ? "font-bold text-amber-300" : ""}>{p.name}</span>
              ))}
            </div>
          </div>

          {/* 当年事件卡 */}
          <div className={`panel shrink-0 p-3.5 transition-all ${snap.event ? "anim-slide" : "hidden"}`}>
            {snap.event && (
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl">{EVENT_ICON[snap.event.category] ?? "📌"}</div>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-bold text-amber-400">{snap.event.year}</span>
                    <Badge variant={TAG_MAP[snap.event.category] ?? "default"}>{TAG_LABEL[snap.event.category] ?? "事件"}</Badge>
                    <span className="text-[10px] text-muted-foreground">影响力 {"★".repeat(Math.min(5, Math.ceil(snap.event.impact / 2)))}</span>
                  </div>
                  <h3 className="mb-0.5 font-bold text-foreground">{snap.event.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{snap.event.desc}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 右栏：事件流 + 阶段 + 提示 */}
        <aside className="order-3 flex flex-col gap-3 xl:flex">
          <div className="panel max-h-[46dvh] flex-1 overflow-y-auto p-3.5 xl:max-h-none">
            <h3 className="panel-title mb-3">历史事件流</h3>
            <div className="space-y-1.5">
              {city.timeline.filter((t) => t.event).map((t) => {
                const past = t.year <= year;
                return (
                  <button
                    key={t.year + t.title}
                    onClick={() => jumpYear(t.year)}
                    style={{ animationDelay: `${Math.min(0.4, t.year / (end * 3))}s` }}
                    className={`anim-rise flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${past ? "border-primary/30 bg-primary/5 hover:bg-primary/10" : "border-border/50 opacity-45 hover:opacity-75"}`}
                  >
                    <span className="shrink-0 text-base leading-none">{EVENT_ICON[t.category] ?? "📌"}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold tabular-nums ${past ? "text-amber-400" : "text-muted-foreground"}`}>{t.year}</span>
                        <Badge variant={TAG_MAP[t.category] ?? "default"}>{TAG_LABEL[t.category] ?? "事件"}</Badge>
                      </div>
                      <div className="mt-0.5 truncate text-xs font-medium text-foreground/90">{t.title}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="panel p-3">
            <h3 className="panel-title mb-2">玩法提示</h3>
            <p className="mb-2 text-[11px] leading-relaxed text-amber-600/90">💡 拖动时间轴观察数据变化，点击事件卡片跳转关键年份；试试顶部的产业链拼图与衰落诊断。</p>
            <div className="space-y-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
              <div><span className="kbd-hint">←</span> <span className="kbd-hint">→</span> 年份 · <span className="kbd-hint">Space</span> 播放</div>
              <div><span className="kbd-hint">I</span> 产业链 · <span className="kbd-hint">D</span> 诊断 · <span className="kbd-hint">R</span> 档案</div>
              <div className="flex gap-2 pt-0.5">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" asChild><Link href={`/compare?a=${cfg.cityKey}`}><Swords className="size-3" /> 对比</Link></Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" asChild><Link href="/"><MapIcon className="size-3" /> 返回地图</Link></Button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* 模态框组 */}
      <IndustryChainModal city={city} open={modal === "chain"} onClose={() => setModal(null)} />
      <DiagnosisModal city={city} open={modal === "diag"} onClose={() => setModal(null)} />
      <MigrationModal city={city} year={year} open={modal === "migra"} onClose={() => setModal(null)} />
      <SpaceMapModal city={city} year={year} open={modal === "space"} onClose={() => setModal(null)} />
      <ReportModal city={city} open={modal === "report"} onClose={() => setModal(null)} />

      {/* 首访快捷键引导层（仅首次，"知道了"后 localStorage 标记） */}
      {showKbdGuide && (
        <div className="anim-rise fixed bottom-20 left-1/2 z-40 w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-primary/30 bg-card/95 p-4 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="title-font text-sm font-bold text-amber-200">⌨️ 探索模式快捷键</h3>
            <button className="text-muted-foreground hover:text-foreground" onClick={dismissKbdGuide} aria-label="关闭引导"><X className="size-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
            <div><span className="kbd-hint">←</span> <span className="kbd-hint">→</span> 切换年份</div>
            <div><span className="kbd-hint">Space</span> 播放 / 暂停</div>
            <div><span className="kbd-hint">I</span> 产业链拼图</div>
            <div><span className="kbd-hint">D</span> 衰落诊断</div>
            <div><span className="kbd-hint">R</span> 生成档案</div>
            <div className="text-amber-300/80">拖动时间轴任意穿梭百年</div>
          </div>
          <Button size="sm" className="mt-3 w-full" onClick={dismissKbdGuide}>知道了，开始探索</Button>
        </div>
      )}

      <footer className="shrink-0 border-t border-border/40 py-2 text-center text-[10px] text-muted-foreground/60">
        本页面数据仅供教学演示，请以官方发布为准 · 年份 {start}–{end}
      </footer>
    </div>
  );
}

function MetricBlock({ label, value, trend, barPct, barColor }: { label: string; value: string; trend: { text: string; cls: string }; barPct?: number; barColor?: string }) {
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className={trend.cls}>{trend.text}</span>
      </div>
      <div className="stat-number stat-neutral text-lg">{value}</div>
      {barPct != null && (
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor ? "" : "bg-amber-500"}`}
            style={barColor ? { width: `${Math.min(100, barPct)}%`, background: barColor } : { width: `${Math.min(100, Math.max(1, barPct))}%` }}
          />
        </div>
      )}
    </div>
  );
}

/** 供移动端"对比"按钮使用的空对话框（占位避免未使用告警） */
const _UnusedDialog = Dialog.Dialog;
void _UnusedDialog;
