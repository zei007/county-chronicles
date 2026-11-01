/**
 * new-cities-b.mjs — 新增城市创作数据（第二批：七台河/双鸭山/鹤壁/新余/涟源）
 * 数据规范同 new-cities-a.mjs。
 */

export const NEW_CITIES_B = [
  {
    key: "qitaihe",
    profile: {
      name: "七台河市", province: "黑龙江省", prefecture: "地级市", area: "6,221 km²",
      coordinates: [131.0, 45.77],
      tags: ["焦煤之都", "冬奥冠军之乡", "煤化工", "石墨新材料"],
      description:
        "中国保护性开采的稀有焦煤基地，勃利煤田的优质主焦煤是钢铁工业的原料命脉。2009 年列入第二批资源枯竭城市，煤炭产量下滑后依托煤化工与石墨深加工转型，同时以'冬奥冠军之乡'的短道速滑文化闻名全国。",
    },
    config: {
      timeRange: { start: 1958, end: 2024 },
      phases: [
        { name: "开发期", start: 1958, end: 1979, color: "green" },
        { name: "壮盛期", start: 1980, end: 2012, color: "yellow" },
        { name: "衰落期", start: 2013, end: 2020, color: "red" },
        { name: "转型期", start: 2021, end: 2024, color: "teal" },
      ],
      primaryIndicators: [
        { key: "coal", label: "原煤产量", unit: "万吨", max: 1800, color: "#1a1a2e" },
        { key: "coke", label: "焦炭产量", unit: "万吨", max: 500, color: "#a16207" },
      ],
      currentStatus: "资源枯竭转型与冰雪文化城市",
      transformationAssessment: "从焦煤基地到煤头化尾、石墨尾端",
      transformationDetail:
        "七台河因煤而生，主焦煤低硫低磷被誉为'工业味精'。矿井采深加大后产能收缩，城市提出'煤头化尾'，把原煤做成焦炭与精细化工品；同时开发亚洲储量领先的石墨矿，短道速滑冠军文化成为精神名片。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1958, title: "勃利煤田开发", category: "discovery", desc: "国家开发勃利煤田，矿区从几个生产队起步", impact: 9, pop: 60000, coal: 30, coke: 0, gdp: 0.4, event: true },
      { year: 1970, title: "设立七台河市", category: "peak", desc: "矿区设县级市（1983 年升格地级市），煤城体制成型", impact: 8, pop: 200000, coal: 200, coke: 3, gdp: 1.2, event: true },
      { year: 1986, title: "焦煤基地定位", category: "peak", desc: "列为国家保护性开采的稀有煤种重点矿区", impact: 8, pop: 400000, coal: 700, coke: 60, gdp: 8, event: true },
      { year: 1998, title: "煤矿下岗潮", category: "decline", desc: "国企改革叠加煤价低谷，矿区职工大量下岗", impact: 8, pop: 520000, coal: 800, coke: 120, gdp: 42, event: true },
      { year: 2002, title: "短道速滑扬名", category: "culture", desc: "杨扬盐湖城冬奥夺金，'冠军之乡'起步（张杰、王濛等相继而出）", impact: 7, pop: 530000, coal: 1000, coke: 160, gdp: 62, event: true },
      { year: 2009, title: "列入资源枯竭城市", category: "decline", desc: "国务院第二批资源枯竭城市，焦煤可采年限预警", impact: 9, pop: 620000, coal: 1300, coke: 260, gdp: 226, event: true },
      { year: 2014, title: "煤化工突围", category: "transformation", desc: "焦炭-甲醇-精细化工链条成形，'煤头化尾'战略提出", impact: 7, pop: 660000, coal: 1500, coke: 420, gdp: 210, event: true },
      { year: 2017, title: "去产能收缩", category: "decline", desc: "关闭退出小煤矿数十处，原煤产量大幅下降", impact: 8, pop: 670000, coal: 1100, coke: 380, gdp: 220, event: true },
      { year: 2020, title: "七普人口骤降", category: "decline", desc: "常住人口 68.96 万，较六普下降近 25%，全国收缩最快城市之一", impact: 9, pop: 689611, coal: 900, coke: 300, gdp: 232, event: true },
      { year: 2022, title: "石墨新材料", category: "transformation", desc: "石墨精粉与负极材料项目落地，非煤产业占比提升", impact: 7, pop: 660000, coal: 800, coke: 320, gdp: 245, event: true },
      { year: 2024, title: "冬奥文化+新赛道", category: "transformation", desc: "冠军文化城建成，煤化工与新材料双轨前行", impact: 7, pop: 645000, coal: 750, coke: 330, gdp: 255, event: true },
    ],
    chains: {
      coal: {
        name: "焦煤产业链", color: "#1a1a2e", icon: "⛏️",
        lifecycle: { birth: 1958, peak: 2005, decline: 2014, collapse: 2018, dead: null },
        nodes: [
          { id: "mine", name: "矿井群", x: 50, y: 50, status: "dying", peak: "1980s-2000s", decline: "2010s" },
          { id: "wash", name: "洗煤厂", x: 150, y: 50, status: "declining", peak: "1990s-2010s", decline: "2020s" },
          { id: "coke", name: "焦化", x: 250, y: 50, status: "active", peak: "2000s-2020s", decline: null },
          { id: "chem", name: "精细化工", x: 350, y: 50, status: "growing", peak: "2020s", decline: null },
          { id: "power", name: "煤电热", x: 450, y: 50, status: "declining", peak: "2000s-2010s", decline: "2020s" },
        ],
        connections: [
          { from: "mine", to: "wash", flow: "原煤" },
          { from: "wash", to: "coke", flow: "精煤" },
          { from: "coke", to: "chem", flow: "焦炉煤气" },
          { from: "wash", to: "power", flow: "中煤" },
        ],
        employment: { peak: 120000, current: 30000 },
      },
      graphite: {
        name: "石墨与冰雪链", color: "#38bdf8", icon: "⛸️",
        lifecycle: { birth: 2016, peak: 2024, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "graphite", name: "石墨采选", x: 50, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "anode", name: "负极材料", x: 150, y: 200, status: "emerging", peak: "2020s", decline: null },
          { id: "ice", name: "冰雪训练", x: 250, y: 200, status: "active", peak: "2000s-2020s", decline: null },
          { id: "tour", name: "冠军文旅", x: 350, y: 200, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "graphite", to: "anode", flow: "精粉" },
          { from: "ice", to: "tour", flow: "冠军IP" },
        ],
        employment: { peak: 5000, current: 6000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "resource", name: "焦煤可采萎缩", weight: 34, evidence: "主焦煤探明储量消耗过半，采深与成本双升", icon: "⛏️", selected: false },
        { id: "outflow", name: "人口断崖外流", weight: 26, evidence: "七普较六普人口降四分之一，收缩程度全国前列", icon: "🚉", selected: false },
        { id: "price", name: "煤焦价格周期", weight: 18, evidence: "2012-2016 焦炭深度亏损拖垮财政", icon: "📉", selected: false },
        { id: "policy", name: "去产能与小矿退出", weight: 14, evidence: "落后煤矿集中关闭，地方产量腰斩", icon: "🏭", selected: false },
        { id: "climate", name: "东北区位边缘化", weight: 8, evidence: "远离主交通干线，招商与人才引进困难", icon: "❄️", selected: false },
      ],
      rebirth_factors: [
        { id: "chem", name: "煤头化尾", weight: 28, evidence: "焦炉煤气制甲醇 LNG 等精细化工延伸", icon: "⚗️", selected: false },
        { id: "graphite", name: "石墨资源", weight: 24, evidence: "亚洲优质石墨矿储量，负极材料产业链起步", icon: "🪨", selected: false },
        { id: "champion", name: "冬奥冠军文化", weight: 22, evidence: "走出了杨扬王濛孙琳琳等十位冬奥与世界冠军", icon: "⛸️", selected: false },
        { id: "agri", name: "寒地农业", weight: 16, evidence: "大豆玉米高产区，农产品加工补链", icon: "🌾", selected: false },
        { id: "border", name: "对俄口岸联动", weight: 10, evidence: "借力俄煤俄电与木材进口通道", icon: "🛃", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1958, built: 0.5, vacant: 0, density: 8000 },
        { year: 1970, built: 5, vacant: 0, density: 11000 },
        { year: 1990, built: 18, vacant: 0.03, density: 10000 },
        { year: 2005, built: 30, vacant: 0.1, density: 8000 },
        { year: 2015, built: 38, vacant: 0.24, density: 6200 },
        { year: 2024, built: 40, vacant: 0.32, density: 4900 },
      ],
      built_up_area_km2: 40, current_pop: 645000, peak_pop: 689611, vacancy_rate: 0.32,
      housing_price_rank: "全国地级市最低梯队",
      landmark: "短道速滑冠军馆",
    },
    migration: {
      outflow_total: 220000,
      destinations: [
        { city: "哈尔滨", province: "黑龙江", count: 60000, reason: "省会就业" },
        { city: "佳木斯", province: "黑龙江", count: 25000, reason: "区域中心城市" },
        { city: "三亚", province: "海南", count: 30000, reason: "东北候鸟定居" },
        { city: "北京", province: "北京", count: 20000, reason: "务工经商" },
        { city: "其他地区", province: "全国", count: 85000, reason: "外出务工" },
      ],
    },
  },

  {
    key: "shuangyashan",
    profile: {
      name: "双鸭山市", province: "黑龙江省", prefecture: "地级市", area: "22,046 km²",
      coordinates: [131.16, 46.65],
      tags: ["煤电基地", "黑土湿地", "挹娄文化", "现代煤化工"],
      description:
        "黑龙江东部煤城，与俄罗斯隔乌苏里江相望。煤田开发于 1947 年，长期是国家级煤电基地；2011 年列入第三批资源枯竭城市。拥有全国罕见的沼泽湿地群与挹娄文化遗址，正探索煤化工与生态经济并举。",
    },
    config: {
      timeRange: { start: 1947, end: 2024 },
      phases: [
        { name: "开发期", start: 1947, end: 1978, color: "green" },
        { name: "壮盛期", start: 1979, end: 2011, color: "yellow" },
        { name: "衰落期", start: 2012, end: 2019, color: "red" },
        { name: "转型期", start: 2020, end: 2024, color: "teal" },
      ],
      primaryIndicators: [
        { key: "coal", label: "原煤产量", unit: "万吨", max: 3200, color: "#1a1a2e" },
        { key: "power", label: "火电发电量", unit: "亿千瓦时", max: 120, color: "#eab308" },
      ],
      currentStatus: "资源枯竭转型城市",
      transformationAssessment: "从煤电基地到煤化农游并举",
      transformationDetail:
        "双鸭山矿区纵贯三江平原西部，累计产煤超 20 亿吨。矿井老化与煤价低谷让'一煤独大'难以为继，城市转向煤制化肥、粮食深加工，并把安邦河、七星河等湿地打造成生态名片。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1947, title: "双鸭山矿务局成立", category: "discovery", desc: "解放战争炮火中开发煤田，煤炭支援全国建设", impact: 9, pop: 50000, coal: 40, power: 0, gdp: 0.3, event: true },
      { year: 1956, title: "设立双鸭山市", category: "peak", desc: "因煤设市，矿区人口快速聚集", impact: 8, pop: 240000, coal: 300, power: 1, gdp: 1.2, event: true },
      { year: 1985, title: "煤电基地成型", category: "peak", desc: "坑口电厂群投产，煤-电-化基地列入国家规划", impact: 8, pop: 1250000, coal: 1500, power: 30, gdp: 24, event: true },
      { year: 2002, title: "建龙入双", category: "peak", desc: "建龙钢铁落址双鸭山，延伸煤-焦-钢链条", impact: 7, pop: 1310000, coal: 2000, power: 60, gdp: 105, event: true },
      { year: 2011, title: "列入资源枯竭城市", category: "decline", desc: "国务院第三批资源枯竭城市，衰老矿井集中出现", impact: 9, pop: 1340000, coal: 2900, power: 90, gdp: 330, event: true },
      { year: 2015, title: "煤价深谷", category: "decline", desc: "煤焦钢全链条亏损，财政与就业双重承压", impact: 9, pop: 1300000, coal: 2200, power: 95, gdp: 350, event: true },
      { year: 2017, title: "去产能关井", category: "decline", desc: "关闭退出矿井数十处，产能压减千万吨级", impact: 8, pop: 1260000, coal: 1600, power: 90, gdp: 420, event: true },
      { year: 2020, title: "七普人口", category: "decline", desc: "常住人口 120.86 万，较六普下降约 15%", impact: 8, pop: 1208563, coal: 1300, power: 85, gdp: 460, event: true },
      { year: 2022, title: "湿地与黑土经济", category: "transformation", desc: "挠力河黑土带粮食深加工起步，湿地旅游纳入省线", impact: 6, pop: 1160000, coal: 1100, power: 80, gdp: 520, event: true },
      { year: 2024, title: "煤化工新篇", category: "transformation", desc: "煤制化肥与生物经济项目推进，绿色矿山修复示范", impact: 7, pop: 1120000, coal: 1050, power: 75, gdp: 560, event: true },
    ],
    chains: {
      coal: {
        name: "煤电化产业链", color: "#1a1a2e", icon: "⛏️",
        lifecycle: { birth: 1947, peak: 2010, decline: 2015, collapse: null, dead: null },
        nodes: [
          { id: "mine", name: "矿区群", x: 50, y: 50, status: "declining", peak: "1980s-2000s", decline: "2010s" },
          { id: "wash", name: "洗选", x: 150, y: 50, status: "declining", peak: "1990s-2010s", decline: "2020s" },
          { id: "power", name: "坑口电厂", x: 250, y: 50, status: "active", peak: "2000s-2020s", decline: null },
          { id: "fertilizer", name: "煤制化肥", x: 350, y: 50, status: "growing", peak: "2020s", decline: null },
          { id: "steel", name: "煤焦钢", x: 450, y: 50, status: "declining", peak: "2000s", decline: "2010s" },
        ],
        connections: [
          { from: "mine", to: "wash", flow: "原煤" },
          { from: "wash", to: "power", flow: "动力煤" },
          { from: "wash", to: "fertilizer", flow: "化工煤" },
          { from: "wash", to: "steel", flow: "焦煤" },
        ],
        employment: { peak: 160000, current: 40000 },
      },
      eco: {
        name: "黑土湿地经济链", color: "#22c55e", icon: "🦢",
        lifecycle: { birth: 2010, peak: 2024, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "grain", name: "粮食种植", x: 50, y: 200, status: "active", peak: "2010s-2020s", decline: null },
          { id: "process", name: "深加工", x: 150, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "wetland", name: "湿地旅游", x: 250, y: 200, status: "emerging", peak: "2020s", decline: null },
          { id: "heritage", name: "挹娄文化", x: 350, y: 200, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "grain", to: "process", flow: "原料" },
          { from: "wetland", to: "heritage", flow: "文旅串联" },
        ],
        employment: { peak: 20000, current: 26000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "resource", name: "煤矿资源衰减", weight: 33, evidence: "浅部煤田采尽，衰老矿井占比过半", icon: "⛏️", selected: false },
        { id: "price", name: "煤焦钢价格周期", weight: 22, evidence: "2012-2016 全链条亏损，财政收入腰斩", icon: "📉", selected: false },
        { id: "outflow", name: "人口外流", weight: 24, evidence: "十年常住人口下降 15%，青壮年加速离乡", icon: "🚉", selected: false },
        { id: "policy", name: "去产能政策", weight: 13, evidence: "小煤矿整退与产能置换压缩地方产量", icon: "🏭", selected: false },
        { id: "env", name: "沉陷与生态欠账", weight: 8, evidence: "采煤沉陷区治理资金缺口大", icon: "🕳️", selected: false },
      ],
      rebirth_factors: [
        { id: "chem", name: "现代煤化工", weight: 28, evidence: "煤制化肥等项目让煤炭就地增值", icon: "⚗️", selected: false },
        { id: "blacksoil", name: "黑土粮仓", weight: 26, evidence: "挠力河流域为全国重要商品粮基地", icon: "🌾", selected: false },
        { id: "wetland", name: "湿地生态品牌", weight: 22, evidence: "七星河、安邦河等国际重要湿地", icon: "🦢", selected: false },
        { id: "border", name: "对俄合作", weight: 14, evidence: "饶河口岸与俄远东木材煤炭贸易", icon: "🛃", selected: false },
        { id: "culture", name: "挹娄文化", weight: 10, evidence: "凤林古城等遗址激活文旅叙事", icon: "🏛️", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1947, built: 0.4, vacant: 0, density: 7000 },
        { year: 1956, built: 4, vacant: 0, density: 9000 },
        { year: 1985, built: 22, vacant: 0.02, density: 8000 },
        { year: 2005, built: 40, vacant: 0.1, density: 6500 },
        { year: 2017, built: 52, vacant: 0.22, density: 5200 },
        { year: 2024, built: 55, vacant: 0.28, density: 4600 },
      ],
      built_up_area_km2: 55, current_pop: 1120000, peak_pop: 1340000, vacancy_rate: 0.28,
      housing_price_rank: "全国地级市最低梯队",
      landmark: "七星河国家级自然保护区",
    },
    migration: {
      outflow_total: 210000,
      destinations: [
        { city: "哈尔滨", province: "黑龙江", count: 58000, reason: "省会就业" },
        { city: "佳木斯", province: "黑龙江", count: 30000, reason: "邻近区域中心" },
        { city: "山东沿海", province: "山东", count: 35000, reason: "定居与务工" },
        { city: "三亚", province: "海南", count: 22000, reason: "候鸟养老" },
        { city: "其他地区", province: "全国", count: 65000, reason: "务工求学" },
      ],
    },
  },

  {
    key: "hebi",
    profile: {
      name: "鹤壁市", province: "河南省", prefecture: "地级市", area: "2,189 km²",
      coordinates: [114.3, 35.75],
      tags: ["淇水诗河", "老煤城新生", "电子信息", "镁基新材料"],
      description:
        "豫北小城，因'鹤栖南山峭壁'得名，诗经中三十九篇与淇水相关。1957 年因煤设市，煤炭枯竭后于 2009 年列入第二批资源枯竭城市，城区整体南迁淇滨，以电子汽车零部件与镁基材料翻开新页。",
    },
    config: {
      timeRange: { start: 1952, end: 2024 },
      phases: [
        { name: "开发期", start: 1952, end: 1977, color: "green" },
        { name: "壮盛期", start: 1978, end: 2008, color: "yellow" },
        { name: "衰落期", start: 2009, end: 2017, color: "red" },
        { name: "转型期", start: 2018, end: 2024, color: "teal" },
      ],
      primaryIndicators: [
        { key: "coal", label: "煤炭产量", unit: "万吨", max: 800, color: "#1a1a2e" },
        { key: "elec", label: "电子信息产值", unit: "亿元", max: 300, color: "#38bdf8" },
      ],
      currentStatus: "资源枯竭转型与宜居城市",
      transformationAssessment: "从煤城到淇水人家的绿色转身",
      transformationDetail:
        "鹤壁矿区曾支撑豫北工业，但资源禀赋有限。城市选择'小而精'路线：老矿区改造为鹤壁集文旅街区，新区沿淇水布局，电子信息、镁铝合金与现代化工构成新产业三角，人均指标居豫北前列。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1952, title: "鹤壁煤田会战", category: "discovery", desc: "平原省组织开发鹤壁煤田，数万职工进驻山城", impact: 8, pop: 80000, coal: 20, elec: 0, gdp: 0.3, event: true },
      { year: 1957, title: "设立鹤壁市", category: "peak", desc: "因煤设市，成为河南省辖市中最年轻的城市之一", impact: 9, pop: 200000, coal: 150, elec: 0, gdp: 0.8, event: true },
      { year: 1978, title: "豫北能源支点", category: "peak", desc: "煤炭与火电并举，矿区产值占市域工业大半", impact: 7, pop: 600000, coal: 500, elec: 0.5, gdp: 7, event: true },
      { year: 1995, title: "产量峰值", category: "peak", desc: "原煤产量近八百万吨，煤矿职工家属占城区人口一半", impact: 8, pop: 1050000, coal: 780, elec: 2, gdp: 96, event: true },
      { year: 2004, title: "新区南迁淇滨", category: "transformation", desc: "跳出矿区建设淇滨新区，城市重心南移", impact: 8, pop: 1280000, coal: 700, elec: 5, gdp: 200, event: true },
      { year: 2009, title: "列入资源枯竭城市", category: "decline", desc: "国务院第二批资源枯竭城市，矿井进入衰老期", impact: 9, pop: 1340000, coal: 550, elec: 10, gdp: 340, event: true },
      { year: 2014, title: "电子信息起势", category: "transformation", desc: "汽车电子与光电子企业集聚，产业新城初显", impact: 7, pop: 1420000, coal: 400, elec: 60, gdp: 690, event: true },
      { year: 2017, title: "去产能收官", category: "decline", desc: "主力矿井陆续关停，煤炭从支柱退居辅助", impact: 8, pop: 1450000, coal: 250, elec: 120, gdp: 830, event: true },
      { year: 2020, title: "七普人口", category: "decline", desc: "常住人口 156.6 万，小城人口基本盘稳固", impact: 6, pop: 1565973, coal: 200, elec: 180, gdp: 980, event: true },
      { year: 2022, title: "镁基新材料", category: "transformation", desc: "依托白云岩资源发展镁合金深加工，HDI 电路板扩产", impact: 7, pop: 1560000, coal: 190, elec: 240, gdp: 1090, event: true },
      { year: 2024, title: "诗经淇河", category: "transformation", desc: "淇河生态廊道与诗河文化IP成型，转型考核居同类城市前列", impact: 7, pop: 1550000, coal: 180, elec: 280, gdp: 1120, event: true },
    ],
    chains: {
      coal: {
        name: "煤炭与电力链", color: "#1a1a2e", icon: "⛏️",
        lifecycle: { birth: 1952, peak: 1995, decline: 2009, collapse: 2017, dead: null },
        nodes: [
          { id: "mine", name: "矿区", x: 50, y: 50, status: "dying", peak: "1970s-1990s", decline: "2010s" },
          { id: "power", name: "火电", x: 150, y: 50, status: "declining", peak: "1990s-2010s", decline: "2020s" },
          { id: "building", name: "建材煤渣利用", x: 250, y: 50, status: "declining", peak: "2000s", decline: "2010s" },
          { id: "heritage", name: "矿区文旅", x: 350, y: 50, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "mine", to: "power", flow: "电煤" },
          { from: "power", to: "building", flow: "粉煤灰" },
          { from: "mine", to: "heritage", flow: "矿址活化" },
        ],
        employment: { peak: 90000, current: 12000 },
      },
      elec: {
        name: "电子与镁材料链", color: "#38bdf8", icon: "💡",
        lifecycle: { birth: 2004, peak: 2024, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "autoelec", name: "汽车电子", x: 50, y: 200, status: "active", peak: "2010s-2020s", decline: null },
          { id: "pcb", name: "HDI电路板", x: 150, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "magnesium", name: "镁合金", x: 250, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "5g", name: "光通信器件", x: 350, y: 200, status: "growing", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "autoelec", to: "pcb", flow: "板卡配套" },
          { from: "magnesium", to: "autoelec", flow: "轻量化部件" },
          { from: "pcb", to: "5g", flow: "器件封装" },
        ],
        employment: { peak: 40000, current: 45000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "resource", name: "煤炭储量有限", weight: 34, evidence: "矿区规模小、赋存浅，百年内即告枯竭", icon: "⛏️", selected: false },
        { id: "single", name: "煤电路径依赖", weight: 22, evidence: "煤电及建材长期占工业增加值六成", icon: "🧱", selected: false },
        { id: "policy", name: "去产能关停", weight: 18, evidence: "十三五矿井集中退出，产业空心化风险", icon: "🏭", selected: false },
        { id: "traffic", name: "交通相对边缘", weight: 14, evidence: "夹在安阳新乡之间，枢纽功能弱", icon: "🚉", selected: false },
        { id: "env", name: "山城环境承载", weight: 12, evidence: "老城区山体破坏与沉陷治理成本高", icon: "🕳️", selected: false },
      ],
      rebirth_factors: [
        { id: "qishui", name: "淇河生态与诗经IP", weight: 28, evidence: "华北唯一未受污染的独立河流，诗河文化独树一帜", icon: "🏞️", selected: false },
        { id: "elec", name: "电子产业集群", weight: 26, evidence: "汽车电子与光电子园区化集聚", icon: "💡", selected: false },
        { id: "magnesium", name: "镁基新材料", weight: 22, evidence: "白云岩资源+金属镁传统工艺升级", icon: "🪨", selected: false },
        { id: "newcity", name: "新区框架", weight: 14, evidence: "提前南迁布局，避免了资源型城市常见的拆建循环", icon: "🏙️", selected: false },
        { id: "agri", name: "农业现代化", weight: 10, evidence: "高标准农田与种业（鹤壁小麦）基础好", icon: "🌾", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1952, built: 0.5, vacant: 0, density: 9000 },
        { year: 1957, built: 3, vacant: 0, density: 12000 },
        { year: 1995, built: 18, vacant: 0.03, density: 10000 },
        { year: 2004, built: 32, vacant: 0.08, density: 8200 },
        { year: 2017, built: 48, vacant: 0.14, density: 7000 },
        { year: 2024, built: 56, vacant: 0.15, density: 6600 },
      ],
      built_up_area_km2: 56, current_pop: 1550000, peak_pop: 1565973, vacancy_rate: 0.15,
      housing_price_rank: "河南省内中游",
      landmark: "淇河诗河文化带",
    },
    migration: {
      outflow_total: 60000,
      destinations: [
        { city: "郑州", province: "河南", count: 20000, reason: "省会都市圈" },
        { city: "新乡", province: "河南", count: 7000, reason: "邻近就业" },
        { city: "安阳", province: "河南", count: 6000, reason: "邻近就业" },
        { city: "深圳", province: "广东", count: 7000, reason: "电子产业务工" },
        { city: "其他地区", province: "全国", count: 20000, reason: "务工求学" },
      ],
    },
  },

  {
    key: "xinyu",
    profile: {
      name: "新余市", province: "江西省", prefecture: "地级市", area: "3,178 km²",
      coordinates: [114.92, 27.82],
      tags: ["江西钢城", "新余钢铁", "锂电之都", "仙女湖"],
      description:
        "赣中西的钢城，1958 年为建新余钢铁厂而设市，几度撤设见证钢铁起伏。本世纪以来凭借赣锋锂业等企业卡位新能源赛道，成为全球锂盐重镇；钢铁与锂电双主业的周期共振，让这座小城在大起大落中寻找平衡。",
    },
    config: {
      timeRange: { start: 1958, end: 2024 },
      phases: [
        { name: "建市期", start: 1958, end: 1982, color: "green" },
        { name: "钢城期", start: 1983, end: 2010, color: "yellow" },
        { name: "锂电期", start: 2011, end: 2022, color: "teal" },
        { name: "调整期", start: 2023, end: 2024, color: "red" },
      ],
      primaryIndicators: [
        { key: "steel", label: "钢产量", unit: "万吨", max: 1000, color: "#64748b" },
        { key: "lithium", label: "锂盐产量", unit: "万吨", max: 12, color: "#a78bfa" },
      ],
      currentStatus: "钢铁锂电双主业城市",
      transformationAssessment: "从一钢独大到钢铁锂电双轮",
      transformationDetail:
        "新余因钢设市又因钢而兴，新钢公司长期撑起城市财政。2008 年后赣锋锂业从金属锂加工一路做大，锂盐产能全球领先，城市一度以'锂电之都'冠名；锂价暴跌周期又让城市经济坐上过山车。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1958, title: "新钢建设与设市", category: "discovery", desc: "为配套新余钢铁厂建设设新余市，钢城起飞", impact: 9, pop: 300000, steel: 2, lithium: 0, gdp: 0.8, event: true },
      { year: 1963, title: "撤市复县", category: "decline", desc: "国民经济调整中撤市，钢铁厂继续生产", impact: 6, pop: 500000, steel: 10, lithium: 0, gdp: 1.2, event: true },
      { year: 1983, title: "复设地级市", category: "peak", desc: "新钢扩产带动复市，江西工业重镇回归", impact: 8, pop: 850000, steel: 60, lithium: 0, gdp: 6, event: true },
      { year: 2000, title: "百万吨钢", category: "peak", desc: "新钢产量破百万吨，钢铁占工业增加值过半", impact: 7, pop: 1080000, steel: 200, lithium: 0.05, gdp: 72, event: true },
      { year: 2008, title: "赣锋锂业起步", category: "transformation", desc: "赣锋从金属锂深加工切入新能源材料赛道", impact: 8, pop: 1140000, steel: 500, lithium: 0.2, gdp: 270, event: true },
      { year: 2015, title: "仙女湖文旅", category: "transformation", desc: "仙女湖七夕文化IP打造，旅游收入快速增长", impact: 6, pop: 1170000, steel: 700, lithium: 1, gdp: 860, event: true },
      { year: 2020, title: "七普人口", category: "peak", desc: "常住人口 120.2 万，人均GDP居江西前列", impact: 6, pop: 1202199, steel: 900, lithium: 5, gdp: 1001, event: true },
      { year: 2022, title: "锂价巅峰", category: "peak", desc: "碳酸锂价格冲顶，锂电产业产值近千亿，城市风光无两", impact: 9, pop: 1190000, steel: 950, lithium: 10, gdp: 1350, event: true },
      { year: 2023, title: "锂价暴跌", category: "decline", desc: "碳酸锂价格腰斩再腰斩，GDP名义增速转负，单一赛道风险暴露", impact: 9, pop: 1180000, steel: 950, lithium: 9, gdp: 1286, event: true },
      { year: 2024, title: "双主业再平衡", category: "transformation", desc: "钢铁技改与锂电回收并举，产业链向正负极材料延伸", impact: 7, pop: 1170000, steel: 960, lithium: 10, gdp: 1290, event: true },
    ],
    chains: {
      steel: {
        name: "钢铁产业链", color: "#64748b", icon: "🏭",
        lifecycle: { birth: 1958, peak: 2022, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "iron", name: "炼铁", x: 50, y: 50, status: "active", peak: "1990s-2020s", decline: null },
          { id: "steel", name: "炼钢", x: 150, y: 50, status: "active", peak: "2000s-2020s", decline: null },
          { id: "rolled", name: "钢材加工", x: 250, y: 50, status: "growing", peak: "2010s-2020s", decline: null },
          { id: "equip", name: "金属制品", x: 350, y: 50, status: "growing", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "iron", to: "steel", flow: "铁水" },
          { from: "steel", to: "rolled", flow: "钢坯" },
          { from: "rolled", to: "equip", flow: "型材" },
        ],
        employment: { peak: 80000, current: 40000 },
      },
      lithium: {
        name: "锂电新能源链", color: "#a78bfa", icon: "🔋",
        lifecycle: { birth: 2008, peak: 2022, decline: 2023, collapse: null, dead: null },
        nodes: [
          { id: "spodumene", name: "锂矿采选", x: 50, y: 200, status: "active", peak: "2010s-2020s", decline: null },
          { id: "lithiumsalt", name: "锂盐冶炼", x: 150, y: 200, status: "active", peak: "2020s", decline: null },
          { id: "cathode", name: "正极材料", x: 250, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "battery", name: "电芯制造", x: 350, y: 200, status: "emerging", peak: "2020s", decline: null },
          { id: "recycle", name: "电池回收", x: 450, y: 200, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "spodumene", to: "lithiumsalt", flow: "锂精矿" },
          { from: "lithiumsalt", to: "cathode", flow: "碳酸锂" },
          { from: "cathode", to: "battery", flow: "材料" },
          { from: "battery", to: "recycle", flow: "梯次利用" },
        ],
        employment: { peak: 30000, current: 35000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "lithium", name: "锂价剧烈周期", weight: 30, evidence: "2023 年碳酸锂价格自高点跌去八成，产业税收锐减", icon: "📉", selected: false },
        { id: "steel", name: "钢铁利润微薄", weight: 22, evidence: "行业产能过剩，新钢盈利长期承压", icon: "🏭", selected: false },
        { id: "single", name: "双寡头依赖", weight: 20, evidence: "新钢+赣锋两大企业决定城市经济体温", icon: "🧱", selected: false },
        { id: "size", name: "小城市规模约束", weight: 16, evidence: "人口刚过百万，内需与人才池有限", icon: "🏙️", selected: false },
        { id: "env", name: "环境承载压力", weight: 12, evidence: "钢厂锂盐厂减排改造投入大", icon: "🌫️", selected: false },
      ],
      rebirth_factors: [
        { id: "ganfeng", name: "赣锋链主地位", weight: 30, evidence: "全球锂盐龙头总部效应，资源-材料-回收一体化", icon: "🔋", selected: false },
        { id: "recycle", name: "电池回收蓝海", weight: 22, evidence: "退役电池潮带来城市矿山新资源", icon: "♻️", selected: false },
        { id: "tech", name: "钢企技改", weight: 18, evidence: "新钢电弧炉与精品板材改造升级", icon: "⚙️", selected: false },
        { id: "tourism", name: "仙女湖IP", weight: 20, evidence: "七夕文化+康养旅游客流稳定", icon: "🏞️", selected: false },
        { id: "location", name: "赣西枢纽", weight: 10, evidence: "沪昆高铁与新宜吉合作示范区区位", icon: "🚄", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1958, built: 2, vacant: 0, density: 10000 },
        { year: 1983, built: 12, vacant: 0.02, density: 11000 },
        { year: 2000, built: 28, vacant: 0.05, density: 9500 },
        { year: 2015, built: 48, vacant: 0.1, density: 8000 },
        { year: 2024, built: 60, vacant: 0.14, density: 7200 },
      ],
      built_up_area_km2: 60, current_pop: 1170000, peak_pop: 1202199, vacancy_rate: 0.14,
      housing_price_rank: "江西省内中游",
      landmark: "仙女湖",
    },
    migration: {
      outflow_total: 50000,
      destinations: [
        { city: "南昌", province: "江西", count: 15000, reason: "省会就业" },
        { city: "宜春", province: "江西", count: 5000, reason: "锂电产业带就业" },
        { city: "深圳", province: "广东", count: 8000, reason: "珠三角务工" },
        { city: "上海", province: "上海", count: 5000, reason: "长三角务工" },
        { city: "其他地区", province: "全国", count: 17000, reason: "务工求学" },
      ],
    },
  },

  {
    key: "lianyuan",
    profile: {
      name: "涟源市", province: "湖南省", prefecture: "娄底代管县级市", area: "1,897 km²",
      coordinates: [111.67, 27.69],
      tags: ["湘中煤海", "涟邵煤田", "三一故里", "湄江山水"],
      description:
        "湘中丘陵间的百年煤乡，涟邵煤田的主产区，也曾是三线建设时期军工厂聚集地。工程机械巨头三一集团就从这里的小作坊走出。煤炭枯竭后以建材、农业与湄江旅游寻找新路，是观察中部县级资源城市转型的典型样本。",
    },
    config: {
      timeRange: { start: 1952, end: 2024 },
      phases: [
        { name: "建县期", start: 1952, end: 1977, color: "green" },
        { name: "煤海期", start: 1978, end: 2010, color: "yellow" },
        { name: "衰落期", start: 2011, end: 2019, color: "red" },
        { name: "调整期", start: 2020, end: 2024, color: "teal" },
      ],
      primaryIndicators: [
        { key: "coal", label: "煤炭产量", unit: "万吨", max: 420, color: "#1a1a2e" },
        { key: "cement", label: "水泥产量", unit: "万吨", max: 300, color: "#94a3b8" },
      ],
      currentStatus: "县级资源城市转型样本",
      transformationAssessment: "从煤海煤窑到山水湄江",
      transformationDetail:
        "涟源的煤矿曾密布乡镇，'小煤窑经济'撑起县域财政数十年。随着去产能与安全整顿，煤矿从数百家收缩到个位数。三一集团的起源故事与湄江国家地质公园，为这座城市提供了制造业基因与山水出路的想象。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1952, title: "设涟源县", category: "peak", desc: "蓝田镇为中心设县，湘中煤田开发进入组织化时代", impact: 7, pop: 500000, coal: 10, cement: 0, gdp: 0.5, event: true },
      { year: 1965, title: "三线军工厂迁入", category: "culture", desc: "多家军工厂与煤矿机械企业内迁涟源山区，奠定工业底子", impact: 7, pop: 700000, coal: 60, cement: 1, gdp: 1.5, event: true },
      { year: 1986, title: "茅塘焊接材料厂", category: "culture", desc: "梁稳根等创业者在涟源茅塘创办焊接材料厂，三一集团前身起步", impact: 8, pop: 930000, coal: 200, cement: 5, gdp: 5, event: true },
      { year: 1987, title: "撤县设市", category: "peak", desc: "涟源撤县设县级市，煤窑经济进入鼎盛前夜", impact: 7, pop: 950000, coal: 260, cement: 8, gdp: 7, event: true },
      { year: 1998, title: "小煤窑高峰", category: "peak", desc: "乡镇煤矿数百家，煤炭财政占比过半，'湘中煤海'名副其实", impact: 8, pop: 1020000, coal: 400, cement: 30, gdp: 30, event: true },
      { year: 2005, title: "整顿与矿难阴影", category: "decline", desc: "煤矿安全事故频发引发整顿，产量与税源开始波动", impact: 7, pop: 1050000, coal: 300, cement: 60, gdp: 52, event: true },
      { year: 2011, title: "煤价下行", category: "decline", desc: "煤炭黄金十年终结，小煤矿大面积亏损关停", impact: 8, pop: 1060000, coal: 220, cement: 100, gdp: 130, event: true },
      { year: 2016, title: "去产能清零", category: "decline", desc: "落后煤矿整体退出，煤炭从支柱产业位置上消失", impact: 9, pop: 1000000, coal: 80, cement: 150, gdp: 220, event: true },
      { year: 2020, title: "七普人口", category: "decline", desc: "常住人口 87.24 万，劳务输出规模居娄底前列", impact: 7, pop: 872353, coal: 50, cement: 220, gdp: 280, event: true },
      { year: 2022, title: "湄江地质公园", category: "transformation", desc: "湄江旅游区提质升级，承接长株潭休闲客源", impact: 6, pop: 850000, coal: 40, cement: 260, gdp: 320, event: true },
      { year: 2024, title: "制造基因再发芽", category: "transformation", desc: "依托三一渊源承接工程机械配套，煤矿遗址改造文旅", impact: 7, pop: 835000, coal: 35, cement: 280, gdp: 350, event: true },
    ],
    chains: {
      coal: {
        name: "煤炭产业链", color: "#1a1a2e", icon: "⛏️",
        lifecycle: { birth: 1952, peak: 1998, decline: 2011, collapse: 2016, dead: null },
        nodes: [
          { id: "mine", name: "乡镇煤窑", x: 50, y: 50, status: "dead", peak: "1980s-2000s", decline: "2010s" },
          { id: "transport", name: "短驳运输", x: 150, y: 50, status: "dying", peak: "1990s-2000s", decline: "2010s" },
          { id: "power", name: "小火电", x: 250, y: 50, status: "dead", peak: "1990s", decline: "2000s" },
          { id: "heritage", name: "矿址文旅", x: 350, y: 50, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "mine", to: "transport", flow: "原煤" },
          { from: "transport", to: "power", flow: "电煤" },
          { from: "mine", to: "heritage", flow: "矿址活化" },
        ],
        employment: { peak: 60000, current: 3000 },
      },
      cement: {
        name: "建材与制造链", color: "#94a3b8", icon: "🏗️",
        lifecycle: { birth: 1990, peak: 2024, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "cement", name: "水泥建材", x: 50, y: 200, status: "active", peak: "2000s-2020s", decline: null },
          { id: "parts", name: "机械配件", x: 150, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "agri", name: "农产品加工", x: 250, y: 200, status: "active", peak: "2010s-2020s", decline: null },
          { id: "tourism", name: "湄江旅游", x: 350, y: 200, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "cement", to: "parts", flow: "园区配套" },
          { from: "agri", to: "tourism", flow: "农旅融合" },
        ],
        employment: { peak: 25000, current: 22000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "resource", name: "煤田资源枯竭", weight: 34, evidence: "涟邵煤田浅部采尽，剩余资源零散且灾害严重", icon: "⛏️", selected: false },
        { id: "policy", name: "去产能与安全整顿", weight: 26, evidence: "9 万吨以下煤矿全部退出，煤窑经济终结", icon: "🛡️", selected: false },
        { id: "single", name: "县域产业单一", weight: 20, evidence: "煤炭及相关运输餐饮曾占县城经济大半", icon: "🧱", selected: false },
        { id: "outflow", name: "劳务外流", weight: 14, evidence: "青壮年赴长株潭珠三角务工，留守老龄化", icon: "🚉", selected: false },
        { id: "finance", name: "县级财力薄弱", weight: 6, evidence: "转型投入依赖转移支付，造血能力弱", icon: "💰", selected: false },
      ],
      rebirth_factors: [
        { id: "sany", name: "三一制造基因", weight: 28, evidence: "三一集团发源地，承接工程机械零部件配套", icon: "🏗️", selected: false },
        { id: "meijiang", name: "湄江山水", weight: 26, evidence: "国家地质公园喀斯特景观，长株潭客源圈", icon: "🏞️", selected: false },
        { id: "agri", name: "特色农业", weight: 20, evidence: "桥头河蔬菜、富硒稻米等区域品牌", icon: "🌾", selected: false },
        { id: "labor", name: "返乡创业潮", weight: 16, evidence: "外出务工者带回资本与技能反哺县域", icon: "🏠", selected: false },
        { id: "location", name: "娄底都市圈", weight: 10, evidence: "融入娄底城镇圈共享基础设施", icon: "🚄", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1952, built: 0.3, vacant: 0, density: 7000 },
        { year: 1987, built: 5, vacant: 0, density: 9000 },
        { year: 1998, built: 12, vacant: 0.04, density: 8000 },
        { year: 2012, built: 18, vacant: 0.14, density: 6500 },
        { year: 2024, built: 24, vacant: 0.2, density: 5400 },
      ],
      built_up_area_km2: 24, current_pop: 835000, peak_pop: 872353, vacancy_rate: 0.2,
      housing_price_rank: "湖南省县级市偏低",
      landmark: "湄江国家地质公园",
    },
    migration: {
      outflow_total: 180000,
      destinations: [
        { city: "长沙", province: "湖南", count: 45000, reason: "省会就业安家" },
        { city: "深圳", province: "广东", count: 38000, reason: "珠三角务工" },
        { city: "娄底城区", province: "湖南", count: 20000, reason: "就近城镇化" },
        { city: "东莞", province: "广东", count: 18000, reason: "制造业务工" },
        { city: "其他地区", province: "全国", count: 59000, reason: "务工经商" },
      ],
    },
  },
];
