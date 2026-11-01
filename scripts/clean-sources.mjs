/**
 * clean-sources.mjs — 一次性清理城市 JSON sources 数组中的损坏条目
 * 修复 convert-data.mjs 早期版本写入的 { desc: "[object Object]" }。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "src/data/cities");
let touched = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json") || f === "_index.json") continue;
  const p = path.join(dir, f);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  if (!Array.isArray(data.sources)) continue;
  const cleaned = data.sources.filter((s) => s && s.desc && s.desc !== "[object Object]");
  if (cleaned.length !== data.sources.length) {
    data.sources = cleaned;
    fs.writeFileSync(p, JSON.stringify(data, null, 1) + "\n", "utf8");
    touched++;
    console.log("cleaned:", f);
  }
}
// sez 子目录
const sezDir = path.join(dir, "sez");
if (fs.existsSync(sezDir)) {
  for (const f of fs.readdirSync(sezDir)) {
    if (!f.endsWith(".json")) continue;
    const p = path.join(sezDir, f);
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    if (!Array.isArray(data.sources)) continue;
    const cleaned = data.sources.filter((s) => s && s.desc && s.desc !== "[object Object]");
    if (cleaned.length !== data.sources.length) {
      data.sources = cleaned;
      fs.writeFileSync(p, JSON.stringify(data, null, 1) + "\n", "utf8");
      touched++;
      console.log("cleaned: sez/" + f);
    }
  }
}
console.log(`Done: ${touched} files cleaned`);
