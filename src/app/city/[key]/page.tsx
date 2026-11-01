import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITY_LIST, SEZ_LIST } from "@/data/cities";
import { CityGame } from "@/components/city/CityGame";

export function generateStaticParams() {
  return [...CITY_LIST, ...SEZ_LIST].map((c) => ({ key: c.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  const city = [...CITY_LIST, ...SEZ_LIST].find((c) => c.key === key)?.data;
  if (!city) return { title: "未找到城市" };
  return {
    title: `${city.profile.name} · 县城兴衰史`,
    description: city.profile.description,
  };
}

export default async function CityPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const city = [...CITY_LIST, ...SEZ_LIST].find((c) => c.key === key)?.data;
  if (!city) notFound();
  return <CityGame city={city} />;
}
