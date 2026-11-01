"use client";

/**
 * EChart.tsx — ECharts React 封装（本地打包 echarts，无 CDN）
 * 统一处理：客户端挂载、暗色主题、resize、notMerge 更新、点击事件。
 */
import * as React from "react";
import * as echarts from "echarts";
import { cn } from "@/lib/utils";

export interface EChartProps {
  option: echarts.EChartsOption | Record<string, unknown>;
  className?: string;
  style?: React.CSSProperties;
  onEvents?: Record<string, (params: unknown) => void>;
  notMerge?: boolean;
  /** 注册为 ECharts 地图的 GeoJSON */
  registerMapName?: string;
  registerMapGeoJson?: unknown;
  onClickSeries?: (params: echarts.ECElementEvent) => void;
}

export function EChart({ option, className, style, onEvents, notMerge = true, registerMapName, registerMapGeoJson }: EChartProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<echarts.ECharts | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    if (registerMapName && registerMapGeoJson && !echarts.getMap(registerMapName)) {
      echarts.registerMap(registerMapName, registerMapGeoJson as never);
    }
    const chart = echarts.init(ref.current, "dark", { renderer: "canvas" });
    chartRef.current = chart;
    setReady(true);
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [registerMapName, registerMapGeoJson]);

  React.useEffect(() => {
    if (!ready || !chartRef.current) return;
    chartRef.current.setOption(option as echarts.EChartsOption, notMerge);
  }, [option, ready, notMerge]);

  React.useEffect(() => {
    if (!ready || !chartRef.current || !onEvents) return;
    for (const [evt, fn] of Object.entries(onEvents)) {
      chartRef.current.on(evt, fn as never);
    }
    return () => {
      for (const evt of Object.keys(onEvents)) chartRef.current?.off(evt);
    };
  }, [onEvents, ready]);

  return <div ref={ref} className={cn("echart-box", className)} style={style} />;
}
