"use client";

/**
 * MigrationModal.tsx — 人口迁徙流向动画（ECharts lines + 本地中国地图）
 * 迁徙目的地经纬度内置；随年份联动规模。
 */
import * as React from "react";
import type { CityData, MigrationDestination } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EChart } from "@/components/EChart";
import { fmtPop, BASE_PATH } from "@/lib/utils";

/** 主要城市经纬度（用于飞线终点） */
const CITY_COORDS: Record<string, [number, number]> = {
  北京: [116.4, 39.9], 上海: [121.47, 31.23], 广州: [113.26, 23.13], 深圳: [114.06, 22.55],
  天津: [117.2, 39.13], 重庆: [106.55, 29.56], 成都: [104.07, 30.57], 武汉: [114.3, 30.6],
  西安: [108.94, 34.34], 杭州: [120.15, 30.28], 南京: [118.8, 32.06], 郑州: [113.63, 34.75],
  济南: [117.12, 36.65], 青岛: [120.38, 36.07], 沈阳: [123.43, 41.8], 大连: [121.62, 38.91],
  长春: [125.32, 43.9], 哈尔滨: [126.64, 45.75], 石家庄: [114.51, 38.04], 太原: [112.55, 37.87],
  呼和浩特: [111.75, 40.84], 兰州: [103.83, 36.06], 西宁: [101.78, 36.62], 银川: [106.23, 38.49],
  乌鲁木齐: [87.62, 43.82], 拉萨: [91.11, 29.66], 昆明: [102.71, 25.04], 贵阳: [106.63, 26.65],
  南宁: [108.37, 22.82], 长沙: [112.94, 28.23], 南昌: [115.86, 28.68], 合肥: [117.28, 31.86],
  福州: [119.3, 26.08], 厦门: [118.09, 24.48], 海口: [110.2, 20.04], 三亚: [109.51, 18.25],
  苏州: [120.58, 31.3], 宁波: [121.55, 29.87], 温州: [120.7, 28.0], 东营: [118.67, 37.43],
  烟台: [121.39, 37.52], 潍坊: [119.16, 36.71], 临沂: [118.35, 35.05], 唐山: [118.18, 39.63],
  保定: [115.46, 38.87], 洛阳: [112.45, 34.62], 包头: [109.84, 40.66], 鄂尔多斯: [109.78, 39.61],
  齐齐哈尔: [123.92, 47.35], 大庆: [125.1, 46.59], 吉林: [126.55, 43.84], 鞍山: [122.99, 41.11],
  抚顺: [123.96, 41.87], 本溪: [123.77, 41.3], 丹东: [124.38, 40.13], 锦州: [121.14, 41.1],
  营口: [122.24, 40.67], 阜新: [121.67, 42.02], 辽阳: [123.17, 41.27], 盘锦: [122.07, 41.12],
  铁岭: [123.84, 42.29], 朝阳: [120.45, 41.57], 葫芦岛: [120.84, 40.71],
  绵阳: [104.68, 31.47], 德阳: [104.4, 31.13], 宜宾: [104.64, 28.75], 南充: [106.11, 30.84],
  柳州: [109.43, 24.33], 桂林: [110.29, 25.27], 遵义: [106.93, 27.73], 六盘水: [104.83, 26.6],
  曲靖: [103.8, 25.5], 玉溪: [102.55, 24.35], 大理: [100.27, 25.61], 咸阳: [108.71, 34.33],
  宝鸡: [107.24, 34.36], 邯郸: [114.54, 36.63], 徐州: [117.28, 34.26], 常州: [119.97, 31.81],
  嘉兴: [120.76, 30.75], 金华: [119.65, 29.08], 台州: [121.42, 28.66], 中山: [113.39, 22.52],
  东莞: [113.75, 23.02], 佛山: [113.12, 23.02], 惠州: [114.42, 23.11], 海西: [97.37, 37.37],
  全国: [104.5, 36.5], 其他地区: [104.5, 36.5],
};

export function MigrationModal({ city, year, open, onClose }: { city: CityData; year: number; open: boolean; onClose: () => void }) {
  const [geo, setGeo] = React.useState<unknown>(null);
  React.useEffect(() => {
    if (!open) return;
    fetch(`${BASE_PATH}/geo/china.json`).then((r) => r.json()).then(setGeo).catch(() => {});
  }, [open]);

  const origin = city.profile.coordinates;
  const { yearsSinceStart, scale } = React.useMemo(() => {
    const { start, end } = city.config.timeRange;
    const p = Math.min(1, Math.max(0, (year - start) / Math.max(1, end - start)));
    return { yearsSinceStart: year, scale: p < 0.5 ? 0.3 + p * 1.2 : 1 };
  }, [city, year]);

  const destinations = React.useMemo(() => {
    const out: (MigrationDestination & { lnglat: [number, number] })[] = [];
    for (const d of city.migration.destinations ?? []) {
      const coords = CITY_COORDS[d.city] ?? CITY_COORDS[d.province];
      if (coords) out.push({ ...d, lnglat: coords });
    }
    return out;
  }, [city]);

  const option = React.useMemo(() => {
    if (!geo) return {};
    const lines = destinations.map((d) => ({
      coords: [origin, d.lnglat],
      value: Math.round(d.count * scale),
      reason: d.reason,
      to: d.city,
    }));
    const points = destinations.map((d) => ({
      name: d.city,
      value: [d.lnglat[0], d.lnglat[1], Math.round(d.count * scale)],
    }));
    const maxCount = Math.max(1, ...points.map((p) => p.value[2]));
    return {
      backgroundColor: "transparent",
      geo: {
        map: "china", roam: true, zoom: 1.1, center: [104.5, 36.5],
        itemStyle: { areaColor: "rgba(30,34,44,0.9)", borderColor: "rgba(201,168,76,0.3)", borderWidth: 0.6 },
        emphasis: { label: { show: true, color: "#e5e7eb", fontSize: 10 } },
      },
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(20,22,28,0.94)", borderColor: "rgba(201,168,76,0.4)", textStyle: { color: "#e5e7eb", fontSize: 12 },
        formatter: (p: { data?: { to?: string; reason?: string; value?: number | number[] } }) => {
          const d = p.data;
          if (d?.to) return `<b>→ ${d.to}</b><br/>规模约 ${Math.round(Number(d.value) / 10000 * 10) / 10} 万人<br/>${d.reason ?? ""}`;
          if (Array.isArray(d?.value) && p.data && "name" in (d as object)) {
            const v = d.value as number[];
            return `<b>${(d as { name?: string }).name}</b><br/>流入约 ${(v[2] / 10000).toFixed(1)} 万人`;
          }
          return "";
        },
      },
      series: [
        {
          type: "lines", coordinateSystem: "geo", zlevel: 2,
          effect: { show: true, period: 4.5, trailLength: 0.4, symbol: "arrow", symbolSize: 6, color: "#fbbf24" },
          lineStyle: { color: "#f59e0b", width: 1.4, opacity: 0.45, curveness: 0.25 },
          data: lines,
        },
        {
          type: "effectScatter", coordinateSystem: "geo", zlevel: 3,
          data: points,
          symbolSize: (val: number[]) => 6 + (val[2] / maxCount) * 14,
          rippleEffect: { brushType: "stroke", scale: 2.6 },
          itemStyle: { color: "#22d3ee", shadowBlur: 10, shadowColor: "#22d3ee" },
          label: { show: true, formatter: "{b}", position: "right", color: "rgba(255,255,255,0.75)", fontSize: 9, textBorderColor: "rgba(0,0,0,0.6)", textBorderWidth: 2 },
        },
        {
          type: "scatter", coordinateSystem: "geo", zlevel: 4,
          data: [{ value: origin, name: city.profile.name }],
          symbolSize: 13,
          itemStyle: { color: "#eab308", borderColor: "#fff", borderWidth: 2 },
          label: { show: true, formatter: city.profile.name, position: "top", color: "#fde68a", fontSize: 11, fontWeight: "bold" as const },
        },
      ],
    };
  }, [geo, destinations, origin, scale, city.profile.name, city.profile.coordinates]);

  const outflow = destinations.reduce((s, d) => s + d.count, 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-amber-200">🌪️ 人口迁徙流向 · {year}年</DialogTitle>
          <DialogDescription>拖动主时间轴后打开可联动年份；迁徙规模随历史进程缩放。</DialogDescription>
        </DialogHeader>
        <div className="h-[52dvh] min-h-72 w-full">{geo ? <EChart option={option} registerMapName="china" registerMapGeoJson={geo} className="h-full w-full" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><span className="animate-pulse">加载地图…</span></div>}</div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-lg bg-secondary/60 p-2.5 text-center">
            <div className="text-base font-bold text-amber-300">{fmtPop(outflow * scale)}</div>
            <div className="text-[10px] text-muted-foreground">{year}年累计外流</div>
          </div>
          {destinations.slice(0, 3).map((d) => (
            <div key={d.city} className="rounded-lg bg-secondary/60 p-2.5 text-center">
              <div className="text-base font-bold text-cyan-300">{(d.count / 10000).toFixed(1)}万</div>
              <div className="truncate text-[10px] text-muted-foreground">→ {d.city} · {d.reason}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] leading-relaxed text-muted-foreground/70">注：迁徙流向基于学术文献与公开研究整理，为估算值；终点规模按年份进度缩放（当前 {yearsSinceStart} 年）。</p>
      </DialogContent>
    </Dialog>
  );
}
