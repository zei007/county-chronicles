import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITY_LIST, SEZ_LIST } from "@/data/cities";
import { SimGame } from "@/components/play/SimGame";

/** v1.2：对照组（增长叙事）城市解锁经营模式，与资源型城市共用引擎 */
const ALL_LIST = [...CITY_LIST, ...SEZ_LIST];

export function generateStaticParams() {
  return ALL_LIST.map((c) => ({ key: c.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  const city = ALL_LIST.find((c) => c.key === key)?.data;
  if (!city) return { title: "未找到城市" };
  return { title: `${city.simMode === "growth" ? "主政生涯" : "县长生涯"} · ${city.profile.name}`, description: `在${city.profile.name}就任主政者，用真实参数改写城市命运。` };
}

export default async function PlayPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const city = ALL_LIST.find((c) => c.key === key)?.data;
  if (!city) notFound();
  return <SimGame city={city} />;
}

