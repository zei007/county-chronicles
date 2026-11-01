# 开发文档 · DEVELOPMENT.md

> 面向后续开发者的完整技术手册：架构设计、数据流水线、引擎模型、扩展指南与代码规范。

## 1. 技术栈与版本

| 层 | 技术 | 版本 | 说明 |
|----|------|------|------|
| 框架 | Next.js (App Router) | 15.x | SSG + Route Handlers |
| UI | React | 19.x | 函数组件 + Hooks |
| 样式 | Tailwind CSS | 4.x | `@theme inline` CSS 变量方案（无 tailwind.config） |
| 组件 | shadcn/ui（手工内联） | — | Radix primitives + cva，源码在 `src/components/ui/` |
| 图表 | ECharts | 5.6 | npm 本地打包，`EChart.tsx` 封装 |
| 音效 | Web Audio API | — | 纯合成，零文件 |
| 存储 | localStorage + JSON 文件 | — | 无外部数据库 |
| 语言 | TypeScript | 5.x | strict 模式 |

**为什麼不用数据库？** 排行榜/云进度用 `data-store/*.json` 文件存储——单机、内网、容器皆可运行，备份=复制文件。并发极低（家庭/教室场景），文件方案足够且零依赖。

## 2. 架构总览

```
┌─────────────────────────────────────────────────────────┐
│ 数据层  src/data/cities/*.json (34+11 城)                │
│   profile/config/timeline/chains/diagnosis/space/...    │
│   + sources(真实来源) + real_anchors(校准锚点)            │
└──────────────┬──────────────────────────────┬───────────┘
               │ 静态导入(index.ts 生成)        │
┌──────────────▼──────────────┐  ┌────────────▼──────────┐
│ 探索模式 CityGame           │  │ 经营模式 SimGame       │
│  interp.ts 插值引擎          │  │  simulator.ts v2 引擎  │
│  MainChart 三视图            │  │  真实锚定 + 偏离乘数   │
│  5 大模态框(链/诊/迁/空/档)   │  │  事件系统+结局评定     │
└──────────────┬──────────────┘  └────────────┬──────────┘
               │                              │
┌──────────────▼──────────────────────────────▼───────────┐
│ 全局: ChinaMap(本地GeoJSON) / progress(localStorage)     │
│       audio(WebAudio) / ui(shadcn) / api(进度+排行榜)     │
└─────────────────────────────────────────────────────────┘
```

### 2.1 路由与渲染策略

| 路由 | 渲染 | 说明 |
|------|------|------|
| `/` | SSG + Client | 地图数据 fetch 自 `/geo/china.json`（public 静态资源） |
| `/city/[key]` | SSG（generateStaticParams） | 45 个静态页（34 资源城 + 11 对照城） |
| `/play/[key]` | SSG | 34 个静态页 |
| `/compare` | Client | 纯前端计算 |
| `/api/*` | Node runtime | 文件读写（`data-store/`） |

### 2.2 关键设计决策

1. **JSON 静态导入而非运行时 fetch**：`scripts/gen-index.mjs` 生成 `src/data/cities/index.ts`，城市数据进入构建产物，类型安全且支持 SSG。
2. **ECharts 客户端隔离**：所有图表组件标记 `"use client"`；`EChart.tsx` 用 ResizeObserver 自适应、`notMerge` 可控、地图 GeoJSON 注册去重。
3. **探索/经营共享数据层**：两种模式读同一份城市 JSON，探索模式是"真实历史的回放"，经营模式是"真实历史为锚的沙盒"。

## 3. 数据流水线（可重放）

```bash
# ① 参考项目 data/*.js → JSON（括号计数解析器，处理尾注代码）
node scripts/convert-data.mjs ../ref_game ../src/data/cities
# ② 生成静态导入索引
node scripts/gen-index.mjs src/data/cities
# ③ 合并真实数据校准批次（batch-*.json → verified.json）
node scripts/merge-batches.mjs
# ④ 把真实锚点写入城市 JSON（覆盖/插值/末年续接/峰值校准/来源标注）
node scripts/apply-patches.mjs src/data/cities scripts/patches/verified.json
# ⑤ 质检
node scripts/data-qa.mjs
```

### 3.1 城市数据 Schema（CityData）

```ts
{
  profile:    { name, province, area, coordinates:[lng,lat], tags[], description }
  config:     { timeRange, phases[], primaryIndicators[], spaceType,
                chainKeys[], currentStatus, transformationAssessment, reportStamp }
  timeline:   [{ year, title, category, desc, impact, pop, gdp, event, ...主指标字段 }]
  chains:     { [key]: { name, icon, lifecycle{birth,peak,decline,collapse}, nodes[], connections[], employment } }
  diagnosis:  { decline_factors[], rebirth_factors[] }   // weight=真实权重
  space_timeline: [{ year, built|old_area, new_area?, vacancy|vacant }]
  space:      { old_city?, new_city?, distance_km?, peak_pop, ... }
  migration:  { destinations: [{ city, province, count, reason }] }
  achievements: [{ id, name, desc, condition, year? }]
  sources:    [{ desc, url?, year? }]     // ★ 真实数据来源
  real_anchors: { census2020?: { pop } }  // ★ 校准锚点
}
```

**空间双模型兼容**：`dual_city`（老城/新城：old_area/new_area/vacancy）与 `built_up`（建成区：built/vacant/density），由 `interp.normSpace` 统一归一。

### 3.2 新增一座城市的标准流程

1. 建 `src/data/cities/<key>.json`（照抄 Schema，timeline ≥ 10 个锚点年）
2. `node scripts/gen-index.mjs src/data/cities` 重新生成索引
3. （可选）把该城的统计公报数据加入 `scripts/patches/verified.json` 后跑 `apply-patches`
4. `npm run dev` 验证 `/city/<key>` 与 `/play/<key>`
5. 若 `profile.coordinates` 首次出现新城坐标，无需额外注册——首页地图读取数据自渲染

## 4. 模拟引擎 v2（真实锚定模型）

### 4.1 设计动机

v1 采用"自由反馈模型"（岗位→移民→人口→服务岗位…），自动化平衡测试暴露两个致命问题：
人口指数爆炸（阜新 111 年 → 8748 万）、财政-GDP 死亡螺旋（终局 GDP→1 亿）。

### 4.2 v2 核心思想：锚定 + 偏离

```
真实曲线 real(year) = timeline 插值        ← 什么都不做时游戏复现真实历史
玩家状态 = 真实值 × 偏离乘数(gdpMult/popMult) + 政策直接产出(转型产业/基建偏移)
乘数演化受钳制: gdpMult∈[0.55,1.7] popMult∈[0.5,1.5]，且向 1 回归
```

| 子模型 | 公式要点 |
|--------|---------|
| 资源储量 | 按真实产量路径累计消耗（reserveK 标定到 collapseYear 时余 12%）；扩产动能 `momentum` 加速耗竭、限产回补 |
| 产量闸门 | 仅作用于**资源份额** `resShare=min(0.55, out×1.1)`，多元化后期经济不被整体惩罚 |
| 转型产出 | `min(2 transformStock×0.2, realGDP×0.35)`，防转型无限膨胀 |
| 就业/失业 | `0.04 + resShare×(1-gate)×0.55 - 多元化×0.0022` |
| 移民率 | `jobPull(就业) − declinePush(衰退) ± 民生/环境/空置`，钳制 ±[−0.05,+0.026] |
| 环境/民生 | 收益边际递减 `gain×(1−v/105)`；GDP 污染项 `min(2, gdp×0.002)` 防大城崩溃 |
| 空间 | 建成区锚定真实曲线×popMult + 基建偏移衰减；空置率锚定真实曲线 + 供需过剩项 |

### 4.3 平衡性回归测试

`scripts/balance-test.mjs`（Node 20+，经项目自带 typescript 包内存转译，无需构建）以 4 资源城 + 深圳（增长叙事）× 4 策略跑完整时间轴：

```
放任不管 → D级(28-33分)  鬼城结局
均衡施政 → A/S级(74-83)  人口≈真实±10%
扩产狂飙 → B级(57-65)    前期繁荣后期衰退
转型优先 → S级(78-88)    最优解（符合史实叙事）
```

**改引擎后必跑此测试**；若结局分布漂移（如均衡施政掉到 C），检查最近改动是否破坏钳制常数。

### 4.4 随机事件扩展

`RANDOM_EVENTS` 数组中追加 `{id,title,desc,weight,minYearProgress,choices:[{label,desc,effects}]}`；
`effects` 支持 `fiscal/popMult/gdpMult/environment/livelihood/diversification/resource`。

### 4.5 双叙事模式（v1.2）

城市 JSON 根级 `simMode` 字段决定引擎叙事轨（缺省 `"depletion"`）：

| | `depletion`（43 资源城） | `growth`（11 对照城） |
|--|--|--|
| 资源闸门 | 真实产量路径耗竭 + momentum 加速 | 无（`resourceLeft` 恒 1、`gate=1`、`resShare=0`） |
| 人口乘数地板 | 0.5 | 0.75（增长大势不可逆，防人口崩到真实的 50%） |
| 结局文案 | 转型典范 / 平稳过渡 / 艰难维持 / 衰退收缩 / 被遗忘的矿区 | 时代标杆 / 稳健增长 / 发展放缓 / 掉队 / 错失时代 |
| 挑战人口口径 | ≥ 真实终点 100/105/112% | ≥ 真实终点 76/78/81% |

`calibrate(city).growthMode` 为唯一分支开关，`simulateYear` 内三处分支（资源块 / resShare+gate / popMult 钳制）+ `judgeEnding` 文案树。挑战模块与 UI 通过 `CitySimParams.growthMode` 自动适配，无需感知具体城市。

### 4.6 挑战模式（v1.2）

`src/lib/engine/challenges.ts`：6 种通用挑战（纯函数 `evaluate(state, params) → {stars 0-3, lines[]}`），
阈值全部为「真实终点值」相对口径，覆盖 54 城无需逐城配置。三档逐级递进，断档即止。
持久化在 `progress.ts`（`crf.v1.challenges`：cityKey → challengeId → 最佳星级）；三星解锁成就 `sim_challenge_3`。
「家底殷实」挑战内置防摆烂门：终局人口 < 真实终点 70%（增长城 76%）时不计星。
**改挑战阈值后必跑 `balance-test.mjs`**：其输出含每策略挑战星级矩阵，放任不管不得在任何挑战刷出高星。

## 5. UI 组件规范（shadcn/ui Tailwind v4）

- 主题变量在 `globals.css` 的 `:root/.dark + @theme inline` 中定义（工矿档案风：煤黑 + 鎏金）
- 新组件一律放 `src/components/ui/`，遵循 cva variants 模式
- 图表配色使用 `--chart-1..5`；语义色用 Tailwind 调色板（emerald=正/生态，red=衰/警示，amber=主色）
- 破坏性操作必须二次确认；异步操作必须有 pending/成功/失败三态

## 6. 性能与适配

- 首页地图/对比页/迁徙图均懒加载 GeoJSON（`fetch('/geo/china.json')`）
- 时间轴播放 = 每帧仅 `setYear`，图表经 `useMemo` 依赖 diff 后 setOption（notMerge=false 增量）
- 移动端：三栏 → 单列重排（order 类），工具栏横向滚动，底部双 Tab 切换地图/列表
- 触控目标 ≥ 36px；`dvh` 单位处理移动端地址栏

## 7. 已知限制与后续方向

见 `docs/ROADMAP.md`。
