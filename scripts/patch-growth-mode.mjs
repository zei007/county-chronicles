/**
 * patch-growth-mode.mjs — 给对照组（经济特区/开放高地）城市 JSON 写入 simMode:"growth"
 * v1.2：解锁经营模式，引擎按「增长叙事」运行（无资源枯竭闸门）。
 * 幂等：重复运行不产生副作用。
 * 用法：node scripts/patch-growth-mode.mjs   （任意工作目录均可）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "src/data/cities/sez");

let touched = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json") && !x.startsWith("_"))) {
  const file = path.join(dir, f);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (data.simMode === "growth") { console.log("SKIP(has):", f); continue; }
  data.simMode = "growth";
  fs.writeFileSync(file, JSON.stringify(data, null, 1), "utf8");
  console.log("PATCHED:", f);
  touched++;
}
console.log(`\nDone: ${touched} files updated`);
