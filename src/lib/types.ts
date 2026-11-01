/**
 * types.ts — 县城兴衰史 · 核心数据类型
 * 与 src/data/cities/*.json 的结构一一对应（源自真实统计公报整理）。
 */

/** 发展阶段 */
export interface Phase {
  name: string;
  start: number;
  end: number;
  color: string; // tailwind 色系名: green/yellow/red/teal/purple...
}

/** 主指标定义 */
export interface PrimaryIndicator {
  key: string;
  label: string;
  unit: string;
  max: number;
  color: string;
}

/** 城市配置 */
export interface CityConfig {
  timeRange: { start: number; end: number };
  phases: Phase[];
  primaryIndicators: PrimaryIndicator[];
  spaceType: "dual_city" | "built_up";
  spaceLabels?: { old?: string; new?: string; built?: string; density?: string };
  cityKey: string;
  chainKeys: string[];
  chainContainerIds?: string[];
  currentStatus: string;
  transformationAssessment: string;
  transformationDetail: string;
  reportStamp: string;
}

/** 时间轴条目（带真实数据的锚点年份） */
export interface TimelineEntry {
  year: number;
  title: string;
  category: "discovery" | "peak" | "decline" | "relocation" | "transformation" | "culture";
  desc: string;
  impact: number; // 1-10
  pop: number; // 人
  gdp: number; // 亿元
  event: boolean;
  [k: string]: number | string | boolean | undefined; // 主指标动态字段
}

/** 产业链节点 */
export interface ChainNode {
  id: string;
  name: string;
  x: number;
  y: number;
  status: "active" | "growing" | "emerging" | "dead" | "declining";
  peak?: string;
  decline?: string | null;
}

export interface ChainConnection {
  from: string;
  to: string;
  flow: string;
}

export interface IndustryChain {
  name: string;
  color: string;
  icon: string;
  lifecycle: { birth: number; peak: number; decline: number | null; collapse: number | null; dead: number | null };
  nodes: ChainNode[];
  connections: ChainConnection[];
  employment?: { peak: number; current: number };
  desc?: string;
}

/** 诊断因子 */
export interface DiagnosisFactor {
  id: string;
  name: string;
  weight: number;
  evidence: string;
  icon: string;
  selected?: boolean;
}

/** 空间变迁时间点（兼容 dual_city / built_up 两种模型） */
export interface SpaceEntry {
  year: number;
  old_area?: number; // 老城面积 km²
  new_area?: number; // 新城面积 km²
  built?: number; // 建成区面积 km²
  vacancy?: number; // 空置率 0-1
  vacant?: number;
  old_pop?: number;
  density?: number;
}

export interface SpaceData {
  old_city?: { name: string; peak_pop: number; current_pop: number; vacancy: number; landmark: string };
  new_city?: { name: string; peak_pop: number; current_pop: number; landmark: string };
  distance_km?: number;
  built_up_area_km2?: number;
  current_pop?: number;
  peak_pop?: number;
  vacancy_rate?: number;
}

export interface MigrationDestination {
  city: string;
  province: string;
  count: number; // 人
  reason: string;
  lnglat?: [number, number];
}

export interface MigrationData {
  outflow_total?: number;
  destinations: MigrationDestination[];
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  condition: "visit" | "year" | "chart" | "chain" | "diagnosis" | "report" | "sim" | "compare";
  year?: number;
  /** 模拟模式专属阈值 */
  score?: number;
}

/** 数据来源标注（真实数据校准后写入） */
export interface DataSource {
  desc: string; // 如 "鹤岗市2023年国民经济和社会发展统计公报"
  url?: string;
  year?: number;
}

/** 城市完整数据 */
export interface CityData {
  /** 模拟经营引擎模式：depletion=资源枯竭叙事（默认）| growth=增长叙事（对照组城市） */
  simMode?: "depletion" | "growth";
  profile: {
    name: string;
    province: string;
    prefecture?: string;
    area: string;
    coordinates: [number, number]; // [lng, lat]
    tags: string[];
    description: string;
  };
  config: CityConfig;
  timeline: TimelineEntry[];
  chains: Record<string, IndustryChain>;
  diagnosis: {
    decline_factors: DiagnosisFactor[];
    rebirth_factors: DiagnosisFactor[];
  };
  space_timeline: SpaceEntry[];
  space: SpaceData;
  migration: MigrationData;
  achievements: Achievement[];
  /** 真实数据校准来源 */
  sources?: DataSource[];
  /** 真实锚点: { [year]: {pop, gdp} } 用于数据校准 */
  real_anchors?: Record<string, { pop?: number; gdp?: number }>;
  [k: string]: unknown;
}

/** 对照组城市（深圳等）标记 */
export interface CityIndexEntry {
  key: string;
  file: string;
  name?: string;
  province?: string;
  coords?: [number, number];
  tags?: string[];
  timeRange?: { start: number; end: number };
}

/** ============ 模拟经营模式 ============ */

/** 玩家政策投入方向 */
export type PolicyKey =
  | "industry" // 扩产: 主导产业产能+ (加速资源消耗)
  | "transform" // 转型: 接续产业培育 (前期烧钱后期接棒)
  | "infra" // 基建: 建成区+ 人口吸引力+
  | "livelihood" // 民生: 教育/医疗 → 留存率+
  | "environment" // 环保: 环境值+ 财政- GDP轻微-
  | "reserve"; // 财政储备: 存钱吃利息

/** 回合结果 */
export interface SimYearResult {
  year: number;
  pop: number;
  gdp: number;
  fiscal: number; // 财政结余 亿元
  reserve: number;
  resourceLeft: number; // 资源剩余比例 0-1
  environment: number; // 0-100
  livelihood: number; // 0-100
  diversification: number; // 0-100 产业多元化
  unemployment: number; // 0-1
  vacancy: number; // 0-1
  builtArea: number; // km²
  events: SimEventOutcome[];
  headline: string; // 当年大事记一句话
}

export interface SimEventOutcome {
  id: string;
  title: string;
  desc: string;
  kind: "history" | "random" | "policy";
  effects?: Partial<Record<"fiscal" | "pop" | "environment" | "livelihood" | "diversification", number>>;
  choices?: SimChoice[];
  chosenIndex?: number;
}

export interface SimChoice {
  label: string;
  desc: string;
  effects: Partial<Record<"fiscal" | "pop" | "environment" | "livelihood" | "diversification" | "resource" | "gdpMult" | "popMult", number>>;
}

/** 模拟游戏状态（可序列化，存档用） */
export interface SimState {
  cityKey: string;
  year: number;
  pop: number;
  gdp: number;
  fiscal: number;
  reserve: number;
  resourceLeft: number;
  environment: number;
  livelihood: number;
  diversification: number;
  unemployment: number;
  vacancy: number;
  builtArea: number;
  transformStock: number; // 转型积累
  history: SimYearResult[];
  pendingEvents: SimEventOutcome[];
  finished: boolean;
  ending?: SimEnding;
  /** 本局选定的挑战 id（挑战模式，null=自由经营）；随自动存档序列化 */
  challengeId?: string | null;
}

export type SimEnding = {
  grade: "S" | "A" | "B" | "C" | "D";
  score: number;
  title: string;
  detail: string;
  vsReal: string;
};

/** 每回合政策投入（亿元） */
export interface SimPolicyInput {
  industry: number;
  transform: number;
  infra: number;
  livelihood: number;
  environment: number;
  reserve: number;
}
