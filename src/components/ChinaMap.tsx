"use client";

/**
 * ChinaMap.tsx — 首页真实中国地图（本地 GeoJSON + ECharts geo）
 * 显示资源型城市金点（脉冲动画）与对照城市银点；点击/悬停交互。
 */
import * as React from "react";
import { EChart } from "@/components/EChart";
import type { CityData } from "@/lib/types";
import { audio } from "@/lib/audio";
import { BASE_PATH } from "@/lib/utils";

export interface MapCity {
  key: string;
  name: string;
  coords: [number, number];
  tags: string[];
  province?: string;
  contrast?: boolean; // 对照组
}

export function ChinaMap({
  cities,
  visited,
  onSelect,
  hovered,
  onHover,
  selected,
}: {
  cities: MapCity[];
  visited: string[];
  onSelect: (key: string) => void;
  hovered: string | null;
  onHover: (key: string | null) => void;
  selected?: string | null;
}) {
  const [geo, setGeo] = React.useState<unknown>(null);

  React.useEffect(() => {
    fetch(`${BASE_PATH}/geo/china.json`)
      .then((r) => r.json())
      .then(setGeo)
      .catch(() => setGeo(null));
  }, []);

  const option = React.useMemo(() => {
    if (!geo) return {};
    const normalCities = cities.filter((c) => !c.contrast);
    const contrastCities = cities.filter((c) => c.contrast);
    const scatter = (list: MapCity[], symbol: string, size: number, color: string) => ({
      type: "scatter" as const,
      coordinateSystem: "geo" as const,
      data: list.map((c) => ({
        name: c.key,
        value: [c.coords[0], c.coords[1], 1],
        cityName: c.name,
        tags: c.tags,
        visited: visited.includes(c.key),
      })),
      symbol,
      symbolSize: (val: number[], params: { data?: { visited?: boolean } }) =>
        params.data?.visited ? size + 3 : size,
      itemStyle: { color, shadowBlur: 12, shadowColor: color },
      label: {
        show: true,
        position: "right",
        formatter: (p: { data: { cityName: string } }) => p.data.cityName,
        color: "rgba(255,255,255,0.82)",
        fontSize: 10,
        textBorderColor: "rgba(0,0,0,0.6)",
        textBorderWidth: 2,
      },
      emphasis: { scale: 1.6 },
      zlevel: 2,
    });

    const effectScatter = {
      type: "effectScatter" as const,
      coordinateSystem: "geo" as const,
      data: normalCities.map((c) => ({
        value: [c.coords[0], c.coords[1], 1],
        cityName: c.name,
        cityKey: c.key,
      })),
      symbolSize: 9,
      rippleEffect: { brushType: "stroke", scale: 3.2, period: 4.5 },
      itemStyle: { color: "#eab308", shadowBlur: 16, shadowColor: "#eab308" },
      zlevel: 3,
      silent: true,
    };

    return {
      backgroundColor: "transparent",
      geo: {
        map: "china",
        roam: true,
        zoom: 1.18,
        center: [104.5, 37.2],
        scaleLimit: { min: 0.8, max: 5 },
        itemStyle: {
          areaColor: "rgba(38,42,54,0.85)",
          borderColor: "rgba(201,168,76,0.35)",
          borderWidth: 0.6,
          shadowColor: "rgba(0,0,0,0.45)",
          shadowBlur: 18,
        },
        emphasis: {
          itemStyle: { areaColor: "rgba(64,70,86,0.95)" },
          label: { show: false },
        },
        select: { itemStyle: { areaColor: "rgba(201,168,76,0.25)" } },
      },
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(20,22,28,0.94)",
        borderColor: "rgba(201,168,76,0.4)",
        textStyle: { color: "#e5e7eb", fontSize: 12 },
        formatter: (p: { data?: { cityName?: string; tags?: string[]; visited?: boolean } }) => {
          if (!p.data?.cityName) return "";
          const tags = (p.data.tags ?? []).slice(0, 3).join(" · ");
          return `<div style="font-weight:700;margin-bottom:2px">${p.data.cityName}${p.data.visited ? ' <span style="color:#eab308">✓已探索</span>' : ""}</div><div style="color:#9ca3af">${tags}</div>`;
        },
      },
      series: [
        scatter(normalCities, "circle", 8, "#eab308"),
        scatter(contrastCities, "diamond", 7, "#7dd3fc"),
        effectScatter,
      ],
    };
  }, [geo, cities, visited]);

  const onEvents = React.useMemo(
    () => ({
      click: (paramsRaw: unknown) => {
        const params = paramsRaw as { name?: string; componentType?: string };
        if (params.componentType === "series" && params.name) {
          audio.play("click");
          onSelect(params.name);
        }
      },
      mouseover: (paramsRaw: unknown) => {
        const params = paramsRaw as { name?: string; componentType?: string };
        if (params.componentType === "series" && params.name) onHover(params.name);
      },
      mouseout: () => onHover(null),
    }),
    [onSelect, onHover],
  );

  if (!geo) {
    return (
      <div className="flex h-full min-h-80 items-center justify-center text-sm text-muted-foreground">
        <span className="animate-pulse">正在加载本地中国地图…</span>
      </div>
    );
  }
  return <EChart option={option} registerMapName="china" registerMapGeoJson={geo} onEvents={onEvents} className="h-full w-full" />;
}
