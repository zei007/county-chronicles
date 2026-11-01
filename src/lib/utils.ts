import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 数字格式化：人口（人 → 万） */
export function fmtPop(n: number | undefined): string {
  if (n == null || isNaN(n)) return "--";
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(n >= 1000000 ? 1 : 1) + "万";
  return Math.round(n).toLocaleString("zh-CN");
}

/** 金额格式化（亿元） */
export function fmtGdp(n: number | undefined): string {
  if (n == null || isNaN(n)) return "--";
  if (n >= 10000) return (n / 10000).toFixed(2) + "万亿";
  if (n >= 100) return n.toFixed(0) + "亿";
  if (n >= 1) return n.toFixed(1) + "亿";
  return n.toFixed(2) + "亿";
}

/** 通用数字格式化 */
export function fmtNum(n: number | undefined, digits = 0): string {
  if (n == null || isNaN(n)) return "--";
  return n.toLocaleString("zh-CN", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

/** 百分比 */
export function fmtPct(v: number | undefined, digits = 1): string {
  if (v == null || isNaN(v)) return "--";
  return (v * 100).toFixed(digits) + "%";
}

/** 变化率箭头 */
export function trendArrow(prev: number | undefined, cur: number | undefined): { text: string; cls: string } {
  if (prev == null || cur == null || prev === 0) return { text: "--", cls: "text-gray-500" };
  const r = (cur - prev) / Math.abs(prev);
  if (r > 0.005) return { text: "↑ " + (r * 100).toFixed(1) + "%", cls: "text-emerald-400" };
  if (r < -0.005) return { text: "↓ " + (Math.abs(r) * 100).toFixed(1) + "%", cls: "text-red-400" };
  return { text: "→ 持平", cls: "text-gray-400" };
}
