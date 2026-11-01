"use client";

/**
 * SimGame.tsx — 县长生涯 · 模拟经营主组件
 * 每回合=1年：分配财政 → 推进 → 结算事件 → 查看报表。结局与真实历史对照评分。
 */
import * as React from "react";
import Link from "next/link";
import type { CityData, SimState, SimPolicyInput, SimEventOutcome } from "@/lib/types";
import { createSimState, simulateYear, applyChoiceEffects, calibrate, makeRng, EMPTY_POLICY } from "@/lib/engine/simulator";
import { buildSeries } from "@/lib/engine/interp";
import { EChart } from "@/components/EChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/misc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { recordSim, saveSimState, clearSimState, loadProgress, recordChallenge, type SimRecord } from "@/lib/progress";
import { onSimFinished, onChallengeStars } from "@/lib/achievements";
import { SIM_CHALLENGES, evaluateChallenge } from "@/lib/engine/challenges";
import { audio } from "@/lib/audio";
import { fmtPop, fmtGdp, fmtPct, fmtNum } from "@/lib/utils";
import { ArrowLeft, ChevronRight, Landmark, TrendingUp, Leaf, HeartHandshake, Boxes, PiggyBank, RotateCcw, Send } from "lucide-react";

const POLICY_META: { key: keyof SimPolicyInput; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { key: "industry", label: "扩产", icon: <TrendingUp className="size-4" />, desc: "扩大主导产业产能：GDP↑、就业↑，但资源加速枯竭、环境承压", color: "text-amber-300" },
  { key: "transform", label: "转型", icon: <Boxes className="size-4" />, desc: "培育接续产业：先烧钱，积累后接棒成为新增长引擎", color: "text-cyan-300" },
  { key: "infra", label: "基建", icon: <Landmark className="size-4" />, desc: "扩张建成区与配套：短期拉动就业，人口流失时会造成高空置", color: "text-sky-300" },
  { key: "livelihood", label: "民生", icon: <HeartHandshake className="size-4" />, desc: "教育医疗社保：提升人口留存，抑制外流", color: "text-rose-300" },
  { key: "environment", label: "环保", icon: <Leaf className="size-4" />, desc: "矿山修复、污染治理：环境回升，GDP 微降", color: "text-emerald-300" },
  { key: "reserve", label: "储备", icon: <PiggyBank className="size-4" />, desc: "存入财政储备池，每年2%增值，以备枯竭之年", color: "text-violet-300" },
];

const PRESETS: { name: string; emoji: string; build: (f: number) => SimPolicyInput }[] = [
  { name: "均衡施政", emoji: "⚖️", build: (f) => ({ ...EMPTY_POLICY, industry: f * 0.2, transform: f * 0.2, infra: f * 0.15, livelihood: f * 0.25, environment: f * 0.2 }) },
  { name: "扩产狂飙", emoji: "🚀", build: (f) => ({ ...EMPTY_POLICY, industry: f * 0.6, infra: f * 0.2, livelihood: f * 0.1, environment: f * 0.1 }) },
  { name: "转型优先", emoji: "🔄", build: (f) => ({ ...EMPTY_POLICY, transform: f * 0.5, livelihood: f * 0.2, infra: f * 0.1, environment: f * 0.2 }) },
  { name: "民生为本", emoji: "🏘️", build: (f) => ({ ...EMPTY_POLICY, livelihood: f * 0.5, environment: f * 0.25, transform: f * 0.15, infra: f * 0.1 }) },
  { name: "绿色转型", emoji: "🌱", build: (f) => ({ ...EMPTY_POLICY, environment: f * 0.4, transform: f * 0.35, livelihood: f * 0.25 }) },
];

type Phase = "brief" | "govern" | "ending";

export function SimGame({ city }: { city: CityData }) {
  const params = React.useMemo(() => calibrate(city), [city]);
  const [phase, setPhase] = React.useState<Phase>("brief");
  const [state, setState] = React.useState<SimState>(() => createSimState(city));
  const [policy, setPolicy] = React.useState<SimPolicyInput>(EMPTY_POLICY);
  const [pendingEvent, setPendingEvent] = React.useState<SimEventOutcome | null>(null);
  const [seed] = React.useState(() => Math.floor(Math.random() * 2147483647));
  const [rng] = React.useState(() => makeRng(seed));
  /** 自动存档（客户端挂载后读取，避免 SSR 访问 localStorage） */
  const [saved, setSaved] = React.useState<SimRecord | null>(null);
  /** 挑战模式：本局选定的挑战（null=自由经营）+ 各挑战历史最佳星级 */
  const [challengeId, setChallengeId] = React.useState<string | null>(null);
  const [challengeBest, setChallengeBest] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const prog = loadProgress();
    setSaved(prog.sim[city.config.cityKey] ?? null);
    setChallengeBest(prog.challengeBest?.[city.config.cityKey] ?? {});
  }, [city.config.cityKey]);

  const realSeries = React.useMemo(() => buildSeries(city, 2), [city]);

  const savedState = saved?.state && !saved.state.finished ? saved.state : null;

  const start = () => {
    clearSimState(city.config.cityKey);
    const s = createSimState(city, seed);
    s.challengeId = challengeId;
    setState(s);
    setPhase("govern");
    audio.play("play");
  };

  const resume = () => {
    if (!savedState) return;
    setState(savedState);
    setChallengeId(savedState.challengeId ?? null);
    const rs = typeof saved?.rngState === "number" ? saved.rngState : Number((savedState as unknown as Record<string, number>)._seed);
    if (Number.isFinite(rs) && rs > 0) rng.setState(rs);
    setPolicy(EMPTY_POLICY);
    setPendingEvent(null);
    setPhase("govern");
    audio.play("play");
  };

  const restart = () => {
    clearSimState(city.config.cityKey);
    setState(createSimState(city));
    setPolicy(EMPTY_POLICY);
    setPendingEvent(null);
    setPhase("brief");
  };

  /** 中途自动存档（每回合推进/事件选择后） */
  const persist = (s: SimState) => saveSimState(city.config.cityKey, s, rng.getState());

  const advance = () => {
    const budget = state.fiscal;
    const total = Object.values(policy).reduce((a, b) => a + b, 0);
    const scaled: SimPolicyInput = total > budget && total > 0
      ? { industry: (policy.industry * budget) / total, transform: (policy.transform * budget) / total, infra: (policy.infra * budget) / total, livelihood: (policy.livelihood * budget) / total, environment: (policy.environment * budget) / total, reserve: (policy.reserve * budget) / total }
      : policy;
    const next = simulateYear({ ...state }, scaled, city, rng);
    setState(next);
    setPolicy(EMPTY_POLICY);
    if (next.finished) {
      setPhase("ending");
      audio.play("ending");
      onSimFinished(next.ending!.score);
      clearSimState(city.config.cityKey); // 终局后清除"继续经营"入口
      recordSim(city.config.cityKey, {
        score: next.ending!.score, grade: next.ending!.grade, endingTitle: next.ending!.title,
        year: next.year - 1, pop: next.pop, gdp: next.gdp, savedAt: Date.now(),
      });
      if (next.challengeId) {
        const res = evaluateChallenge(next.challengeId, next, params);
        if (res) {
          const best = recordChallenge(city.config.cityKey, next.challengeId, res.stars);
          setChallengeBest((m) => ({ ...m, [next.challengeId as string]: best }));
          onChallengeStars(res.stars);
        }
      }
      return;
    }
    persist(next);
    const ev = next.history.at(-1)?.events.find((e) => e.kind === "random" && e.choices);
    if (ev) setPendingEvent(ev);
    else audio.play("coin");
  };

  const choose = (idx: number) => {
    if (!pendingEvent) return;
    const s = { ...state };
    applyChoiceEffects(s, pendingEvent, idx);
    setState(s);
    persist(s);
    setPendingEvent(null);
    audio.play("click");
  };

  const budget = state.fiscal;
  const allocated = Object.values(policy).reduce((a, b) => a + b, 0);
  const lastResult = state.history.at(-1);

  /* ---------- 开局简报 ---------- */
  if (phase === "brief") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-5 p-5">
        <div className="panel anim-rise p-6">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/" className="hover:text-amber-300">← 返回</Link> · 县长生涯模式</div>
          <h1 className="title-font mb-2 text-2xl font-black text-amber-200">{city.profile.name} · {params.startYear}</h1>
          <div className="mb-4 flex flex-wrap gap-1.5">{city.profile.tags.map((t) => <Badge key={t} variant="peak">{t}</Badge>)}</div>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{city.profile.description}</p>
          <div className="mb-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <StatCard label="初始人口" value={fmtPop(state.pop)} />
            <StatCard label="初始GDP" value={fmtGdp(state.gdp)} />
            <StatCard label="年度财政" value={fmtGdp(state.fiscal)} />
            <StatCard label={params.growthMode ? "增长动能" : `${params.primaryLabel}储量`} value="100%" />
          </div>
          <div className="rounded-lg border border-primary/25 bg-primary/5 p-3.5 text-xs leading-relaxed text-foreground/85">
            {params.growthMode ? (
              <>
                <b className="text-amber-300">📜 就任主政者：</b>你将在 {params.startYear}—{params.endYear} 年间执掌{city.profile.name}——
                一座被时代选中的增长之城。每年把有限的财政投向 <b>扩产 / 转型 / 基建 / 民生 / 环保 / 储备</b> 六个方向：
                增长的历史大势不可逆转，但能否<b className="text-amber-300">跑赢真实历史</b>、让产业与民生跟上人口涌入，全看你的布局。
                游戏结束时，成绩将与<b className="text-amber-300">真实历史</b>对照评分（S~D）。
              </>
            ) : (
              <>
                <b className="text-amber-300">📜 就任县长：</b>你将在 {params.startYear}—{params.endYear} 年间执掌{city.profile.name}。
                每年把有限的财政投向 <b>扩产 / 转型 / 基建 / 民生 / 环保 / 储备</b> 六个方向。真实历史事件会如期而至——
                {params.primaryLabel}终将走向{params.collapseYear ? `枯竭（真实历史：约${params.collapseYear}年）` : "衰退"}，唯有提前布局者能笑到最后。
                游戏结束时，你的成绩将与<b className="text-amber-300">真实历史</b>对照评分（S~D）。
              </>
            )}
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-200">🏆 施政挑战（可选 · 结局按星级评定）</h3>
              <button className="text-[10px] text-muted-foreground transition hover:text-amber-200" onClick={() => setChallengeId(null)}>清除选择</button>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {SIM_CHALLENGES.map((ch) => {
                const active = challengeId === ch.id;
                const best = challengeBest[ch.id] ?? 0;
                return (
                  <button
                    key={ch.id}
                    onClick={() => { setChallengeId(active ? null : ch.id); audio.play("click"); }}
                    className={`rounded-lg border p-2.5 text-left transition ${active ? "border-amber-400 bg-amber-400/10" : "border-border/60 bg-secondary/40 hover:border-primary/40"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground/90">{ch.emoji} {ch.name}</span>
                      <span className="shrink-0 text-[10px] tracking-widest text-amber-300" title={best > 0 ? `历史最佳 ${best} 星` : "未挑战"}>
                        {best > 0 ? "★".repeat(best) + "☆".repeat(3 - best) : "未挑战"}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{ch.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
          {savedState ? (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs">
                <span className="text-amber-200">⏸ 上次经营进行至 <b>{savedState.year} 年</b>（人口 {fmtPop(savedState.pop)} · GDP {fmtGdp(savedState.gdp)}）</span>
                <span className="text-[10px] text-muted-foreground">自动存档</span>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="lg" onClick={resume}>▶ 继续上次经营</Button>
                <Button variant="outline" size="lg" onClick={start}>重新开局</Button>
              </div>
            </div>
          ) : (
            <Button className="mt-5 w-full" size="lg" onClick={start}>🧑‍💼 就任县长，开始经营</Button>
          )}
        </div>
      </div>
    );
  }

  /* ---------- 结局 ---------- */
  if (phase === "ending" && state.ending) {
    const e = state.ending;
    const gradeColor = { S: "text-amber-300 border-amber-400", A: "text-emerald-300 border-emerald-400", B: "text-sky-300 border-sky-400", C: "text-orange-300 border-orange-400", D: "text-red-300 border-red-400" }[e.grade];
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 p-5">
        <div className="panel anim-rise p-6 text-center">
          <div className={`grade-badge mx-auto mb-3 ${gradeColor}`}>{e.grade}</div>
          <h1 className="title-font mb-1 text-2xl font-black text-amber-200">{e.title}</h1>
          <p className="mb-4 text-xs text-muted-foreground">综合评分 <b className="text-lg text-foreground">{e.score}</b> / 100</p>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{e.detail}</p>
          <div className="mb-4 rounded-lg border border-border bg-secondary/50 p-3.5 text-left text-xs leading-relaxed text-foreground/85">{e.vsReal}</div>
          {(() => {
            const res = evaluateChallenge(state.challengeId, state, params);
            if (!res) return null;
            const ch = SIM_CHALLENGES.find((c) => c.id === state.challengeId);
            if (!ch) return null;
            const best = Math.max(challengeBest[ch.id] ?? 0, res.stars);
            return (
              <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5 text-left">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-200">🏆 施政挑战 · {ch.name}</span>
                  <span className="text-sm tracking-widest text-amber-300">
                    {"★".repeat(res.stars)}<span className="text-border">{"★".repeat(3 - res.stars)}</span>
                  </span>
                </div>
                <div className="space-y-1">
                  {res.lines.map((l, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-[11px]">
                      <span className={l.hit ? "text-emerald-300" : "text-muted-foreground"}>{l.hit ? "✓" : "✗"} {l.label}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">{l.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 text-[10px] text-muted-foreground">历史最佳 {best} 星</div>
              </div>
            );
          })()}
          <div className="mb-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <StatCard label="终局人口" value={fmtPop(state.pop)} />
            <StatCard label="终局GDP" value={fmtGdp(state.gdp)} />
            <StatCard label="环境" value={state.environment.toFixed(0)} />
            <StatCard label="多元化" value={state.diversification.toFixed(0)} />
          </div>
          <SimHistoryChart city={city} state={state} realSeries={realSeries} />
          <LeaderboardSubmit
            cityKey={city.config.cityKey}
            cityName={city.profile.name}
            score={e.score}
            grade={e.grade}
            endingTitle={e.title}
            pop={state.pop}
            gdp={state.gdp}
            year={state.year - 1}
          />
          <div className="mt-4 flex gap-2">
            <Button className="flex-1" onClick={restart}><RotateCcw className="size-4" /> 再来一局</Button>
            <Button variant="outline" className="flex-1" asChild><Link href={`/city/${city.config.cityKey}`}>查看真实历史</Link></Button>
            <Button variant="ghost" asChild><Link href="/">首页</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 治理主界面 ---------- */
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="iconSm" asChild><Link href="/"><ArrowLeft className="size-4" /></Link></Button>
            <div>
              <div className="title-font text-sm font-bold text-amber-100">🧑‍💼 {city.profile.name} · 县长生涯</div>
              <div className="text-[10px] text-muted-foreground">{params.startYear}—{params.endYear} · 真实事件将按年份发生</div>
            </div>
          </div>
          <div className="text-right">
            <div className="year-display">{state.year}</div>
            <div className="text-[10px] text-muted-foreground">回合 {(state.year - params.startYear) + 1} / {params.endYear - params.startYear + 1}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-3 p-3 sm:p-4 lg:grid-cols-[1fr_340px]">
        {/* 左：指标 + 图表 */}
        <section className="order-2 flex flex-col gap-3 lg:order-1">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatCard label="财政" value={fmtGdp(state.fiscal)} sub={state.reserve > 0 ? `储备 ${fmtGdp(state.reserve)}` : undefined} warn={state.fiscal < 0.5} />
            <StatCard label="人口" value={fmtPop(state.pop)} sub={`失业 ${fmtPct(state.unemployment, 0)}`} />
            <StatCard label="GDP" value={fmtGdp(state.gdp)} />
            {params.growthMode
              ? <StatCard label="多元化产业" value={state.diversification.toFixed(0)} warn={state.diversification < 25} />
              : <StatCard label={`${params.primaryLabel}储量`} value={`${(state.resourceLeft * 100).toFixed(0)}%`} warn={state.resourceLeft < 0.25} />}
          </div>
          <div className="panel p-3.5">
            <div className="mb-2 grid grid-cols-3 gap-3 text-xs">
              <Gauge label="环境" value={state.environment} color="#34d399" />
              <Gauge label="民生" value={state.livelihood} color="#fb7185" />
              <Gauge label="多元化" value={state.diversification} color="#22d3ee" />
            </div>
            <div className="border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
              空置率 <b className={state.vacancy > 0.3 ? "text-red-400" : "text-foreground/85"}>{fmtPct(state.vacancy, 0)}</b> · 建成区 <b className="text-foreground/85">{fmtNum(state.builtArea, 1)} km²</b>
            </div>
          </div>
          <div className="panel min-h-64 flex-1 p-3.5">
            <h3 className="panel-title mb-2">经营曲线（vs 真实历史）</h3>
            <SimHistoryChart city={city} state={state} realSeries={realSeries} height={210} />
          </div>
          {lastResult && (
            <div className="panel p-3.5">
              <h3 className="panel-title mb-2">{lastResult.year}年 报表</h3>
              <p className="mb-2 text-xs text-amber-200/90">📌 {lastResult.headline}</p>
              {lastResult.events.map((ev) => (
                <div key={ev.id} className="mb-1.5 rounded border border-border/60 bg-secondary/40 p-2 text-[11px]">
                  <b className={ev.kind === "history" ? "text-amber-300" : "text-cyan-300"}>{ev.kind === "history" ? "真实事件" : "突发事件"}</b> · {ev.title}
                  {ev.chosenIndex != null && ev.choices ? <span className="ml-1 text-muted-foreground">→ 你选择了「{ev.choices[ev.chosenIndex].label}」</span> : null}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 右：政策分配 */}
        <aside className="order-1 flex flex-col gap-3 lg:order-2">
          <div className="panel p-3.5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="panel-title">年度财政分配</h3>
              <span className={`text-xs font-bold ${allocated > budget ? "text-red-400" : "text-emerald-400"}`}>
                {fmtGdp(allocated)} / {fmtGdp(budget)}
              </span>
            </div>
            <Progress value={budget > 0 ? (allocated / budget) * 100 : 0} className="mb-3 h-1.5" indicatorClassName={allocated > budget ? "bg-red-500" : "bg-emerald-500"} />
            <div className="mb-3 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => { setPolicy(p.build(budget)); audio.play("click"); }} className="rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground transition hover:border-primary/40 hover:text-amber-200">
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {POLICY_META.map((m) => (
                <div key={m.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 font-medium ${m.color}`}>{m.icon} {m.label}</span>
                    <span className="tabular-nums text-foreground/80">{fmtGdp(policy[m.key])}</span>
                  </div>
                  <Slider
                    value={[policy[m.key]]}
                    min={0} max={Math.max(0.5, budget)} step={Math.max(0.05, Math.round((budget / 20) * 100) / 100)}
                    onValueChange={([v]) => setPolicy((p) => ({ ...p, [m.key]: v }))}
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                    {params.growthMode && m.key === "industry" ? "扩大产业投资：GDP↑、就业↑，注意环境承压与财政平衡" : m.desc}
                  </p>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full" size="lg" onClick={advance} disabled={state.finished}>
              推进到 {state.year + 1} 年 <ChevronRight className="size-4" />
            </Button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              {params.growthMode
                ? "保持投入节奏，别让城市在增长赛道上掉队"
                : state.resourceLeft < 0.3 ? "⚠️ 资源即将枯竭，转型窗口正在关闭" : "未分配的财政自动结转下年"}
            </p>
          </div>
        </aside>
      </main>

      {/* 事件弹窗 */}
      <Dialog open={!!pendingEvent} onOpenChange={(o) => !o && setPendingEvent(null)}>
        <DialogContent className="max-w-md" hideClose>
          {pendingEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-amber-200">⚡ {pendingEvent.title}</DialogTitle>
                <DialogDescription>{pendingEvent.desc}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {pendingEvent.choices?.map((c, i) => (
                  <button key={i} onClick={() => choose(i)} className="w-full rounded-lg border border-border bg-secondary/50 p-3 text-left transition hover:border-primary/50 hover:bg-primary/10">
                    <div className="text-sm font-bold text-foreground/90">{c.label}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{c.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** 排行榜提交（失败静默：无服务时离线可用） */
function LeaderboardSubmit(props: { cityKey: string; cityName: string; score: number; grade: string; endingTitle: string; pop: number; gdp: number; year: number }) {
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "ok" | "fail">("idle");
  const [rank, setRank] = React.useState<number | null>(null);
  const submit = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...props, playerName: name || "无名县长" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRank(data.rank ?? null);
      setStatus("ok");
      audio.play("achieve");
    } catch {
      setStatus("fail");
    }
  };
  if (status === "ok") {
    return <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">🏆 已上榜{rank ? ` · 本城第 ${rank} 名` : ""}，感谢这位县长！</div>;
  }
  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-2.5">
      <input
        value={name}
        onChange={(ev) => setName(ev.target.value)}
        placeholder="留下县长名号（可选）"
        maxLength={20}
        className="h-8 min-w-0 flex-1 rounded border border-border bg-background px-2 text-xs outline-none focus:border-primary/50"
      />
      <Button size="sm" variant="outline" onClick={submit} disabled={status === "sending"}>
        <Send className="size-3.5" /> {status === "sending" ? "提交中…" : "提交排行榜"}
      </Button>
      {status === "fail" && <span className="text-[10px] text-muted-foreground">离线模式，提交失败</span>}
    </div>
  );
}

function StatCard({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className={`rounded-lg border p-2.5 ${warn ? "border-red-500/40 bg-red-500/5" : "border-border/60 bg-secondary/40"}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-base font-bold tabular-nums ${warn ? "text-red-300" : "text-foreground"}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold" style={{ color }}>{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
      </div>
    </div>
  );
}

function SimHistoryChart({ city, state, realSeries, height = 240 }: { city: CityData; state: SimState; realSeries: ReturnType<typeof buildSeries>; height?: number }) {
  const option = React.useMemo(() => {
    const simYears = state.history.map((h) => h.year);
    const simGdp = state.history.map((h) => h.gdp);
    // 人口统一换算为「万」（1 位小数）：真实与玩家两条线必须同单位
    const simPopWan = state.history.map((h) => Math.round(h.pop / 1000) / 10);
    return {
      backgroundColor: "transparent",
      grid: { left: 46, right: 46, top: 30, bottom: 24 },
      tooltip: { trigger: "axis", backgroundColor: "rgba(20,22,28,0.94)", borderColor: "rgba(201,168,76,0.4)", textStyle: { color: "#e5e7eb", fontSize: 11 } },
      legend: { data: ["你的GDP", "真实GDP", "你的人口(万)", "真实人口(万)"], top: 0, type: "scroll", textStyle: { color: "#94a3b8", fontSize: 10 } },
      xAxis: { type: "category", data: realSeries.years, axisLabel: { color: "#64748b", fontSize: 9 } },
      yAxis: [
        { type: "value", name: "GDP(亿)", axisLabel: { color: "#94a3b8", fontSize: 9 }, splitLine: { lineStyle: { color: "rgba(30,41,59,0.7)" } }, nameTextStyle: { color: "#64748b", fontSize: 9 } },
        { type: "value", name: "人口(万)", axisLabel: { color: "#94a3b8", fontSize: 9 }, splitLine: { show: false }, nameTextStyle: { color: "#64748b", fontSize: 9 } },
      ],
      series: [
        { name: "真实GDP", type: "line", data: realSeries.gdp, lineStyle: { color: "#64748b", width: 1.6, type: "dashed" }, itemStyle: { color: "#64748b" }, symbol: "none", smooth: true },
        { name: "你的GDP", type: "line", data: simGdp, lineStyle: { color: "#eab308", width: 2.2 }, itemStyle: { color: "#eab308" }, symbol: "none", smooth: true, areaStyle: { color: "rgba(234,179,8,0.08)" } },
        { name: "真实人口(万)", type: "line", yAxisIndex: 1, data: realSeries.pop.map((p) => Math.round(p / 1000) / 10), lineStyle: { color: "#94a3b8", width: 1.4, type: "dashed" }, itemStyle: { color: "#94a3b8" }, symbol: "none", smooth: true },
        { name: "你的人口(万)", type: "line", yAxisIndex: 1, data: simPopWan, lineStyle: { color: "#22d3ee", width: 2 }, itemStyle: { color: "#22d3ee" }, symbol: "none", smooth: true },
      ],
    };
  }, [state.history, realSeries]);
  return <EChart option={option} style={{ height }} className="w-full" notMerge={false} />;
}
