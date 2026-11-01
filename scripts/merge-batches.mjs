/** merge-batches.mjs — 把 batch-*.json 合并进 verified.json（幂等） */
import fs from "node:fs";
import path from "node:path";

const dir = "scripts/patches";
const v = JSON.parse(fs.readFileSync(path.join(dir, "verified.json"), "utf8"));
v.confirmed = v.confirmed ?? {};

const batches = fs.readdirSync(dir).filter((f) => /^batch-[A-Z]\.json$/.test(f));
for (const f of batches) {
  const b = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const c of b.cities ?? []) {
    const anchors = [];
    for (const h of c.gdp_history ?? []) {
      anchors.push({ year: h.year, pop: c.census2020_wan != null ? Math.round(c.census2020_wan * 10000) : null, gdp: h.value_yi });
    }
    if (c.pop_latest) {
      anchors.push({ year: c.pop_latest.year, pop: Math.round(c.pop_latest.value_wan * 10000), gdp: c.gdp_latest ? c.gdp_latest.value_yi : null });
    }
    v.confirmed[c.key] = {
      census2020_pop: c.census2020_wan != null ? Math.round(c.census2020_wan * 10000) : null,
      anchors: anchors.filter((a) => a.pop != null || a.gdp != null),
      gdp_note: (c.gdp_latest ? `${c.gdp_latest.year} GDP ${c.gdp_latest.value_yi}亿; ` : "") + (c.note || ""),
      sources: c.sources ?? [],
    };
  }
  console.log("merged", f, `(${(b.cities ?? []).length} cities)`);
}
fs.writeFileSync(path.join(dir, "verified.json"), JSON.stringify(v, null, 1), "utf8");
console.log("total confirmed:", Object.keys(v.confirmed).length);
