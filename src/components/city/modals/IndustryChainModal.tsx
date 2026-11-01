"use client";

/**
 * IndustryChainModal.tsx — 产业链全生命周期 + 拼图玩法（v1.2.2 时间联动）
 * 状态徽章与节点颜色随所选年份实时变化；年份滑块与主时间轴双向同步。
 * 渲染 SVG 产业链拓扑；点击"拼图"进入节点排序小游戏。
 */
import * as React from "react";
import type { CityData, IndustryChain } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { Slider } from "@/components/ui/slider";
import { scoreChainPuzzle } from "@/lib/engine/simulator";
import { audio } from "@/lib/audio";
import { recordExplore } from "@/lib/progress";
import { onChainResult } from "@/lib/achievements";
import { Puzzle } from "lucide-react";

const STATUS_STYLE: Record<string, { fill: string; label: string; bg: string }> = {
  active: { fill: "#eab308", label: "运行中", bg: "bg-amber-500/15 text-amber-400" },
  growing: { fill: "#34d399", label: "成长中", bg: "bg-emerald-500/15 text-emerald-400" },
  emerging: { fill: "#22d3ee", label: "培育期", bg: "bg-cyan-500/15 text-cyan-400" },
  declining: { fill: "#f97316", label: "衰退中", bg: "bg-orange-500/15 text-orange-400" },
  dead: { fill: "#7f1d1d", label: "已衰亡", bg: "bg-red-500/15 text-red-400" },
};

function chainStatus(chain: IndustryChain, year: number): { fill: string; label: string; bg: string } {
  const lc = chain.lifecycle;
  if (lc.dead != null && year >= lc.dead) return STATUS_STYLE.dead;
  if (lc.collapse != null && year >= lc.collapse) return STATUS_STYLE.dead;
  if (lc.decline != null && year >= lc.decline) return STATUS_STYLE.declining;
  // 注意 peak 可能为 null（"延续至今"链）：JS 中 `1939 >= null` 为 true，必须显式判空
  if (lc.peak != null && year >= lc.peak) return STATUS_STYLE.active;
  if (year >= lc.birth) return lc.peak == null ? STATUS_STYLE.active : STATUS_STYLE.growing;
  return STATUS_STYLE.emerging;
}

/** 产业链在指定年份所处阶段的文案与配色（时间联动） */
function chainPhase(chain: IndustryChain, year: number): { phaseLabel: string; phaseBg: string } {
  const lc = chain.lifecycle;
  if (lc.dead != null && year >= lc.dead) return { phaseLabel: "已退出历史舞台", phaseBg: "bg-red-500/15 text-red-400" };
  if (lc.collapse != null && year >= lc.collapse) return { phaseLabel: "崩溃后尾声", phaseBg: "bg-red-500/15 text-red-400" };
  if (lc.decline != null && year >= lc.decline) return { phaseLabel: "转型阵痛期", phaseBg: "bg-orange-500/15 text-orange-400" };
  if (lc.peak != null && year >= lc.peak) return { phaseLabel: "鼎盛黄金期", phaseBg: "bg-amber-500/15 text-amber-300" };
  if (year >= lc.birth) return lc.peak == null ? { phaseLabel: "上升发展期", phaseBg: "bg-emerald-500/15 text-emerald-400" } : { phaseLabel: "快速成长期", phaseBg: "bg-emerald-500/15 text-emerald-400" };
  return { phaseLabel: "萌芽/尚未诞生", phaseBg: "bg-cyan-500/15 text-cyan-400" };
}

export function IndustryChainModal({ city, year, onYearChange, open, onClose }: { city: CityData; year: number; onYearChange?: (y: number) => void; open: boolean; onClose: () => void }) {
  const [puzzleChain, setPuzzleChain] = React.useState<string | null>(null);
  const keys = city.config.chainKeys;
  const { start, end } = city.config.timeRange;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-amber-200">产业链全生命周期 · {year}年</DialogTitle>
          <DialogDescription>节点颜色与状态随所选年份实时变化；拖动年份滑块观察产业链兴衰（与主时间轴同步）。点击「拼图」复原产业链的正确工序顺序。</DialogDescription>
        </DialogHeader>

        {/* 年份滑块（与主时间轴双向同步） */}
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2">
          <span className="text-xs font-bold tabular-nums text-amber-200">{year}</span>
          <Slider
            value={[year]}
            min={start}
            max={end}
            step={1}
            onValueChange={([v]) => onYearChange?.(v)}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground">{start}—{end}</span>
        </div>

        <div className="max-h-[60dvh] space-y-6 overflow-y-auto pr-1">
          {keys.map((k) => {
            const chain = city.chains[k];
            if (!chain) return null;
            const status = chainStatus(chain, year);
            const { phaseLabel, phaseBg } = chainPhase(chain, year);
            return (
              <div key={k}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-xl">{chain.icon}</span>
                  <h3 className="text-sm font-bold text-foreground/90">{chain.name}</h3>
                  <Badge className={status.bg}>{status.label}</Badge>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${phaseBg}`}>{phaseLabel}</span>
                  <span className="text-[11px] text-muted-foreground">{chain.lifecycle.birth}年诞生{chain.lifecycle.decline ? ` · ${chain.lifecycle.decline}年衰退` : ""}{chain.lifecycle.collapse ? ` · ${chain.lifecycle.collapse}年崩溃` : " · 延续至今"}</span>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => { audio.play("click"); setPuzzleChain(k); }}>
                    <Puzzle className="size-3.5" /> 拼图
                  </Button>
                </div>
                <ChainSVG chain={chain} year={year} />
                {chain.employment && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-secondary/60 p-2.5">
                      <div className="text-lg font-bold text-red-400">{(chain.employment.peak / 10000).toFixed(1)}万</div>
                      <div className="text-[10px] text-muted-foreground">巅峰就业</div>
                    </div>
                    <div className="rounded-lg bg-secondary/60 p-2.5">
                      <div className={`text-lg font-bold ${chain.employment.current >= chain.employment.peak ? "text-emerald-400" : "text-amber-300"}`}>{(chain.employment.current / 10000).toFixed(1)}万</div>
                      <div className="text-[10px] text-muted-foreground">终点就业 {chain.employment.current >= chain.employment.peak ? "↑" : "↓"}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>

      {puzzleChain && city.chains[puzzleChain] && (
        <ChainPuzzle
          chain={city.chains[puzzleChain]}
          city={city}
          cityKey={city.config.cityKey}
          onClose={() => setPuzzleChain(null)}
        />
      )}
    </Dialog>
  );
}

/** SVG 产业链拓扑（节点配色随年份联动：整链阶段色 + 未诞生/已衰亡淡化） */
function ChainSVG({ chain, year }: { chain: IndustryChain; year: number }) {
  const width = 640;
  const height = 90;
  const nodes = chain.nodes;
  const xs = nodes.map((n) => n.x);
  const maxX = Math.max(...xs) || width - 40;
  const scale = (width - 40) / maxX;
  const pos = (x: number, y: number) => ({ x: 20 + x * scale, y: y === 200 ? 60 : 30 });
  const st = chainStatus(chain, year);
  const lc = chain.lifecycle;
  const unborn = year < lc.birth; // 尚未诞生：整体淡化
  const gone = (lc.dead != null && year >= lc.dead) || (lc.collapse != null && year >= lc.collapse);
  const groupOpacity = unborn || gone ? 0.4 : 1;
  return (
    <div className="overflow-x-auto rounded-lg bg-secondary/50 p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[560px]" style={{ width: "100%" }}>
        <defs>
          <marker id={`arrow-${chain.name}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="rgba(201,168,76,0.7)" />
          </marker>
        </defs>
        <g opacity={groupOpacity} style={{ transition: "opacity 0.4s ease" }}>
          {chain.connections.map((c, i) => {
            const from = nodes.find((n) => n.id === c.from);
            const to = nodes.find((n) => n.id === c.to);
            if (!from || !to) return null;
            const p1 = pos(from.x, from.y);
            const p2 = pos(to.x, to.y);
            return (
              <g key={i}>
                <line x1={p1.x + 26} y1={p1.y} x2={p2.x - 28} y2={p2.y} stroke="rgba(201,168,76,0.4)" strokeWidth="1.4" markerEnd={`url(#arrow-${chain.name})`} />
                <text x={(p1.x + p2.x) / 2} y={p1.y - 5} textAnchor="middle" fill="rgba(156,163,175,0.85)" fontSize="8.5">{c.flow}</text>
              </g>
            );
          })}
          {nodes.map((n) => {
            const p = pos(n.x, n.y);
            return (
              <g key={n.id}>
                <rect x={p.x - 27} y={p.y - 15} width="54" height="30" rx="7" fill="rgba(15,18,26,0.9)" stroke={st.fill} strokeWidth="1.4" style={{ transition: "stroke 0.4s ease" }} />
                <text x={p.x} y={p.y + 3.5} textAnchor="middle" fill="#e5e7eb" fontSize="10">{n.name.length > 5 ? n.name.slice(0, 5) : n.name}</text>
              </g>
            );
          })}
        </g>
        <text x={width - 6} y={height - 4} textAnchor="end" fill="rgba(156,163,175,0.8)" fontSize="9">{year}年 · {st.label}</text>
      </svg>
    </div>
  );
}

/** 产业链拼图小游戏：把打乱的节点按正确工序排序 */
function ChainPuzzle({ chain, city, cityKey, onClose }: { chain: IndustryChain; city: CityData; cityKey: string; onClose: () => void }) {
  const correctOrder = React.useMemo(() => chain.nodes.map((n) => n.id), [chain]);
  const [items, setItems] = React.useState<{ id: string; name: string }[]>(() =>
    [...chain.nodes.map((n) => ({ id: n.id, name: n.name }))].sort(() => Math.random() - 0.5),
  );
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [overIdx, setOverIdx] = React.useState<number | null>(null);
  const [result, setResult] = React.useState<{ match: number; done: boolean }>({ match: 0, done: false });

  const submit = () => {
    const match = scoreChainPuzzle(items.map((i) => i.id), correctOrder);
    setResult({ match, done: true });
    audio.play(match >= 80 ? "achieve" : "warning");
    if (match >= 80) recordExplore(cityKey, { chainBest: match });
    onChainResult(city, match);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-200">🧩 {chain.name} · 工序拼图</DialogTitle>
          <DialogDescription>拖拽卡片，按上下游工序排列（上游在上）。</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
              onDrop={() => {
                if (dragIdx == null || dragIdx === idx) return;
                const arr = [...items];
                const [moved] = arr.splice(dragIdx, 1);
                arr.splice(idx, 0, moved);
                setItems(arr);
                audio.play("slide");
              }}
              className={`drag-card ${dragIdx === idx ? "dragging" : ""} ${overIdx === idx ? "drag-over" : ""}`}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/15 text-xs font-bold text-primary">{idx + 1}</span>
              <span className="text-sm text-foreground/90">{item.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">⋮⋮</span>
            </div>
          ))}
        </div>
        {result.done && (
          <div className={`rounded-lg border p-3 text-center ${result.match >= 80 ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
            <div className="text-2xl font-bold">{result.match}%</div>
            <div className="text-xs text-muted-foreground">
              {result.match === 100 ? "完美复原！" : result.match >= 80 ? "很接近了，正确的工序顺序：" : "再试一次，参考下图正确顺序："}
              {result.match < 100 && <span className="mt-1 block text-foreground/80">{chain.nodes.map((n) => n.name).join(" → ")}</span>}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          {!result.done ? (
            <Button className="flex-1" onClick={submit}>提交拼图</Button>
          ) : (
            <Button className="flex-1" variant="outline" onClick={() => { setItems([...chain.nodes.map((n) => ({ id: n.id, name: n.name }))].sort(() => Math.random() - 0.5)); setResult({ match: 0, done: false }); }}>
              再玩一次
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
