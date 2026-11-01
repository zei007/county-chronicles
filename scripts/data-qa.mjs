/** data-qa.mjs — 列出所有城市首末年份的人口/GDP，供真实数据校对 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, process.argv[2] || "src/data/cities");
const idx = JSON.parse(fs.readFileSync(path.join(dir, "_index.json"), "utf8"));
for (const c of [...idx.cities]) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, c.file), "utf8"));
  const tl = d.timeline || [];
  const first = tl[0] || {};
  const last = tl[tl.length - 1] || {};
  const mid = tl[Math.floor(tl.length / 2)] || {};
  console.log(
    [
      c.key.padEnd(14),
      `${c.timeRange?.start}-${c.timeRange?.end}`.padEnd(12),
      `pop ${first.pop ?? "?"} -> ${last.pop ?? "?"}`.padEnd(26),
      `gdp ${first.gdp ?? "?"} -> ${last.gdp ?? "?"}`.padEnd(20),
      `peak_pop:${d.space?.peak_pop ?? d.space?.old_city?.peak_pop ?? "?"}`,
    ].join(" "),
  );
}

/* 七普（census2020）锚点覆盖检查：v1.2 起所有资源型城市必须具备 */
let withCensus = 0;
const missingCensus = [];
for (const c of idx.cities) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, c.file), "utf8"));
  const v = Number(d.real_anchors?.census2020?.pop ?? 0);
  if (v > 0) withCensus++;
  else missingCensus.push(c.key);
}
console.log(
  `\n七普锚点覆盖: ${withCensus}/${idx.cities.length}` +
    (missingCensus.length ? ` · 缺失: ${missingCensus.join(", ")}` : " · 全覆盖 ✓"),
);
if (missingCensus.length) process.exitCode = 1;
