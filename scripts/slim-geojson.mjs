/**
 * slim-geojson.mjs — 中国地图 GeoJSON 精度瘦身（一次性工具）
 * 坐标统一截断到 4 位小数（≈11m 精度），国家级缩放视觉无差，体积约 -40%。
 * 用法：node scripts/slim-geojson.mjs [输入] [输出]（默认 public/geo/china.json 原地覆写，.bak 备份）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.resolve(ROOT, process.argv[2] ?? "public/geo/china.json");
const round4 = (n) => Math.round(n * 1e4) / 1e4;

const walk = (coords) =>
  Array.isArray(coords[0])
    ? coords.map(walk)
    : [round4(coords[0]), round4(coords[1])];

const geo = JSON.parse(fs.readFileSync(file, "utf8"));
let features = 0;
for (const f of geo.features ?? []) {
  const g = f.geometry;
  if (!g) continue;
  g.coordinates = walk(g.coordinates);
  features++;
}
fs.writeFileSync(file + ".bak", fs.readFileSync(file));
fs.writeFileSync(file, JSON.stringify(geo));
console.log(`slimmed ${features} features -> ${file}`);
console.log(`size: ${(fs.statSync(file).size / 1024).toFixed(0)} KB (backup: ${(fs.statSync(file + ".bak").size / 1024).toFixed(0)} KB)`);
