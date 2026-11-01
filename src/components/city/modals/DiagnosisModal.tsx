"use client";

/**
 * DiagnosisModal.tsx — 衰落诊断实验室（两阶段拖拽排序诊断）
 * 玩法：对衰落/重生因素按重要性排序，与真实数据权重匹配评分。
 */
import * as React from "react";
import type { CityData, DiagnosisFactor } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/misc";
import { scoreDiagnosis } from "@/lib/engine/simulator";
import { audio } from "@/lib/audio";
import { recordExplore } from "@/lib/progress";
import { onDiagnosisResult } from "@/lib/achievements";
import { RotateCcw, Trophy } from "lucide-react";

export function DiagnosisModal({ city, open, onClose }: { city: CityData; open: boolean; onClose: () => void }) {
  const { decline_factors, rebirth_factors } = city.diagnosis;
  const [declineItems, setDeclineItems] = React.useState<DiagnosisFactor[]>(() => shuffle(decline_factors));
  const [rebirthItems, setRebirthItems] = React.useState<DiagnosisFactor[]>(() => shuffle(rebirth_factors));
  const [declineResult, setDeclineResult] = React.useState<ReturnType<typeof scoreDiagnosis> | null>(null);
  const [rebirthResult, setRebirthResult] = React.useState<ReturnType<typeof scoreDiagnosis> | null>(null);

  React.useEffect(() => {
    if (open) {
      setDeclineItems(shuffle(decline_factors));
      setRebirthItems(shuffle(rebirth_factors));
      setDeclineResult(null);
      setRebirthResult(null);
    }
  }, [open, decline_factors, rebirth_factors]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-amber-200">🩺 衰落诊断实验室</DialogTitle>
          <DialogDescription>拖拽卡片对因素按重要性排序，提交后与真实研究权重比对。</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="decline">
          <TabsList className="w-full">
            <TabsTrigger value="decline">① 衰落诊断</TabsTrigger>
            <TabsTrigger value="rebirth">② 重生诊断</TabsTrigger>
          </TabsList>

          <TabsContent value="decline" className="pt-3">
            <DiagnosisPhase
              city={city}
              cityKey={city.config.cityKey}
              kind="decline"
              items={declineItems}
              setItems={setDeclineItems}
              result={declineResult}
              setResult={setDeclineResult}
              factors={decline_factors}
              intro={`任务：对${city.profile.name}衰落的关键因素排序，最重要的排最前。`}
            />
          </TabsContent>

          <TabsContent value="rebirth" className="pt-3">
            <DiagnosisPhase
              city={city}
              cityKey={city.config.cityKey}
              kind="rebirth"
              items={rebirthItems}
              setItems={setRebirthItems}
              result={rebirthResult}
              setResult={setRebirthResult}
              factors={rebirth_factors}
              intro={`任务：对${city.profile.name}成功转型的关键因素排序。`}
              successTone
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function DiagnosisPhase({
  city, cityKey, kind, items, setItems, result, setResult, factors, intro, successTone,
}: {
  city: CityData;
  cityKey: string;
  kind: "decline" | "rebirth";
  items: DiagnosisFactor[];
  setItems: (f: DiagnosisFactor[]) => void;
  result: ReturnType<typeof scoreDiagnosis> | null;
  setResult: (r: ReturnType<typeof scoreDiagnosis> | null) => void;
  factors: DiagnosisFactor[];
  intro: string;
  successTone?: boolean;
}) {
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [overIdx, setOverIdx] = React.useState<number | null>(null);

  const drop = (idx: number) => {
    if (dragIdx == null || dragIdx === idx) return;
    const arr = [...items];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(idx, 0, moved);
    setItems(arr);
    setDragIdx(null);
    setOverIdx(null);
    audio.play("slide");
  };

  const submit = () => {
    const r = scoreDiagnosis(items.map((i) => i.id), factors);
    setResult(r);
    audio.play(r.match >= 70 ? "achieve" : "warning");
    recordExplore(cityKey, { diagnosisBest: r.match });
    onDiagnosisResult(city, r.match);
  };

  const trueOrder = [...factors].sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-3">
      <p className="rounded bg-secondary/60 p-2.5 text-xs text-muted-foreground">{intro}</p>
      <div className="space-y-1.5">
        {items.map((f, idx) => (
          <div
            key={f.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            onDrop={() => drop(idx)}
            className={`drag-card ${dragIdx === idx ? "dragging" : ""} ${overIdx === idx ? "drag-over" : ""}`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/15 text-xs font-bold text-primary">{idx + 1}</span>
            <span className="text-base">{f.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground/90">{f.name}</div>
              {result && <div className="mt-0.5 text-[11px] text-muted-foreground">{f.evidence}</div>}
            </div>
            {result && (
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${result.detail.find((d) => d.id === f.id)?.userRank === result.detail.find((d) => d.id === f.id)?.trueRank ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                真实排名 #{(result.detail.find((d) => d.id === f.id)?.trueRank ?? 0) + 1}
              </span>
            )}
          </div>
        ))}
      </div>

      {result && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-4">
            <div className="relative flex size-16 items-center justify-center">
              <svg viewBox="0 0 36 36" className="absolute inset-0">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={successTone ? "#34d399" : "#eab308"} strokeWidth="3.5" strokeDasharray={`${(result.match / 100) * 97.4} 97.4`} strokeLinecap="round" transform="rotate(-90 18 18)" />
              </svg>
              <span className="text-sm font-bold">{result.match}%</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{result.match >= 85 ? "🥇 专家级诊断！" : result.match >= 70 ? "👍 判断相当准确" : result.match >= 50 ? "🤔 接近真相" : "📚 继续研究"}</div>
              <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">真实权重排序：<b className="text-foreground/85">{trueOrder.map((f, i) => `${i + 1}.${f.name}`).join("  ")}</b></div>
              {result.match >= 85 && <div className="mt-1 text-[11px] text-amber-300"><Trophy className="mr-1 inline size-3" />诊断专家成就已解锁</div>}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!result ? (
          <Button className="flex-1" onClick={submit}>提交{kind === "decline" ? "衰落" : "重生"}诊断</Button>
        ) : (
          <Button className="flex-1" variant="outline" onClick={() => { setResult(null); setItems(shuffle(factors)); }}><RotateCcw className="size-4" /> 重新诊断</Button>
        )}
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 保留 Progress 引用防止 tree-shake 告警（评分环已用 SVG 实现）
void Progress;
