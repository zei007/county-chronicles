"use client";

/**
 * SatelliteTiles.tsx — 卫星影像瓦片图层（v1.2.2 在线增强）
 *
 * 数据源：Esri World Imagery 免费瓦片服务（无需密钥）。
 * 零 CDN 承诺不破坏：瓦片仅在本图层开启时按需加载；
 * 加载失败（完全离线/内网）自动触发 onUnavailable，父组件回退本地渲染。
 */
import * as React from "react";

const TILE = 256;

export function SatelliteTiles({
  lng,
  lat,
  zoom,
  className,
  onUnavailable,
}: {
  lng: number;
  lat: number;
  zoom: number;
  className?: string;
  /** 任一瓦片加载失败即触发（离线回退信号） */
  onUnavailable?: () => void;
}) {
  const [failed, setFailed] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  // 城市/缩放变化时重置状态
  React.useEffect(() => {
    setFailed(false);
    setReady(false);
  }, [lng, lat, zoom]);

  // Web 墨卡托瓦片坐标
  const n = Math.pow(2, zoom);
  const clampedLat = Math.max(-85.05, Math.min(85.05, lat));
  const xf = ((lng + 180) / 360) * n;
  const yf = ((1 - Math.log(Math.tan((clampedLat * Math.PI) / 180) + 1 / Math.cos((clampedLat * Math.PI) / 180)) / Math.PI) / 2) * n;
  const cx = Math.floor(xf);
  const cy = Math.floor(yf);
  // 像素级居中偏移
  const offsetX = (cx + 0.5 - xf) * TILE;
  const offsetY = (cy + 0.5 - yf) * TILE;

  const tiles: { x: number; y: number; key: string }[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++)
      tiles.push({ x: cx + dx, y: cy + dy, key: `${cx + dx}-${cy + dy}` });

  const url = (x: number, y: number) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;

  const onError = () => {
    if (!failed) {
      setFailed(true);
      onUnavailable?.();
    }
  };

  if (failed) return null;

  // 定位（absolute/relative）由调用方通过 className 决定，避免类冲突
  return (
    <div className={`overflow-hidden bg-[#111420] ${className ?? ""}`}>
      {!ready && <div className="absolute inset-0 animate-pulse bg-secondary/40" aria-hidden />}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))` }}
      >
        {tiles.map((t) => (
          <img
            key={t.key}
            src={url(t.x, t.y)}
            width={TILE}
            height={TILE}
            alt=""
            loading="eager"
            draggable={false}
            onError={onError}
            onLoad={() => setReady(true)}
            className="absolute select-none"
            style={{ left: (t.x - cx) * TILE - TILE / 2, top: (t.y - cy) * TILE - TILE / 2, maxWidth: "none" }}
          />
        ))}
      </div>
      <div className="absolute bottom-1 right-1 rounded bg-black/55 px-1.5 py-0.5 text-[9px] text-white/70">
        影像 © Esri World Imagery（在线图层，离线自动回退示意底图）
      </div>
    </div>
  );
}

/** 依据建成区面积估算卫星缩放级别（33→13 级，大城市更宏观） */
export function zoomForBuiltArea(areaKm2: number): number {
  if (areaKm2 < 50) return 13;
  if (areaKm2 < 200) return 12;
  if (areaKm2 < 800) return 11;
  return 10;
}
