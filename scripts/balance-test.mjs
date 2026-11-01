/**
 * balance-test.mjs — 模拟经营引擎平衡性测试（回归门禁）
 *
 * 兼容性：Node 20+（不依赖 Node 26 原生 TS 剥离）。
 * 原理：用项目自带 typescript 包把 simulator.ts 转译为内存 JS 后动态导入。
 * 断言：
 *  - 每城「放任不管」得分 < 「均衡施政」得分 < 「转型优先」得分（策略区分度）
 *  - 「放任不管」结局评级必须为 D 或 C（摆烂必须得到惩罚）
 *  - 全程数值无 NaN/Infinity、无死循环、结局分数在 0~100（数值健壮性）
 * 用法：node scripts/balance-test.mjs   （任意工作目录均可）
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const ts = require(path.join(ROOT, "node_modules/typescript"));

// —— 转译 simulator.ts（其唯一 import 为 `import type`，转译后自动消除）——
const simSrc = fs.readFileSync(path.join(ROOT, "src/lib/engine/simulator.ts"), "utf8");
const simJs = ts.transpileModule(simSrc, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "simulator.ts",
}).outputText;
const tmpModule = path.join(os.tmpdir(), `simulator.balance-test.${process.pid}.mjs`);
fs.writeFileSync(tmpModule, simJs, "utf8");
const { createSimState, simulateYear, calibrate, makeRng, EMPTY_POLICY } = await import(
  pathToFileURL(tmpModule).href
);

// —— 转译 challenges.ts（挑战模式评估；import type 已消除）——
const chSrc = fs.readFileSync(path.join(ROOT, "src/lib/engine/challenges.ts"), "utf8");
const chJs = ts.transpileModule(chSrc, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  fileName: "challenges.ts",
}).outputText;
const tmpCh = path.join(os.tmpdir(), `challenges.balance-test.${process.pid}.mjs`);
fs.writeFileSync(tmpCh, chJs, "utf8");
const { SIM_CHALLENGES } = await import(pathToFileURL(tmpCh).href);

const cities = [
  { key: "hegang", sub: "" },
  { key: "yumen", sub: "" },
  { key: "daqing", sub: "" },
  { key: "fuxin", sub: "" },
  { key: "shenzhen", sub: "sez/" }, // v1.2 增长叙事城市
];

const STRATEGIES = {
  放任不管: () => EMPTY_POLICY,
  均衡施政: (s) => ({ industry: s.fiscal * 0.2, transform: s.fiscal * 0.2, infra: s.fiscal * 0.15, livelihood: s.fiscal * 0.25, environment: s.fiscal * 0.2, reserve: 0 }),
  扩产狂飙: (s) => ({ industry: s.fiscal * 0.6, transform: 0, infra: s.fiscal * 0.2, livelihood: s.fiscal * 0.1, environment: s.fiscal * 0.1, reserve: 0 }),
  转型优先: (s) => ({ industry: 0, transform: s.fiscal * 0.5, infra: s.fiscal * 0.1, livelihood: s.fiscal * 0.2, environment: s.fiscal * 0.2, reserve: 0 }),
};

const FAILURES = [];
function check(cond, msg) {
  if (!cond) FAILURES.push(msg);
}
function allFinite(state) {
  return [state.pop, state.gdp, state.environment, state.livelihood, state.diversification, state.vacancy, state.fiscal].every(
    (v) => Number.isFinite(v),
  );
}

for (const { key, sub } of cities) {
  const city = JSON.parse(fs.readFileSync(path.join(ROOT, `src/data/cities/${sub}${key}.json`), "utf8"));
  const p = calibrate(city);
  console.log(`\n===== ${city.profile.name} (${p.startYear}-${p.endYear}${p.growthMode ? " · 增长叙事" : ""}) 峰值GDP真实=${p.peakGdpReal}亿 终点真实=${p.finalGdpReal}亿/${(p.finalPopReal / 10000).toFixed(1)}万 =====`);
  const scores = {};
  const grades = {};
  for (const [name, strat] of Object.entries(STRATEGIES)) {
    let state = createSimState(city, 42);
    const rng = makeRng(777);
    let guard = 0;
    while (!state.finished) {
      state = simulateYear(state, strat(state), city, rng);
      guard++;
      check(allFinite(state), `${city.profile.name}/${name}: 第${state.year}年出现 NaN/Infinity`);
      if (guard >= 200) {
        check(false, `${city.profile.name}/${name}: 回合数超过 200，疑似死循环`);
        break;
      }
    }
    const e = state.ending;
    check(!!e && Number.isFinite(e.score) && e.score >= 0 && e.score <= 100, `${city.profile.name}/${name}: 结局分数异常 ${e?.score}`);
    scores[name] = e?.score ?? -1;
    grades[name] = e?.grade ?? "?";
    const cash = state.fiscal + state.reserve;
    const starsLine = " 挑战[" + SIM_CHALLENGES.map((c) => c.evaluate(state, p).stars).join("/") + "]";
    console.log(
      `  ${name.padEnd(4)} → ${state.year}年 | 人口${(state.pop / 10000).toFixed(1)}万 GDP${state.gdp.toFixed(0)}亿 环境${state.environment.toFixed(0)} 民生${state.livelihood.toFixed(0)} 多元${state.diversification.toFixed(0)} 空置${(state.vacancy * 100).toFixed(0)}% 结余+储备${cash.toFixed(0)}亿 → ${e.grade}级 ${e.score}分 ${e.title}${starsLine}`,
    );
  }
  // 策略区分度：放任 < 均衡 < 转型
  check(scores["放任不管"] < scores["均衡施政"], `${city.profile.name}: 放任(${scores["放任不管"]}) 应劣于 均衡(${scores["均衡施政"]})`);
  check(scores["均衡施政"] < scores["转型优先"], `${city.profile.name}: 均衡(${scores["均衡施政"]}) 应劣于 转型(${scores["转型优先"]})`);
  // 摆烂惩罚：放任不管必须是 D 或 C 级
  check(["D", "C"].includes(grades["放任不管"]), `${city.profile.name}: 放任不管评级应为 D/C，实际 ${grades["放任不管"]}`);
}

fs.rmSync(tmpModule, { force: true });
fs.rmSync(tmpCh, { force: true });

if (FAILURES.length) {
  console.error(`\nFAIL: ${FAILURES.length} 项断言未通过`);
  for (const f of FAILURES) console.error("  - " + f);
  process.exit(1);
}
console.log("\nOK — 平衡性回归全部通过");
