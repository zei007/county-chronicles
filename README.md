# 县城兴衰史 · County Chronicles

> 数据驱动的中国资源型城市兴衰互动叙事 + 模拟经营游戏。
> 以真实统计数据为锚，玩家既能**时间轴探索**城市百年兴衰，也能在**县长生涯**模式中亲手改写历史。
> **Next.js 全栈 · 全资源本地化（零 CDN）· 手机/电脑双端适配 · 可完全离线部署。**

![CI](https://github.com/OWNER/county-chronicles/actions/workflows/ci.yml/badge.svg) ![license](https://img.shields.io/badge/license-MIT-green) ![tech](https://img.shields.io/badge/Next.js-15-black) ![tech](https://img.shields.io/badge/React-19-blue) ![tech](https://img.shields.io/badge/TailwindCSS-4-cyan) ![tech](https://img.shields.io/badge/shadcn%2Fui-latest-violet) ![tech](https://img.shields.io/badge/ECharts-5-gold)

---

## 一、游戏内容

### 收录城市：44 座资源型城市 + 11 座对照城市

覆盖石油、煤炭、铜、铁、金、锑、镍、锡、汞、锌、镁、铝、石材、盐湖等主要矿种，横跨 1730—2024 年：

| 区域 | 城市 |
|------|------|
| 东北 | 鹤岗、阜新、抚顺、辽源、大庆、大同、葫芦岛、七台河、双鸭山 |
| 华北 | 阳泉、唐山、包头、榆林 |
| 西北 | 玉门、白银、金昌、格尔木、克拉玛依、石嘴山 |
| 中南 | 大冶、灵宝、招远、冷水江、淮南、徐州、焦作、鹤壁 |
| 西南 | 个旧、东川、万山、攀枝花、平果 |
| 华东/华南 | 德兴、云浮、遂昌、上杭、昌江、萍乡、淮北、铜陵、新余、涟源 |
| 特殊 | 墨竹工卡（藏东铜都）、万盛经开区 |
| 对照组 | 深圳、上海临港、天津滨海、重庆两江、海南自贸港、喀什、霍尔果斯、厦门、汕头、珠海 |

### 玩法一：时间轴探索（叙事模式）

- **真实中国地图**选城（本地 GeoJSON + ECharts，脉冲金点标注）
- **时间轴滑块 + 自动播放**：拖动年份，人口/GDP/主导产业/建成区/空置率实时联动
- **综合趋势 / 产业结构 / 空间对比** 三种图表视图（年份标记线跟随）
- **历史事件流**：点击事件卡直达关键年份，已发生事件高亮
- **产业链全生命周期**：SVG 拓扑渲染 + **工序拼图小游戏**（≥80% 匹配解锁成就）
- **衰落诊断实验室**：对衰落/重生因素拖拽排序，与真实研究权重比对（Kendall tau 匹配度）
- **人口迁徙飞线图**：本地地图 + 真实迁流向，规模随年份缩放
- **空间实景图**：本地渲染的城市肌理演化（无外部卫星瓦片，离线可用）
- **城市兴衰档案**：一键生成精美档案页，支持导出 HTML / 打印 PDF
- 快捷键：`←/→` 年份 · `Space` 播放 · `I` 产业链 · `D` 诊断 · `R` 档案

### 玩法二：县长/主政生涯（模拟经营模式）★ 本作核心创新

**全部 54 城（含深圳等 11 座对照城）均可经营**：资源城走"资源枯竭"叙事，对照城走"增长叙事"（引擎双模式，结局双轨文案）。

从城市设市之年就任县长，每回合 = 1 年，把有限财政投向六个方向：

| 方向 | 效果 |
|------|------|
| ⛏️ 扩产 | GDP/就业立竿见影，但**加速资源枯竭**、环境承压 |
| 🔄 转型 | 先烧钱，积累后成为新增长引擎（多元化↑） |
| 🏗️ 基建 | 拉动就业，人口流失时造成高空置 |
| 🏘️ 民生 | 提升人口留存，抑制外流 |
| 🌳 环保 | 环境回升，GDP 微降 |
| 🐖 储备 | 存钱吃 2% 利息，以备枯竭之年 |

- 🏆 **施政挑战模式**（v1.2）：开局可选 6 种挑战（人口保卫战/转型突围/绿水青山/民生福地/全面发展/家底殷实），结局按 1~3 星评定并记录历史最佳；三星解锁「金牌施政」成就
- **真实历史事件**按年份如期发生（七普冲击、资源枯竭认定、白菜价出圈…）
- **随机事件**带选择分支（招商机遇、环保督察、高铁设站博弈…）
- 引擎为**真实锚定模型**：什么都不做 ⇒ 游戏复现真实历史；你的每个决策让城市偏离历史轨迹
- 结局与**真实历史对照评分**（S~D 五档）：人口/GDP 与真实值的百分比、环境、民生、多元化
- 终局可提交**排行榜**（本地文件存储，无外部数据库）
- 平衡性经过自动化验证：放任不管=D 级鬼城 / 均衡施政=A 级 / 转型优先=S 级

### 玩法三：双城对比

任意两城并排：同步时间轴、人口/GDP 轨迹叠加、衰落因子雷达、事件时间线对照。

### 全局系统

- 成就系统（探索/诊断/拼图/经营多维度）
- localStorage 进度持久化 + 可选云端同步（`/api/progress`）
- Web Audio 合成音效（零音频文件）
- 移动端专属导航（地图/列表双 Tab、横向滚动工具栏）

---

## 二、快速开始

### 环境要求
- Node.js ≥ 18.17（推荐 20+；开发验证使用 Node 26）
- npm ≥ 9

### 安装与运行

```bash
cd county-chronicles
npm install          # 或使用国内镜像: npm install --registry=https://registry.npmmirror.com
npm run dev          # 开发模式 → http://localhost:3000
```

### 生产部署

```bash
npm run build
npm run start        # → http://localhost:3000
```

### 云端一键部署（Vercel）

1. Fork/导入本仓库到你的 GitHub → 打开 [vercel.com/new](https://vercel.com/new) 选择该仓库 → Deploy（零配置，Next.js 自动识别）
2. 每次推送到 `main` 自动构建发布；CI 会先跑类型检查/平衡回归/数据 QA/构建四道门禁
3. **功能差异**：Vercel Serverless 为只读文件系统，排行榜提交/云同步会返回 503 优雅降级（本地进度、存档、挑战记录均不受影响）。如需云端排行榜，请自托管（下方）或接入 Vercel KV

> 详细部署方案（独立服务器 / Docker / 静态化 / 离线内网）见 **docs/DEPLOYMENT.md**。

### 文档索引

| 文档 | 内容 |
|------|------|
| [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) | **完整开发计划**：版本路线 / 任务分解 / 验收标准 / 风险登记 |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | 技术手册：架构 / 数据流水线 / 引擎模型 / 扩展指南 |
| [docs/ROADMAP.md](docs/ROADMAP.md) | 里程碑速览（已完成 / 迭代中） |
| [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) | 数据来源与校准口径（逐城锚点表） |

---

## 三、项目结构

```
county-chronicles/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # 首页（中国地图 + 城市选择 + 进度）
│   │   ├── layout.tsx              # 全局布局（暗色主题 + Toaster）
│   │   ├── city/[key]/page.tsx     # 城市探索页（SSG ×55）
│   │   ├── play/[key]/page.tsx     # 县长/主政生涯页（SSG ×55，含对照城）
│   │   ├── compare/page.tsx        # 双城对比
│   │   ├── not-found.tsx
│   │   └── api/
│   │       ├── progress/route.ts   # 云端进度存档（文件存储）
│   │       └── leaderboard/route.ts# 县长排行榜（文件存储）
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 组件（button/card/dialog/slider/tabs/badge…）
│   │   ├── EChart.tsx              # ECharts React 封装（本地打包）
│   │   ├── ChinaMap.tsx            # 首页中国地图
│   │   ├── city/
│   │   │   ├── CityGame.tsx        # 探索模式主控
│   │   │   ├── MainChart.tsx       # 三视图主图表
│   │   │   └── modals/             # 产业链/诊断/迁徙/空间/档案 五大模态框
│   │   └── play/SimGame.tsx        # 县长生涯主控（含施政挑战选择器与结局星级面板）
│   ├── lib/
│   │   ├── engine/
│   │   │   ├── simulator.ts        # ★ 模拟经营引擎（真实锚定模型 + 增长叙事双模式，纯函数）
│   │   │   ├── challenges.ts       # ★ 施政挑战（6 种通用挑战，星级评定，纯函数）
│   │   │   └── interp.ts           # 时间轴插值与派生指标
│   │   ├── types.ts                # 全量 TS 类型
│   │   ├── progress.ts             # localStorage 进度（含挑战最佳星级）
│   │   ├── audio.ts                # Web Audio 音效
│   │   └── utils.ts                # 格式化/cn 工具
│   └── data/cities/                # ★ 44+11 城市数据（JSON，含真实统计锚点、七普锚点与来源标注）
├── public/geo/china.json           # 本地中国地图 GeoJSON（阿里 DataV，已内置）
├── scripts/
│   ├── convert-data.mjs            # 参考数据 → JSON 转换器
│   ├── gen-index.mjs               # 生成静态导入 index.ts
│   ├── merge-batches.mjs           # 合并真实数据校准批次
│   ├── apply-patches.mjs           # 应用真实锚点到城市 JSON
│   ├── data-qa.mjs                 # 数据 QA（首末年人口/GDP 一览）
│   └── balance-test.mjs            # ★ 引擎平衡性自动测试（node scripts/balance-test.mjs）
├── docs/                           # 开发文档 / 部署文档 / 开发计划 / 数据说明
└── package.json
```

---

## 四、数据真实性

- **44 城全部经过真实数据校准**：每城 2~5 个真实锚点年（2022/2023/2024 统计公报 GDP + 人口），由自动化采集流水线分两轮逐城核实并注入
- **七普（2020）常住人口 44 城全量落盘**（v1.2 batch-G 补齐 10 城），`data-qa.mjs` 含覆盖断言；逐城来源见 [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md)
- 每个城市 JSON 内置 `sources` 来源标注，档案报告自动附数据来源页
- 早年份为公开资料整理的插值估算，游戏内已明示"仅供教学演示"
- 完整校准方法与来源清单见 **docs/DATA_SOURCES.md**

## 五、零 CDN 承诺

| 资源 | 参考原版 | 本作 |
|------|---------|------|
| 图表 | ECharts CDN | ✅ npm 本地打包 |
| 中国地图 | 阿里 DataV 在线 GeoJSON | ✅ `public/geo/china.json` 本地文件 |
| 样式 | Tailwind CDN | ✅ Tailwind v4 编译期构建 |
| 字体 | Google Fonts | ✅ 系统字体栈（Noto/雅黑/苹方回退） |
| 卫星影像 | Esri 在线瓦片 | ✅ 本地 SVG 城市肌理渲染 |
| 音效 | Web Audio 合成 | ✅ 保持（本就无文件） |

构建产物不发起任何外网请求，可部署于完全离线的内网环境。

## 六、开发与测试

```bash
npx tsc --noEmit            # 类型检查
npm run build               # 生产构建（117 个静态页面）
node scripts/balance-test.mjs  # 引擎平衡性回归（4资源城+深圳增长用例 × 4策略 + 挑战星级矩阵）
node scripts/data-qa.mjs    # 城市数据 QA（含七普覆盖断言）
```

## 七、致谢与说明

- 玩法原型参考开源项目 [zei007/county-rise-fall-game](https://github.com/zei007/county-rise-fall-game)（静态 HTML 版），本作以 Next.js 全栈重写并新增模拟经营玩法
- 数据来源：各市统计公报、第七次全国人口普查、公开学术研究；仅供教学演示，请以官方发布为准

## 八、开源协议

[MIT](LICENSE) © 2026 county-chronicles contributors — 任何人可自由使用、修改、再分发（含商用），须保留版权与许可声明。游戏数据（统计公报/人口普查）为公开事实数据，引用请注明官方来源。

---

*县城兴衰史 — 每一段数据背后，都是一座城市的生命史。*
