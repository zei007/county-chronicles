"use client";

/**
 * SpaceMapModal.tsx — 空间实景对比（v1.2.2 卫星底图 + 本地肌理叠加）
 * 卫星图层为在线增强（Esri World Imagery），加载失败（完全离线）自动回退纯本地渲染；
 * 城市肌理叠加层随年份联动，展示老城/新区/建成区扩张与空置演化。
 */
import * as React from "react";
import type { CityData } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getSpaceAt } from "@/lib/engine/interp";
import { fmtPct } from "@/lib/utils";
import { audio } from "@/lib/audio";
import { SatelliteTiles, zoomForBuiltArea } from "@/components/SatelliteTiles";

/** 稳定伪随机（同一城市同一地块每次渲染一致） */
function seededRand(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function SpaceMapModal({ city, year, open, onClose }: { city: CityData; year: number; open: boolean; onClose: () => void }) {
  const isDual = city.config.spaceType === "dual_city";
  const space = getSpaceAt(city, year);
  const { start, end } = city.config.timeRange;
  const progress = Math.min(1, Math.max(0, (year - start) / (end - start)));

  const blocks = React.useMemo(() => buildCityTexture(city, year), [city, year]);
  const landmarkOld = city.space.old_city?.landmark;
  const landmarkNew = city.space.new_city?.landmark;

  /** 图层模式：satellite=卫星实景（默认，失败自动回退） | texture=城市肌理 */
  const [mode, setMode] = React.useState<"satellite" | "texture">("satellite");
  const [satFailed, setSatFailed] = React.useState(false);
  const [overlayOpacity, setOverlayOpacity] = React.useState(0.75);
  React.useEffect(() => { setSatFailed(false); }, [city.config.cityKey]);
  const satActive = mode === "satellite" && !satFailed;

  const zoom = React.useMemo(() => zoomForBuiltArea(space.built ?? space.oldArea ?? 50), [space.built, space.oldArea]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-amber-200">🛰️ 空间实景 · {year}年</DialogTitle>
          <DialogDescription>
            卫星底图（在线）+ 城市肌理叠加（随时间轴联动）：鎏金=繁华建成区，深灰=空置街区，绿=新区。
          </DialogDescription>
        </DialogHeader>

        <div className="mb-1 flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button
              onClick={() => { setMode("satellite"); audio.play("click"); }}
              className={`px-3 py-1.5 text-xs transition ${satActive ? "bg-primary/20 text-amber-200" : "text-muted-foreground hover:text-foreground"}`}
            >🛰️ 卫星实景</button>
            <button
              onClick={() => { setMode("texture"); audio.play("click"); }}
              className={`px-3 py-1.5 text-xs transition ${!satActive ? "bg-primary/20 text-amber-200" : "text-muted-foreground hover:text-foreground"}`}
            >🗺️ 城市肌理</button>
          </div>
          {satActive && (
            <label className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
              肌理叠加
              <input
                type="range" min={20} max={100} value={Math.round(overlayOpacity * 100)}
                onChange={(e) => setOverlayOpacity(Number(e.target.value) / 100)}
                className="h-1 w-24 accent-amber-400"
              />
              {Math.round(overlayOpacity * 100)}%
            </label>
          )}
          {satFailed && <span className="ml-auto text-[10px] text-muted-foreground">卫星图层不可达（离线），已回退本地示意底图</span>}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
          <div className="relative overflow-hidden rounded-lg border border-border bg-[#111420]">
            {/* 卫星底图（在线增强，失败回退） */}
            {satActive && (
              <SatelliteTiles
                lng={city.profile.coordinates[0]}
                lat={city.profile.coordinates[1]}
                zoom={zoom}
                className="absolute inset-0"
                onUnavailable={() => setSatFailed(true)}
              />
            )}
            <svg viewBox="0 0 480 320" className={`relative block h-auto w-full ${satActive ? "bg-transparent" : ""}`}>
              {/* 纯肌理模式才画地形底 */}
              {!satActive && <rect width="480" height="320" fill="#131722" />}
              {!satActive && Array.from({ length: 7 }).map((_, i) => (
                <path key={i} d={`M0 ${40 + i * 45} Q 120 ${30 + i * 45 + (i % 3) * 8} 240 ${44 + i * 45} T 480 ${38 + i * 45}`} stroke="rgba(80,90,70,0.16)" strokeWidth="14" fill="none" />
              ))}
              {!satActive && <path d="M0 250 C 120 235, 200 275, 320 255 S 450 230, 480 245" stroke="rgba(56,110,150,0.4)" strokeWidth="10" fill="none" strokeLinecap="round" />}
              {/* 城市肌理叠加层（卫星/肌理模式均显示，随年份演化） */}
              <g opacity={satActive ? overlayOpacity : 1}>
                {blocks.map((b) => (
                  <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.h} rx="2"
                    fill={b.fill} opacity={b.opacity}
                    stroke={b.vacant ? "rgba(248,113,113,0.55)" : "rgba(201,168,76,0.45)"}
                    strokeWidth="0.8"
                    style={{ transition: "all 0.6s ease" }} />
                ))}
              </g>
              {/* 地标 */}
              {isDual && landmarkNew && progress > 0.55 && (
                <g>
                  <circle cx="355" cy="95" r="5" fill="#34d399" stroke="rgba(0,0,0,0.5)" />
                  <text x="363" y="98" fill="#a7f3d0" fontSize="9" stroke="rgba(0,0,0,0.6)" strokeWidth="0.4">{landmarkNew}</text>
                </g>
              )}
              {landmarkOld && (
                <g>
                  <circle cx={isDual ? 150 : 240} cy={isDual ? 150 : 160} r="5" fill="#eab308" stroke="rgba(0,0,0,0.5)" />
                  <text x={isDual ? 158 : 248} y={isDual ? 153 : 163} fill="#fde68a" fontSize="9" stroke="rgba(0,0,0,0.6)" strokeWidth="0.4">{landmarkOld}</text>
                </g>
              )}
              {!satActive && <text x="12" y="300" fill="rgba(156,163,175,0.7)" fontSize="9">示意底图 · 依据 space_timeline 数据生成</text>}
            </svg>
            <div className="absolute top-2 right-2 rounded bg-black/55 px-2 py-1 text-[10px] text-amber-200">{year} · {progress < 0.35 ? "兴起期" : progress < 0.65 ? "扩张期" : progress < 0.85 ? "分化期" : "定型期"}</div>
          </div>

          {/* 数据侧栏 */}
          <div className="space-y-2 text-xs">
            {(isDual
              ? [
                  { label: city.config.spaceLabels?.old ?? "老城", val: space.oldArea, cls: "text-amber-300" },
                  { label: city.config.spaceLabels?.new ?? "新城", val: space.newArea, cls: "text-emerald-300" },
                ]
              : [{ label: city.config.spaceLabels?.built ?? "建成区", val: space.built, cls: "text-sky-300" }]
            ).map((r) => (
              <div key={r.label} className="rounded-lg bg-secondary/60 p-2.5">
                <div className="text-muted-foreground">{r.label}</div>
                <div className={`text-lg font-bold ${r.cls}`}>{r.val.toFixed(1)} <span className="text-[10px] font-normal">km²</span></div>
              </div>
            ))}
            <div className="rounded-lg bg-secondary/60 p-2.5">
              <div className="text-muted-foreground">空置率</div>
              <div className={`text-lg font-bold ${space.vacancy > 0.3 ? "text-red-400" : "text-foreground/90"}`}>{fmtPct(space.vacancy, 0)}</div>
              {space.vacancy > 0.3 && <div className="mt-0.5 text-[10px] text-red-400/90">⚠ 高空置预警：收缩城市特征</div>}
            </div>
            {city.space.distance_km ? (
              <div className="rounded-lg bg-secondary/60 p-2.5">
                <div className="text-muted-foreground">老城—新城距离</div>
                <div className="text-lg font-bold text-purple-300">{city.space.distance_km} <span className="text-[10px] font-normal">km</span></div>
              </div>
            ) : null}
            <button className="w-full rounded-lg border border-primary/40 py-1.5 text-[11px] text-amber-300 transition hover:bg-primary/10" onClick={() => { audio.play("click"); onClose(); }}>
              回到时间轴继续探索 →
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 根据空间数据生成城市肌理地块 */
function buildCityTexture(city: CityData, year: number) {
  const isDual = city.config.spaceType === "dual_city";
  const space = getSpaceAt(city, year);
  const st = city.space_timeline;
  const maxOld = Math.max(1, ...st.map((s) => Number(s.old_area ?? s.built ?? 0)));
  const maxNew = Math.max(1, ...st.map((s) => Number(s.new_area ?? 0)));
  const rng = seededRand(city.config.cityKey.split("").reduce((a, c) => a + c.charCodeAt(0) * 31, 7));

  const blocks: { id: string; x: number; y: number; w: number; h: number; fill: string; opacity: number; vacant: boolean }[] = [];

  const oldCx = isDual ? 150 : 210, oldCy = isDual ? 165 : 165;
  const growF = space.oldArea / maxOld; // 0-1
  const gridN = 7;
  let id = 0;
  for (let gy = 0; gy < gridN; gy++) {
    for (let gx = 0; gx < gridN; gx++) {
      const cx = oldCx + (gx - gridN / 2 + 0.5) * 30;
      const cy = oldCy + (gy - gridN / 2 + 0.5) * 26;
      const dist = Math.hypot(gx - gridN / 2 + 0.5, gy - gridN / 2 + 0.5) / (gridN / 2);
      const exists = dist < growF * 1.15 && rng() < growF * 1.3;
      if (!exists) continue;
      const vacant = rng() < space.vacancy * 1.15;
      blocks.push({
        id: `o${id++}`,
        x: cx - 13, y: cy - 10, w: 22 + rng() * 6, h: 15 + rng() * 5,
        fill: vacant ? "#3a2a2c" : "#8a6d2f",
        opacity: vacant ? 0.85 : 0.75 + rng() * 0.2,
        vacant,
      });
    }
  }

  if (isDual && maxNew > 0) {
    const newCx = 355, newCy = 95;
    const growN = space.newArea / maxNew;
    for (let gy = 0; gy < 4; gy++) {
      for (let gx = 0; gx < 4; gx++) {
        const dist = Math.hypot(gx - 1.5, gy - 1.5) / 2.2;
        if (!(dist < growN * 1.2 && rng() < growN * 1.35)) continue;
        blocks.push({
          id: `n${id++}`,
          x: newCx + (gx - 2) * 27, y: newCy + (gy - 2) * 24, w: 21 + rng() * 5, h: 14 + rng() * 5,
          fill: "#2f6d4f", opacity: 0.72 + rng() * 0.2, vacant: false,
        });
      }
    }
  }
  return blocks;
}
