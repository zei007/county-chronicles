/**
 * convert-data.mjs — 把参考项目 data/*.js（window.COUNTY_DATA 风格）转换为 JSON
 * 用法: node scripts/convert-data.mjs <ref_dir> <out_dir>
 * 数据文件形如: const YUMEN_DATA = { ... };  通过正则截取对象字面量后 eval。
 */
import fs from "node:fs";
import path from "node:path";

const refDir = process.argv[2] || "../ref_game";
const outDir = process.argv[3] || "../src/data/cities";
fs.mkdirSync(outDir, { recursive: true });

/** 括号计数截取第一个顶层对象字面量（忽略字符串/注释中的花括号） */
function extractObject(raw) {
  const start = raw.indexOf("{");
  if (start < 0) return null;
  let depth = 0, inStr = null, esc = false;
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === "/" && raw[i + 1] === "/") { while (i < raw.length && raw[i] !== "\n") i++; continue; }
    if (ch === "/" && raw[i + 1] === "*") { i += 2; while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) i++; i++; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return raw.slice(start, i + 1); }
  }
  return null;
}

const dataDir = path.join(refDir, "data");
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".js"));
const index = [];

for (const f of files) {
  if (f === "data-manifest.js") continue;
  const raw = fs.readFileSync(path.join(dataDir, f), "utf8");
  const lit = extractObject(raw);
  if (!lit) {
    console.warn("SKIP(no literal):", f);
    continue;
  }
  let obj;
  try {
    obj = eval("(" + lit + ")");
  } catch (e) {
    console.warn("SKIP(eval fail):", f, e.message);
    continue;
  }
  const key = obj.config?.cityKey || f.replace(".js", "");
  const out = path.join(outDir, key + ".json");
  fs.writeFileSync(out, JSON.stringify(obj, null, 1), "utf8");
  index.push({
    key,
    file: key + ".json",
    name: obj.profile?.name,
    province: obj.profile?.province,
    coords: obj.profile?.coordinates,
    tags: obj.profile?.tags,
    timeRange: obj.config?.timeRange,
  });
  console.log("OK:", key, obj.profile?.name, `(${Object.keys(obj).length} fields)`);
}

// SEZ 目录（对照组城市）
const sezDir = path.join(dataDir, "sez");
const sezIndex = [];
if (fs.existsSync(sezDir)) {
  fs.mkdirSync(path.join(outDir, "sez"), { recursive: true });
  for (const f of fs.readdirSync(sezDir).filter((x) => x.endsWith(".js") && x !== "sez-manifest.js")) {
    const raw = fs.readFileSync(path.join(sezDir, f), "utf8");
    const lit = extractObject(raw);
    if (!lit) continue;
    let obj;
    try {
      obj = eval("(" + lit + ")");
    } catch (e) {
      console.warn("SKIP sez:", f, e.message);
      continue;
    }
    const key = obj.config?.cityKey || f.replace(".js", "");
    fs.writeFileSync(path.join(outDir, "sez", key + ".json"), JSON.stringify(obj, null, 1), "utf8");
    sezIndex.push({
      key,
      file: "sez/" + key + ".json",
      name: obj.profile?.name,
      province: obj.profile?.province,
      coords: obj.profile?.coordinates,
      tags: obj.profile?.tags,
      timeRange: obj.config?.timeRange,
    });
    console.log("OK(sez):", key, obj.profile?.name);
  }
}

fs.writeFileSync(
  path.join(outDir, "_index.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cities: index, sez: sezIndex }, null, 1),
  "utf8",
);
console.log(`\nDone: ${index.length} cities + ${sezIndex.length} sez -> ${outDir}`);
