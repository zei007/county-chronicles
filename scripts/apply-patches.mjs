/**
 * apply-patches.mjs — 把 scripts/patches/verified.json 的真实锚点数据应用到城市 JSON
 * 规则：
 *  1. 锚点年份若已有 timeline 条目 → 直接覆盖 pop/gdp（真实值）
 *  2. 锚点年份无条目 → 插入新条目（event:false，不进事件流，仅作图表锚点）
 *  3. 末年条目与最近锚点偏差>1.8x 时按趋势续接修正，避免图表末端断崖
 *  4. 空间 peak_pop 低于七普值时用七普校准
 *  5. 每城写入 sources 标注
 */
import fs from "node:fs";
import path from "node:path";

const citiesDir = process.argv[2] || "src/data/cities";
const patchFile = process.argv[3] || "scripts/patches/verified.json";
const v = JSON.parse(fs.readFileSync(patchFile, "utf8"));
const confirmed = v.confirmed ?? {};

let touched = 0;
for (const [key, c] of Object.entries(confirmed)) {
  const file = path.join(citiesDir, `${key}.json`);
  if (!fs.existsSync(file)) { console.warn("SKIP(no file):", key); continue; }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const tl = data.timeline;

  /* 1+2. 锚点写入 */
  const anchors = (c.anchors ?? []).filter((a) => a.pop != null || a.gdp != null);
  for (const a of anchors) {
    const entry = tl.find((t) => t.year === a.year);
    if (entry) {
      if (a.pop != null) entry.pop = a.pop;
      if (a.gdp != null) entry.gdp = a.gdp;
      entry.calibrated = true;
    } else {
      tl.push({
        year: a.year,
        title: `${a.year}年统计锚点`,
        category: a.gdp != null && a.gdp >= (tl.at(-1)?.gdp ?? 0) ? "peak" : "transformation",
        desc: "依据统计公报/人口普查插入的校准数据点（非事件）",
        impact: 1,
        pop: a.pop ?? 0,
        gdp: a.gdp ?? 0,
        event: false,
        calibrated: true,
      });
    }
  }
  tl.sort((x, y) => x.year - y.year);

  /* 3. 末年修正（避免2024估算值与真实2023断崖） */
  const last = tl[tl.length - 1];
  const lastAnchor = anchors.filter((a) => a.year <= last.year).at(-1);
  const prevAnchor = anchors.filter((a) => a.year < last.year).at(-1);
  if (lastAnchor && last.year > lastAnchor.year && lastAnchor.gdp != null) {
    const oldPrev = prevAnchor ? tl.find((t) => t.year === prevAnchor.year && t.calibrated) : null;
    const ratio = oldPrev && oldPrev.gdp > 0 && prevAnchor?.gdp ? oldPrev.gdp / prevAnchor.gdp : 1.03;
    if (last.gdp != null && lastAnchor.gdp > 0 && (last.gdp / lastAnchor.gdp < 0.55 || last.gdp / lastAnchor.gdp > 1.9)) {
      last.gdp = Math.round(lastAnchor.gdp * ratio * 100) / 100;
      last.calibrated = true;
    }
    if (last.pop != null && lastAnchor.pop > 0 && (last.pop / lastAnchor.pop < 0.6 || last.pop / lastAnchor.pop > 1.6)) {
      last.pop = Math.round(lastAnchor.pop * (ratio > 0.9 && ratio < 1.1 ? 0.99 : 1) );
      last.calibrated = true;
    }
  }

  /* 4. 空间峰值校准 */
  const census = c.census2020_pop;
  if (census) {
    const tlPeak = Math.max(...tl.map((t) => t.pop ?? 0));
    const realPeak = Math.max(census, tlPeak);
    if (data.space) {
      if ((data.space.peak_pop ?? 0) < realPeak * 0.8) {
        data.space.peak_pop = realPeak;
        data.space.current_pop = tl.at(-1)?.pop ?? data.space.current_pop;
      }
      if (data.space.old_city && (data.space.old_city.peak_pop ?? 0) < realPeak * 0.8) data.space.old_city.peak_pop = realPeak;
      if (data.space.old_city && tl.at(-1)?.pop) data.space.old_city.current_pop = tl.at(-1).pop;
    }
  }

  /* 5. 来源标注（幂等：同 desc+url 不重复追加） */
  const existingSources = Array.isArray(data.sources) ? data.sources : data.sources ? [{ desc: String(data.sources) }] : [];
  const newSource = { desc: c.gdp_note || "真实数据校准", url: (c.sources ?? [])[0], year: anchors.at(-1)?.year };
  const srcKey = (s) => `${s?.desc ?? ""}|${s?.url ?? ""}`;
  if (!existingSources.some((s) => srcKey(s) === srcKey(newSource))) existingSources.push(newSource);
  data.sources = existingSources;
  if (census) data.real_anchors = { ...(data.real_anchors ?? {}), census2020: { pop: census } };
  // 统计锚点镜像到 real_anchors（供数据 QA 与文档引用；pop 为 null 表示该年未核实人口口径）
  const lastStat = anchors.filter((a) => a.gdp != null || a.pop != null).at(-1);
  if (lastStat) {
    data.real_anchors = {
      ...(data.real_anchors ?? {}),
      [`stat${lastStat.year}`]: { gdp: lastStat.gdp ?? null, pop: lastStat.pop ?? null },
    };
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 1), "utf8");
  touched++;
  console.log("PATCHED:", key, `anchors=${anchors.length}`);
}
console.log(`\nDone: ${touched}/${Object.keys(confirmed).length} cities patched`);
