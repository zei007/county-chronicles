import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * GET/POST /api/leaderboard — 县长生涯排行榜（本地文件存储）
 * POST: { cityKey, cityName, playerName, score, grade, endingTitle, pop, gdp, year }
 * GET : Top 50（可按 cityKey 过滤）
 */
const STORE_DIR = path.join(process.cwd(), "data-store");
const STORE_FILE = path.join(STORE_DIR, "leaderboard.json");

interface Entry {
  cityKey: string;
  cityName: string;
  playerName: string;
  score: number;
  grade: string;
  endingTitle: string;
  pop: number;
  gdp: number;
  year: number;
  savedAt: number;
}

async function readAll(): Promise<Entry[]> {
  try {
    return JSON.parse(await fs.readFile(STORE_FILE, "utf8"));
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityKey = searchParams.get("cityKey");
  const all = await readAll();
  const filtered = cityKey ? all.filter((e) => e.cityKey === cityKey) : all;
  filtered.sort((a, b) => b.score - a.score);
  return NextResponse.json({ entries: filtered.slice(0, 50) });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry: Entry = {
      cityKey: String(body.cityKey ?? "").slice(0, 40),
      cityName: String(body.cityName ?? "").slice(0, 30),
      playerName: (String(body.playerName ?? "无名县长").slice(0, 20)) || "无名县长",
      score: Math.max(0, Math.min(100, Number(body.score) || 0)),
      grade: String(body.grade ?? "?").slice(0, 2),
      endingTitle: String(body.endingTitle ?? "").slice(0, 30),
      pop: Number(body.pop) || 0,
      gdp: Number(body.gdp) || 0,
      year: Number(body.year) || 0,
      savedAt: Date.now(),
    };
    if (!entry.cityKey) return NextResponse.json({ error: "cityKey required" }, { status: 400 });
    const all = await readAll();
    all.push(entry);
    try {
      await fs.mkdir(STORE_DIR, { recursive: true });
      await fs.writeFile(STORE_FILE, JSON.stringify(all), "utf8");
    } catch {
      // 只读文件系统（如 Vercel Serverless）明确降级：客户端展示"提交失败"
      return NextResponse.json({ error: "storage unavailable on this host" }, { status: 503 });
    }
    return NextResponse.json({ ok: true, rank: all.filter((e) => e.cityKey === entry.cityKey).sort((a, b) => b.score - a.score).findIndex((e) => e.savedAt === entry.savedAt) + 1 });
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
}
