"use client";

/**
 * 首页 — 真实中国地图 + 城市选择 + 全局进度 + 模式入口
 */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChinaMap, type MapCity } from "@/components/ChinaMap";
import { CITY_LIST, SEZ_LIST, CITY_MAP } from "@/data/cities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { loadProgress, type ProgressData } from "@/lib/progress";
import { audio } from "@/lib/audio";
import { fmtPop } from "@/lib/utils";
import { Map as MapIcon, Swords, Trophy, BookOpen, RotateCcw, Sparkles, Info, X, PlayCircle, Medal } from "lucide-react";
import * as Dialog from "@/components/ui/dialog";

interface BoardEntry {
  cityKey: string;
  cityName: string;
  playerName: string;
  score: number;
  grade: string;
  endingTitle: string;
  year: number;
  savedAt: number;
}

export default function HomePage() {
  const router = useRouter();
  const [progress, setProgress] = React.useState<ProgressData | null>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [showContrast, setShowContrast] = React.useState(true);
  const [mobileTab, setMobileTab] = React.useState<"map" | "list">("map");
  const [board, setBoard] = React.useState<BoardEntry[] | null>(null);

  React.useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // 县长排行榜 Top10（服务不可达时静默降级为离线模式）
  React.useEffect(() => {
    let alive = true;
    fetch("/api/leaderboard")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => { if (alive) setBoard(Array.isArray(d.entries) ? d.entries : []); })
      .catch(() => { if (alive) setBoard([]); });
    return () => { alive = false; };
  }, []);

  const mapCities: MapCity[] = React.useMemo(
    () =>
      [
        ...CITY_LIST.map((c) => ({
          key: c.key,
          name: c.data.profile.name,
          coords: c.data.profile.coordinates,
          tags: c.data.profile.tags,
          province: c.data.profile.province,
        })),
        ...(showContrast
          ? SEZ_LIST.map((c) => ({
              key: c.key,
              name: c.data.profile.name,
              coords: c.data.profile.coordinates,
              tags: c.data.profile.tags,
              province: c.data.profile.province,
              contrast: true,
            }))
          : []),
      ] as MapCity[],
    [showContrast],
  );

  const activeCity = React.useMemo(() => {
    const key = hovered ?? selected;
    return key ? CITY_LIST.find((c) => c.key === key)?.data ?? SEZ_LIST.find((c) => c.key === key)?.data : null;
  }, [hovered, selected]);

  const totalCities = CITY_LIST.length;
  const visitedCount = progress?.visits.filter((v) => CITY_LIST.some((c) => c.key === v)).length ?? 0;
  const achCount = progress?.achievements.length ?? 0;
  const simBest = progress ? Object.values(progress.sim) : [];
  const simBestScore = simBest.length ? Math.max(...simBest.map((s) => s.score)) : 0;
  /** 有未完成自动存档的县长生涯（最近优先，最多 3 条） */
  const resumeList = progress
    ? Object.entries(progress.sim)
        .filter(([, r]) => r.state && !r.state.finished)
        .sort((x, y) => y[1].savedAt - x[1].savedAt)
        .slice(0, 3)
    : [];
  const boardTop = board?.slice(0, 10) ?? [];

  const goCity = (key: string) => {
    audio.play("click");
    router.push(`/city/${key}`);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 顶栏 */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-800/20 text-lg">🏛️</div>
          <div>
            <h1 className="title-font text-base font-black tracking-wider text-amber-200 sm:text-lg">县城兴衰史</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">中国资源型城市兴衰互动叙事 · 模拟经营</p>
          </div>
        </div>
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={() => { audio.play("click"); router.push("/compare"); }}>
            <Swords className="size-3.5" /> <span className="hidden sm:inline">双城对比</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { audio.play("click"); setAboutOpen(true); }}>
            <Info className="size-3.5" /> <span className="hidden sm:inline">数据说明</span>
          </Button>
          <Button variant="ghost" size="iconSm" title="重置本地进度" onClick={() => { if (confirm("确定清空本地所有游戏进度？")) { localStorage.clear(); location.reload(); } }}>
            <RotateCcw className="size-3.5" />
          </Button>
        </nav>
      </header>

      {/* 进度条幅 */}
      <div className="border-b border-border/40 bg-secondary/30 px-4 py-2 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapIcon className="size-3.5 text-amber-400" /> 城市探索 <b className="text-amber-300">{visitedCount}/{totalCities}</b></span>
          <Progress value={(visitedCount / totalCities) * 100} className="h-1 w-24" />
          <span className="flex items-center gap-1.5"><Trophy className="size-3.5 text-amber-400" /> 成就 <b className="text-amber-300">{achCount}</b></span>
          <span className="flex items-center gap-1.5"><Sparkles className="size-3.5 text-amber-400" /> 县长生涯最高评分 <b className="text-amber-300">{simBestScore || "—"}</b></span>
          <span className="ml-auto hidden text-[10px] text-muted-foreground/60 md:block">数据源自各市统计公报与人口普查 · 全资源本地加载</span>
        </div>
      </div>

      {/* 主体 */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_360px]">
        {/* 地图区 */}
        <section className={`panel relative overflow-hidden ${mobileTab === "map" ? "" : "hidden lg:block"}`}>
          <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
            <h2 className="panel-title">资源型城市分布</h2>
            <button className={`rounded-full border px-2 py-0.5 text-[10px] transition ${showContrast ? "border-sky-400/40 text-sky-300" : "border-border text-muted-foreground"}`} onClick={() => setShowContrast((v) => !v)}>
              对照组 {showContrast ? "开" : "关"}
            </button>
          </div>
          <div className="h-[52dvh] min-h-72 w-full lg:h-[calc(100dvh-260px)]">
            <ChinaMap
              cities={mapCities}
              visited={progress?.visits ?? []}
              onSelect={(k) => setSelected(k)}
              hovered={hovered}
              onHover={setHovered}
              selected={selected}
            />
          </div>
          {/* 悬停/选中城市名片 */}
          {activeCity && (
            <div className="anim-rise absolute right-4 bottom-4 left-4 z-10 rounded-xl border border-primary/30 bg-card/95 p-4 shadow-2xl backdrop-blur-md sm:left-auto sm:w-96">
              <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground lg:hidden" onClick={() => setSelected(null)}><X className="size-4" /></button>
              <div className="mb-1 flex items-baseline gap-2">
                <h3 className="title-font text-lg font-bold text-amber-200">{activeCity.profile.name}</h3>
                <span className="text-[11px] text-muted-foreground">{activeCity.profile.province}</span>
              </div>
              <div className="mb-2 flex flex-wrap gap-1">
                {activeCity.profile.tags.map((t) => <Badge key={t} variant="peak">{t}</Badge>)}
              </div>
              <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{activeCity.profile.description}</p>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground">
                  终点人口 <b className="text-foreground">{fmtPop(activeCity.timeline.at(-1)?.pop)}</b> · 时间轴 <b className="text-foreground">{activeCity.config.timeRange.start}-{activeCity.config.timeRange.end}</b>
                </div>
                <div className="flex gap-2">
                  {CITY_LIST.some((c) => c.key === activeCity.config.cityKey) ? (
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/play/${activeCity.config.cityKey}`}>🎮 经营</Link>
                    </Button>
                  ) : (
                    <span className="self-center text-[10px] text-muted-foreground">对照城市 · 仅探索</span>
                  )}
                  <Button size="sm" onClick={() => goCity(activeCity.config.cityKey)}>进入探索</Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 城市列表区 */}
        <section className={`flex flex-col gap-3 overflow-hidden ${mobileTab === "list" ? "" : "hidden lg:flex"}`}>
          <div className="panel flex-1 overflow-y-auto p-3">
            <h2 className="panel-title mb-2 px-1">选择一座城市</h2>
            <div className="grid gap-1.5">
              {CITY_LIST.map(({ key, data }) => {
                const visited = progress?.visits.includes(key);
                const best = progress?.sim[key];
                return (
                  <button
                    key={key}
                    className={`group flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all hover:border-primary/40 hover:bg-secondary/60 ${selected === key ? "border-primary/50 bg-secondary/70" : "border-transparent"}`}
                    onClick={() => { setSelected(key); audio.play("slide"); }}
                    onDoubleClick={() => goCity(key)}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm ${visited ? "bg-amber-500/15 text-amber-300" : "bg-secondary text-muted-foreground"}`}>
                      {visited ? "✓" : data.profile.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground/90 group-hover:text-amber-200">{data.profile.name}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{data.profile.province}</span>
                        {best?.grade ? (
                          <Badge variant="peak" className="ml-auto">{best.grade}·{best.score}分</Badge>
                        ) : best?.state && !best.state.finished ? (
                          <Badge variant="default" className="ml-auto shrink-0 text-[9px]">⏸ {best.state.year}年</Badge>
                        ) : null}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">{data.profile.tags.slice(0, 2).join(" · ")} · {data.config.timeRange.start}年至今</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* 模式卡片 */}
          <div className="grid grid-cols-2 gap-2">
            <Link href="/compare" onClick={() => audio.play("click")} className="panel group p-3 transition hover:border-primary/40">
              <Swords className="mb-1.5 size-5 text-amber-400" />
              <div className="text-sm font-bold text-foreground/90 group-hover:text-amber-200">双城对比</div>
              <div className="text-[10px] text-muted-foreground">同步时间轴 · 衰落因子雷达</div>
            </Link>
            <div className="panel p-3">
              <BookOpen className="mb-1.5 size-5 text-amber-400" />
              <div className="text-sm font-bold text-foreground/90">玩法指引</div>
              <div className="text-[10px] text-muted-foreground">探索模式 + 县长生涯模拟</div>
            </div>
          </div>

          {/* 继续上次经营（存在未完成自动存档时展示） */}
          {resumeList.length > 0 && (
            <div className="panel p-3">
              <h2 className="panel-title mb-2 px-1">继续上次经营</h2>
              <div className="space-y-1.5">
                {resumeList.map(([key, rec]) => (
                  <Link
                    key={key}
                    href={`/play/${key}`}
                    onClick={() => audio.play("click")}
                    className="flex items-center gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/5 p-2.5 transition hover:border-amber-500/50 hover:bg-amber-500/10"
                  >
                    <PlayCircle className="size-5 shrink-0 text-amber-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-amber-100">{CITY_MAP[key]?.profile.name ?? key} · 县长生涯</div>
                      <div className="text-[10px] text-muted-foreground">存档至 {rec.state?.year ?? rec.year} 年 · 人口 {fmtPop(rec.state?.pop ?? rec.pop)}</div>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">续玩 →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 县长排行榜 Top10 */}
          <div className="panel p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="panel-title"><Medal className="mr-1 inline size-3.5 text-amber-400" /> 县长排行榜</h2>
              <span className="text-[10px] text-muted-foreground">{board ? `共 ${board.length} 条` : "加载中…"}</span>
            </div>
            {boardTop.length === 0 ? (
              <p className="px-1 py-3 text-center text-[11px] leading-relaxed text-muted-foreground">
                {board === null ? "正在拉取榜单…" : "暂无上榜记录 —— 完成一局县长生涯，提交你的成绩！"}
              </p>
            ) : (
              <ol className="space-y-1">
                {boardTop.map((e, i) => (
                  <li key={`${e.savedAt}-${i}`} className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/30 px-2.5 py-1.5 text-xs">
                    <span className={`w-5 shrink-0 text-center font-bold ${i === 0 ? "text-amber-300" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-foreground/90">{e.playerName}</span>
                    <span className="hidden shrink-0 truncate text-[10px] text-muted-foreground sm:block sm:max-w-24">{e.cityName}</span>
                    <Badge variant="peak" className="shrink-0 text-[10px]">{e.grade}</Badge>
                    <b className="shrink-0 tabular-nums text-amber-300">{e.score}</b>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </main>

      {/* 移动端底部切换 */}
      <div className="sticky bottom-0 z-30 grid grid-cols-2 border-t border-border/60 bg-background/90 p-2 backdrop-blur-md lg:hidden">
        <Button variant={mobileTab === "map" ? "default" : "ghost"} size="sm" onClick={() => setMobileTab("map")}><MapIcon className="size-4" /> 地图</Button>
        <Button variant={mobileTab === "list" ? "default" : "ghost"} size="sm" onClick={() => setMobileTab("list")}><BookOpen className="size-4" /> 城市列表</Button>
      </div>

      {/* 数据说明 */}
      <Dialog.Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <Dialog.DialogContent className="max-w-xl">
          <Dialog.DialogTitle className="text-amber-200">关于本作与数据说明</Dialog.DialogTitle>
          <Dialog.DialogDescription asChild>
            <div className="space-y-3 pt-2 text-xs leading-relaxed text-muted-foreground">
              <p><b className="text-foreground">《县城兴衰史》</b>以中国资源型城市为舞台：探索模式还原真实兴衰因果链，县长生涯模式让你在真实参数下改写历史。</p>
              <div>
                <b className="text-foreground">数据来源：</b>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  <li>各城市国民经济和社会发展统计公报（2023/2024）</li>
                  <li>第七次全国人口普查公报（2020）</li>
                  <li>各产业链公开数据与学术研究；早年份数据为插值估算，游戏内已标注</li>
                </ul>
              </div>
              <div>
                <b className="text-foreground">两种玩法：</b>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  <li><b className="text-amber-300">时间轴探索</b>：拖动年份，看人口/GDP/产业/空间实时演变；完成产业链拼图、衰落诊断、生成城市档案。</li>
                  <li><b className="text-amber-300">县长生涯</b>：从城市设市之年接管县政，分配财政投向（扩产/转型/基建/民生/环保/储备），经历真实历史事件，结局与真实历史对照评分。</li>
                </ul>
              </div>
              <p className="text-[10px] opacity-70">本作仅作教学演示，请以官方发布数据为准。</p>
            </div>
          </Dialog.DialogDescription>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}
