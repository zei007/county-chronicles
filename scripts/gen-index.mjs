/** gen-index.mjs — 由 _index.json 生成 src/data/cities/index.ts（静态导入全部城市） */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, process.argv[2] || "src/data/cities");
const idx = JSON.parse(fs.readFileSync(path.join(dir, "_index.json"), "utf8"));

const lines = [
  `/** 自动生成: node scripts/gen-index.mjs — 请勿手工编辑 */
import type { CityData } from "@/lib/types";
`,
];
const entries = [];
for (const c of idx.cities) {
  const varName = "city_" + c.key.replace(/[^a-z0-9]/gi, "_");
  lines.push(`import ${varName} from "./${c.key}.json";`);
  entries.push(`  { key: ${JSON.stringify(c.key)}, data: ${varName} as unknown as CityData },`);
}
const sezEntries = [];
for (const c of idx.sez) {
  const varName = "sez_" + c.key.replace(/[^a-z0-9]/gi, "_");
  lines.push(`import ${varName} from "./sez/${c.key}.json";`);
  sezEntries.push(`  { key: ${JSON.stringify(c.key)}, data: ${varName} as unknown as CityData },`);
}

lines.push("");
lines.push("export const CITY_MAP: Record<string, CityData> = {};");
lines.push("export const CITY_LIST: { key: string; data: CityData }[] = [");
lines.push(...entries);
lines.push("];");
lines.push("");
lines.push("/** 对照组城市（经济特区/开放高地，用于「兴」的参照） */");
lines.push("export const SEZ_LIST: { key: string; data: CityData }[] = [");
lines.push(...sezEntries);
lines.push("];");
lines.push("");
lines.push("for (const it of CITY_LIST) CITY_MAP[it.key] = it.data;");
lines.push("for (const it of SEZ_LIST) CITY_MAP[it.key] = it.data;");
lines.push("");
lines.push("export function getCity(key: string): CityData | undefined {");
lines.push("  return CITY_MAP[key];");
lines.push("}");
lines.push("");

fs.writeFileSync(path.join(dir, "index.ts"), lines.join("\n"), "utf8");
console.log("index.ts written:", idx.cities.length, "cities,", idx.sez.length, "sez");
