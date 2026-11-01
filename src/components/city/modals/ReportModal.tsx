"use client";

/**
 * ReportModal.tsx — 城市兴衰档案生成（可导出 HTML / 打印）
 */
import * as React from "react";
import type { CityData } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getYearSnapshot } from "@/lib/engine/interp";
import { calibrate } from "@/lib/engine/simulator";
import { fmtPop, fmtGdp } from "@/lib/utils";
import { recordExplore } from "@/lib/progress";
import { onReportCreated } from "@/lib/achievements";
import { audio } from "@/lib/audio";
import { Download, Printer } from "lucide-react";

export function ReportModal({ city, open, onClose }: { city: CityData; open: boolean; onClose: () => void }) {
  const html = React.useMemo(() => buildReportHtml(city), [city]);

  React.useEffect(() => {
    if (open) {
      audio.play("achieve");
      recordExplore(city.config.cityKey, { reports: 1 });
      onReportCreated();
    }
  }, [open, city]);

  const exportHtml = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `城市档案-${city.profile.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
    audio.play("coin");
  };

  const print = () => {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-amber-200">🗂️ 城市兴衰档案</DialogTitle>
          <DialogDescription>自动汇编城市名片、核心数据、关键节点、诊断结论与转型评估。</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportHtml}><Download className="size-3.5" /> 导出 HTML</Button>
          <Button size="sm" variant="outline" onClick={print}><Printer className="size-3.5" /> 打印 / 存为PDF</Button>
        </div>
        <div className="max-h-[56dvh] overflow-y-auto rounded-lg bg-[#f5f2ea] p-5 text-[#1c1917] shadow-inner" dangerouslySetInnerHTML={{ __html: bodyOnly(html) }} />
      </DialogContent>
    </Dialog>
  );
}

function bodyOnly(html: string) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
}

function buildReportHtml(city: CityData): string {
  const p = city.profile;
  const cfg = city.config;
  const params = calibrate(city);
  const tl = city.timeline;
  const last = tl[tl.length - 1];
  const first = tl[0];
  const peak = tl.reduce((a, b) => ((b.pop ?? 0) > (a.pop ?? 0) ? b : a), tl[0]);
  const keyEvents = tl.filter((t) => t.event).slice(0, 8);
  const diagnosis = [...city.diagnosis.decline_factors].sort((a, b) => b.weight - a.weight);
  const sources = city.sources ?? [];
  const now = new Date().toLocaleString("zh-CN");
  const popRetention = ((last.pop ?? 0) / Math.max(peak.pop ?? 1, 1)) * 100;

  const rows = keyEvents.map((e) => `<tr><td class="y">${e.year}</td><td><b>${e.title}</b><br/><span class="d">${e.desc}</span></td></tr>`).join("");

  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>城市兴衰档案 · ${p.name}</title><style>
  body{font-family:"Noto Serif SC","Songti SC",SimSun,serif;background:#f5f2ea;color:#1c1917;margin:0;padding:32px;}
  .wrap{max-width:760px;margin:0 auto;background:#fffdf6;border:1px solid #d6c9a8;padding:40px;box-shadow:0 2px 24px rgba(0,0,0,.08);position:relative}
  .stamp{position:absolute;top:28px;right:32px;border:3px double #b91c1c;color:#b91c1c;padding:6px 14px;font-weight:900;letter-spacing:4px;transform:rotate(8deg);opacity:.75;font-size:14px}
  h1{font-size:26px;margin:0 0 4px} .sub{color:#78716c;font-size:12px;margin-bottom:20px}
  h2{font-size:15px;border-left:4px solid #b45309;padding-left:8px;margin:26px 0 10px;color:#92400e}
  table{width:100%;border-collapse:collapse;font-size:12.5px} td,th{border-bottom:1px solid #e7dcc3;padding:7px 6px;vertical-align:top;text-align:left}
  .y{width:64px;font-weight:700;color:#b45309} .d{color:#78716c;font-size:11.5px}
  .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0}
  .card{background:#faf6ec;border:1px solid #e7dcc3;padding:10px;border-radius:6px;text-align:center}
  .card b{display:block;font-size:17px;color:#92400e} .card span{font-size:10.5px;color:#78716c}
  .tag{display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;padding:2px 8px;border-radius:3px;margin:0 4px 4px 0}
  .fact{font-size:12.5px;line-height:1.8} .src{font-size:10.5px;color:#a8a29e} footer{margin-top:26px;text-align:center;color:#a8a29e;font-size:10.5px}
  @media print{ body{padding:0;background:#fff} .wrap{box-shadow:none} }
  </style></head><body><div class="wrap">
  <div class="stamp">${cfg.reportStamp ?? "ARCHIVED"}</div>
  <h1>${p.name} · 兴衰档案</h1>
  <div class="sub">${p.province} ${p.prefecture ?? ""} · 时间轴 ${cfg.timeRange.start}—${cfg.timeRange.end} · 生成于 ${now}</div>
  <div>${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>

  <h2>一、城市名片</h2>
  <p class="fact">${p.description}</p>

  <h2>二、核心数据</h2>
  <div class="cards">
    <div class="card"><b>${fmtPop(first.pop)}</b><span>起点人口(${first.year})</span></div>
    <div class="card"><b>${fmtPop(peak.pop)}</b><span>峰值人口(${peak.year})</span></div>
    <div class="card"><b>${fmtPop(last.pop)}</b><span>终点人口(${last.year})</span></div>
    <div class="card"><b>${popRetention.toFixed(0)}%</b><span>人口留存率</span></div>
    <div class="card"><b>${fmtGdp(first.gdp)}</b><span>起点GDP</span></div>
    <div class="card"><b>${fmtGdp(params.peakGdpReal)}</b><span>GDP峰值</span></div>
    <div class="card"><b>${fmtGdp(last.gdp)}</b><span>终点GDP</span></div>
    <div class="card"><b>${cfg.primaryIndicators[0]?.label ?? "--"}</b><span>主导产业峰值 ${params.peakPrimary}${cfg.primaryIndicators[0]?.unit ?? ""}</span></div>
  </div>

  <h2>三、关键历史节点</h2>
  <table><tr><th style="width:64px">年份</th><th>事件</th></tr>${rows}</table>

  <h2>四、衰落诊断（真实权重排序）</h2>
  <table>${diagnosis.map((f, i) => `<tr><td class="y">#${i + 1}</td><td><b>${f.icon} ${f.name}</b>（权重 ${f.weight}%）<br/><span class="d">${f.evidence}</span></td></tr>`).join("")}</table>

  <h2>五、转型评估</h2>
  <p class="fact"><b>${cfg.transformationAssessment}</b><br/>${cfg.transformationDetail}</p>

  ${sources.length ? `<h2>六、数据来源</h2><p class="src">${sources.map((s) => `• ${s.desc}${s.url ? ` — ${s.url}` : ""}`).join("<br/>")}</p>` : ""}
  <footer>《县城兴衰史》自动生成 · 数据仅供教学演示，请以官方发布为准</footer>
  </div></body></html>`;
}
