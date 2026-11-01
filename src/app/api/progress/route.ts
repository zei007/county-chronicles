import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * GET/POST /api/progress — 云端进度存档（可选功能，客户端离线时静默降级到 localStorage）
 * 存储为本地 JSON 文件（data-store/progress.json），无外部数据库依赖。
 */
const STORE_DIR = path.join(process.cwd(), "data-store");
const STORE_FILE = path.join(STORE_DIR, "progress.json");

type Store = Record<string, { savedAt: number; payload: unknown }>;

async function readStore(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(STORE_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeStore(s: Store) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(s), "utf8");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playerId = searchParams.get("playerId");
  if (!playerId) return NextResponse.json({ error: "playerId required" }, { status: 400 });
  const store = await readStore();
  const entry = store[playerId];
  return NextResponse.json({ playerId, data: entry?.payload ?? null, savedAt: entry?.savedAt ?? null });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const playerId = body?.playerId;
    if (!playerId || typeof playerId !== "string") {
      return NextResponse.json({ error: "playerId required" }, { status: 400 });
    }
    const store = await readStore();
    store[playerId] = { savedAt: Date.now(), payload: body };
    await writeStore(store);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
}
