/**
 * new-cities-a.mjs — 新增城市创作数据（第一批：萍乡/淮北/铜陵/葫芦岛/焦作）
 *
 * 数据规范：
 * - timeline 为逐事件/逐节点条目；pop/gdp 中间年份为公开资料整理的插值估算，
 *   2020 七普人口与 2023/2024 统计公报 GDP 由 apply-patches.mjs 以采集锚点覆盖。
 * - decline/rebirth 因素 weight 合计必须为 100。
 * - 链节点 x 取 50~550（SVG 拓扑），y=50 主链 / 200 接续链。
 */

export const NEW_CITIES_A = [
  {
    key: "pingxiang",
    profile: {
      name: "萍乡市", province: "江西省", prefecture: "地级市", area: "3,823 km²",
      coordinates: [113.85, 27.62],
      tags: ["安源煤矿", "汉冶萍故地", "工运摇篮", "赣西门户"],
      description:
        "江南煤炭重镇，1898 年开办的安源煤矿是汉冶萍公司的燃料基地，也是中国工人运动的策源地。百年开采后煤炭资源趋枯，2011 年列入第三批资源枯竭城市，正向电子信息、节能环保与红色文旅转型。",
    },
    config: {
      timeRange: { start: 1898, end: 2024 },
      phases: [
        { name: "起家期", start: 1898, end: 1948, color: "green" },
        { name: "壮盛期", start: 1949, end: 1995, color: "yellow" },
        { name: "衰落期", start: 1996, end: 2016, color: "red" },
        { name: "转型期", start: 2017, end: 2024, color: "teal" },
      ],
      primaryIndicators: [
        { key: "coal", label: "煤炭产量", unit: "万吨", max: 1200, color: "#1a1a2e" },
        { key: "fireworks", label: "花炮产值", unit: "亿元", max: 200, color: "#f97316" },
      ],
      currentStatus: "转型中的赣西工矿城市",
      transformationAssessment: "从百年煤都到电子信息与工博文旅之城",
      transformationDetail:
        "萍乡因煤设市、因煤而兴，安源煤矿是中国最早采用近代化采煤技术的矿井之一。上世纪九十年代后浅部资源枯竭、煤价下行，煤矿关闭潮带来阵痛。近年依托上栗花炮传统产业升级与电子信息产业承接，城市缓慢换轨。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1898, title: "安源煤矿开办", category: "discovery", desc: "盛宣怀创办萍乡煤矿局，与汉阳铁厂、大冶铁矿合组汉冶萍公司，成为中国近代工业缩影", impact: 10, pop: 30000, coal: 10, fireworks: 1, gdp: 0.05, event: true },
      { year: 1922, title: "安源路矿工人大罢工", category: "peak", desc: "毛泽东、刘少奇等领导路矿两局万余工人罢工并取得胜利，安源被称为中国工人运动摇篮", impact: 10, pop: 80000, coal: 60, fireworks: 2, gdp: 0.3, event: true },
      { year: 1949, title: "萍乡解放，煤矿恢复", category: "peak", desc: "新中国成立后安源等矿井迅速恢复生产，成为南方重要燃料基地", impact: 8, pop: 380000, coal: 80, fireworks: 3, gdp: 0.6, event: true },
      { year: 1960, title: "设立萍乡市", category: "peak", desc: "撤萍乡县设县级市，1970 年升格为省辖地级市", impact: 8, pop: 660000, coal: 220, fireworks: 8, gdp: 1.8, event: true },
      { year: 1978, title: "产量爬坡", category: "peak", desc: "改革开放后乡镇煤矿遍地开花，煤炭产量快速攀升", impact: 7, pop: 1180000, coal: 500, fireworks: 20, gdp: 5, event: false },
      { year: 1994, title: "产量峰值", category: "peak", desc: "煤炭产量突破千万吨，煤焦产业占工业半壁江山", impact: 8, pop: 1660000, coal: 1100, fireworks: 40, gdp: 82, event: true },
      { year: 2001, title: "关闭破产潮", category: "decline", desc: "浅部资源枯竭叠加煤价低谷，国有煤矿大面积关停破产，数万矿工下岗", impact: 9, pop: 1750000, coal: 600, fireworks: 55, gdp: 102, event: true },
      { year: 2008, title: "列入首批资源枯竭城市", category: "decline", desc: "国务院将萍乡列入第一批资源枯竭城市名单，转型上升为国家命题", impact: 9, pop: 1800000, coal: 700, fireworks: 70, gdp: 235, event: true },
      { year: 2013, title: "工博园与海绵城市", category: "transformation", desc: "依托安源红色资源建设工业博览园，入选全国首批海绵城市试点", impact: 7, pop: 1820000, coal: 650, fireworks: 120, gdp: 520, event: true },
      { year: 2016, title: "去产能攻坚", category: "decline", desc: "供给侧改革关闭全部 9 万吨以下小煤矿，煤炭产量腰斩", impact: 8, pop: 1815000, coal: 450, fireworks: 150, gdp: 700, event: true },
      { year: 2020, title: "七普人口", category: "decline", desc: "常住人口约 180.5 万，较六普微降，人口外流至长株潭与珠三角", impact: 7, pop: 1805000, coal: 400, fireworks: 170, gdp: 995, event: true },
      { year: 2023, title: "承接产业转移", category: "transformation", desc: "电子信息、新能源电池材料成为新增长点，花炮产业机械化改造", impact: 7, pop: 1790000, coal: 380, fireworks: 180, gdp: 1151, event: true },
      { year: 2024, title: "百年煤城换轨", category: "transformation", desc: "安源煤矿转为工业遗产与研学基地，城市聚焦'转型示范'定位", impact: 8, pop: 1780000, coal: 360, fireworks: 185, gdp: 1180, event: true },
    ],
    chains: {
      coal: {
        name: "煤炭产业链", color: "#1a1a2e", icon: "⛏️",
        lifecycle: { birth: 1898, peak: 1994, decline: 2001, collapse: 2016, dead: null },
        nodes: [
          { id: "explore", name: "地质勘探", x: 50, y: 50, status: "dead", peak: "1950s", decline: "1990s" },
          { id: "mine", name: "井工开采", x: 150, y: 50, status: "dying", peak: "1960s-1990s", decline: "2010s" },
          { id: "wash", name: "洗选炼焦", x: 250, y: 50, status: "dying", peak: "1980s-2000s", decline: "2010s" },
          { id: "power", name: "煤电冶金", x: 350, y: 50, status: "declining", peak: "1990s", decline: "2020s" },
          { id: "chem", name: "煤化工", x: 450, y: 50, status: "declining", peak: "2000s", decline: "2020s" },
          { id: "heritage", name: "工业遗产", x: 550, y: 50, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "explore", to: "mine", flow: "井田" },
          { from: "mine", to: "wash", flow: "原煤" },
          { from: "wash", to: "power", flow: "精煤" },
          { from: "wash", to: "chem", flow: "焦炭" },
          { from: "mine", to: "heritage", flow: "矿址活化" },
        ],
        employment: { peak: 150000, current: 12000 },
      },
      fireworks: {
        name: "花炮与电子信息链", color: "#f97316", icon: "🎆",
        lifecycle: { birth: 1950, peak: 2024, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "craft", name: "传统花炮", x: 50, y: 200, status: "active", peak: "1990s-2010s", decline: null },
          { id: "machine", name: "机械化改造", x: 150, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "creative", name: "烟花文旅", x: 250, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "elec", name: "电子信息", x: 350, y: 200, status: "emerging", peak: "2020s", decline: null },
          { id: "battery", name: "电池材料", x: 450, y: 200, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "craft", to: "machine", flow: "技改" },
          { from: "machine", to: "creative", flow: "品牌" },
          { from: "machine", to: "elec", flow: "厂房共用" },
          { from: "elec", to: "battery", flow: "材料配套" },
        ],
        employment: { peak: 200000, current: 130000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "resource", name: "煤炭资源枯竭", weight: 35, evidence: "浅部煤层采尽，剩余资源埋藏深、灾害重、成本高", icon: "⛏️", selected: false },
        { id: "policy", name: "去产能政策", weight: 20, evidence: "供给侧改革关停大量矿井，产能断崖式退出", icon: "🏭", selected: false },
        { id: "single", name: "产业结构单一", weight: 18, evidence: "煤焦及其延伸产业曾占规上工业增加值一半以上", icon: "🧱", selected: false },
        { id: "migration", name: "劳动力外流", weight: 15, evidence: "毗邻长株潭，青壮年向湖南与珠三角就业迁移", icon: "🚄", selected: false },
        { id: "safety", name: "安全环保约束", weight: 12, evidence: "小煤矿事故多发被整退出清，花炮行业安全升级", icon: "🛡️", selected: false },
      ],
      rebirth_factors: [
        { id: "red", name: "安源红色IP", weight: 25, evidence: "安源路矿工人运动纪念馆为全国爱国主义教育示范基地", icon: "🚩", selected: false },
        { id: "fireworks", name: "花炮产业升级", weight: 25, evidence: "上栗花炮全国主产区之一，机械化与出口并举", icon: "🎆", selected: false },
        { id: "location", name: "赣湘边区位", weight: 20, evidence: "地处赣湘边界高铁枢纽带，承接长株潭产业外溢", icon: "🌐", selected: false },
        { id: "elec", name: "电子信息承接", weight: 20, evidence: "沿海电子代工与电池材料项目相继落地园区", icon: "💡", selected: false },
        { id: "ecology", name: "海绵城市品牌", weight: 10, evidence: "首批海绵城市试点改善城市品质与水安全", icon: "🌧️", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1898, built: 0.4, vacant: 0, density: 8000 },
        { year: 1949, built: 3, vacant: 0, density: 12000 },
        { year: 1960, built: 8, vacant: 0, density: 15000 },
        { year: 1994, built: 28, vacant: 0.03, density: 13000 },
        { year: 2008, built: 42, vacant: 0.18, density: 9800 },
        { year: 2016, built: 55, vacant: 0.25, density: 8600 },
        { year: 2024, built: 62, vacant: 0.28, density: 7900 },
      ],
      built_up_area_km2: 62, current_pop: 1780000, peak_pop: 1820000, vacancy_rate: 0.28,
      housing_price_rank: "江西省内中游",
      landmark: "安源路矿工人运动纪念馆",
    },
    migration: {
      outflow_total: 80000,
      destinations: [
        { city: "长沙", province: "湖南", count: 22000, reason: "省会就业与置业" },
        { city: "深圳", province: "广东", count: 18000, reason: "珠三角务工" },
        { city: "株洲", province: "湖南", count: 12000, reason: "制造业就业" },
        { city: "上海", province: "上海", count: 8000, reason: "劳务与经商" },
        { city: "其他地区", province: "全国", count: 20000, reason: "求学务工" },
      ],
    },
  },

  {
    key: "huaibei",
    profile: {
      name: "淮北市", province: "安徽省", prefecture: "地级市", area: "2,741 km²",
      coordinates: [116.8, 33.97],
      tags: ["皖北煤都", "运河故里", "采煤沉陷治理", "口子酒乡"],
      description:
        "华东地区重要的煤炭基地，1958 年大规模开发淮北煤田，因煤建市。长期高强度开采留下大面积采煤沉陷区，2011 年列入第三批资源枯竭城市，如今以沉陷湖治理、陶铝新材料与食品产业重塑城市。",
    },
    config: {
      timeRange: { start: 1958, end: 2024 },
      phases: [
        { name: "起步期", start: 1958, end: 1977, color: "green" },
        { name: "壮盛期", start: 1978, end: 2010, color: "yellow" },
        { name: "衰落期", start: 2011, end: 2018, color: "red" },
        { name: "转型期", start: 2019, end: 2024, color: "teal" },
      ],
      primaryIndicators: [
        { key: "coal", label: "煤炭产量", unit: "万吨", max: 3200, color: "#1a1a2e" },
        { key: "noncoal", label: "非煤产业产值", unit: "亿元", max: 700, color: "#22c55e" },
      ],
      currentStatus: "资源枯竭转型试点城市",
      transformationAssessment: "从黑色煤都到绿水青山城市样本",
      transformationDetail:
        "淮北矿区累计产煤超 10 亿吨，支撑华东工业超过半个世纪。采煤留下约 20 万亩沉陷地，城市把沉陷坑改造成绿金湖、南湖等湿地公园，入选全国矿业遗迹治理典范；陶铝新材料、煤化工与白酒食品构成新支柱。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1958, title: "淮北煤田大会战", category: "discovery", desc: "国家集中力量开发濉萧煤田，数万建设者进驻荒滩建矿", impact: 10, pop: 220000, coal: 60, noncoal: 0.2, gdp: 0.8, event: true },
      { year: 1960, title: "设立濉溪市", category: "peak", desc: "因煤设市（1971 年更名淮北市），华东能源基地地位确立", impact: 9, pop: 420000, coal: 300, noncoal: 1, gdp: 2, event: true },
      { year: 1976, title: "百对矿井格局", category: "peak", desc: "统配矿与地方矿并举，产量迈上千万吨台阶", impact: 8, pop: 900000, coal: 1000, noncoal: 5, gdp: 6, event: true },
      { year: 1998, title: "亚洲最大选煤厂", category: "peak", desc: "临涣选煤厂等配套建成，煤电产业链完备", impact: 7, pop: 1800000, coal: 2000, noncoal: 40, gdp: 88, event: true },
      { year: 2009, title: "沉陷区治理起步", category: "transformation", desc: "国家采煤沉陷区治理试点启动，南湖湿地公园建成开放", impact: 7, pop: 1950000, coal: 2800, noncoal: 180, gdp: 373, event: true },
      { year: 2011, title: "列入资源枯竭城市", category: "decline", desc: "国务院第三批资源枯竭城市，可采储量仅剩约 8 亿吨", impact: 9, pop: 1960000, coal: 2900, noncoal: 260, gdp: 505, event: true },
      { year: 2016, title: "去产能关闭矿井", category: "decline", desc: "袁庄、岱河等老矿陆续关停，数万矿工转岗分流", impact: 8, pop: 1965000, coal: 2200, noncoal: 340, gdp: 780, event: true },
      { year: 2019, title: "绿金湖治理典范", category: "transformation", desc: "16 平方公里采煤沉陷湖治理成中央公园，获联合国迪拜奖", impact: 8, pop: 1971000, coal: 1800, noncoal: 430, gdp: 950, event: true },
      { year: 2021, title: "陶铝新材料", category: "transformation", desc: "与上海交大共建陶铝研究院，陶铝活塞进入航空军工供应链", impact: 7, pop: 1970000, coal: 1600, noncoal: 520, gdp: 1220, event: true },
      { year: 2023, title: "非煤过半", category: "transformation", desc: "非煤产业产值占规上工业比重过半，煤化工与食品饮料支撑增长", impact: 7, pop: 1950000, coal: 1500, noncoal: 580, gdp: 1406, event: true },
      { year: 2024, title: "山水生态城市", category: "transformation", desc: "依山带水格局成型，'一带双城三美丽'空间体系落地", impact: 7, pop: 1940000, coal: 1450, noncoal: 620, gdp: 1450, event: true },
    ],
    chains: {
      coal: {
        name: "煤电产业链", color: "#1a1a2e", icon: "⛏️",
        lifecycle: { birth: 1958, peak: 2009, decline: 2016, collapse: null, dead: null },
        nodes: [
          { id: "mine", name: "矿井群", x: 50, y: 50, status: "declining", peak: "1980s-2000s", decline: "2010s" },
          { id: "wash", name: "选洗加工", x: 150, y: 50, status: "active", peak: "1990s-2010s", decline: null },
          { id: "power", name: "坑口电厂", x: 250, y: 50, status: "active", peak: "2000s-2020s", decline: null },
          { id: "chem", name: "煤化工", x: 350, y: 50, status: "growing", peak: "2010s-2020s", decline: null },
          { id: "reclaim", name: "沉陷区修复", x: 450, y: 50, status: "growing", peak: "2010s-2020s", decline: null },
        ],
        connections: [
          { from: "mine", to: "wash", flow: "原煤" },
          { from: "wash", to: "power", flow: "精煤" },
          { from: "power", to: "chem", flow: "蒸汽电" },
          { from: "mine", to: "reclaim", flow: "沉陷地" },
        ],
        employment: { peak: 220000, current: 60000 },
      },
      noncoal: {
        name: "陶铝食品接续链", color: "#22c55e", icon: "🏺",
        lifecycle: { birth: 2009, peak: 2024, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "taolv", name: "陶铝新材料", x: 50, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "food", name: "食品白酒", x: 150, y: 200, status: "active", peak: "2010s-2020s", decline: null },
          { id: "textile", name: "纺织服装", x: 250, y: 200, status: "active", peak: "2000s-2010s", decline: null },
          { id: "equip", name: "装备制造", x: 350, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "digital", name: "数字经济", x: 450, y: 200, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "taolv", to: "equip", flow: "轻量化部件" },
          { from: "food", to: "digital", flow: "电商渠道" },
          { from: "equip", to: "digital", flow: "工业互联网" },
        ],
        employment: { peak: 90000, current: 95000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "resource", name: "可采储量萎缩", weight: 32, evidence: "剩余可采储量不足峰值期三分之一，开采深度超千米", icon: "⛏️", selected: false },
        { id: "sink", name: "采煤沉陷扩大", weight: 22, evidence: "沉陷区约 20 万亩，部分村庄整体搬迁", icon: "🕳️", selected: false },
        { id: "price", name: "煤价周期", weight: 16, evidence: "2012-2015 煤价下行导致矿区亏损面扩大", icon: "📉", selected: false },
        { id: "policy", name: "去产能退出", weight: 18, evidence: "十三五关闭退出矿井十余处、产能近千万吨", icon: "🏭", selected: false },
        { id: "talent", name: "人才外流", weight: 12, evidence: "毗邻徐州合肥，高校毕业生留淮率低", icon: "🎓", selected: false },
      ],
      rebirth_factors: [
        { id: "lake", name: "沉陷湖生态品牌", weight: 30, evidence: "绿金湖/南湖治理获联合国迪拜国际改善居住环境范例奖", icon: "🌊", selected: false },
        { id: "taolv", name: "陶铝新材料", weight: 25, evidence: "国家产业攀高峰成果转化，军品民品双线拓展", icon: "🏺", selected: false },
        { id: "chem", name: "煤化工延伸", weight: 20, evidence: "临涣工业园区焦炉气制甲醇等循环链条成型", icon: "⚗️", selected: false },
        { id: "food", name: "口子酒食品业", weight: 15, evidence: "口子窖为徽酒代表，食品产业集群稳定就业", icon: "🍶", selected: false },
        { id: "traffic", name: "高铁枢纽", weight: 10, evidence: "淮北高铁接入全国网，融入长三角三小时圈", icon: "🚄", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1958, built: 1, vacant: 0, density: 15000 },
        { year: 1971, built: 9, vacant: 0, density: 16000 },
        { year: 1990, built: 26, vacant: 0.02, density: 13000 },
        { year: 2005, built: 42, vacant: 0.08, density: 10500 },
        { year: 2015, built: 58, vacant: 0.16, density: 8800 },
        { year: 2024, built: 72, vacant: 0.2, density: 7600 },
      ],
      built_up_area_km2: 72, current_pop: 1940000, peak_pop: 1971000, vacancy_rate: 0.2,
      housing_price_rank: "安徽省内偏低",
      landmark: "南湖国家城市湿地公园",
    },
    migration: {
      outflow_total: 90000,
      destinations: [
        { city: "合肥", province: "安徽", count: 26000, reason: "省会就业安家" },
        { city: "徐州", province: "江苏", count: 14000, reason: "邻近都市圈就业" },
        { city: "上海", province: "上海", count: 14000, reason: "长三角务工" },
        { city: "杭州", province: "浙江", count: 10000, reason: "数字经济就业" },
        { city: "其他地区", province: "全国", count: 26000, reason: "务工求学" },
      ],
    },
  },

  {
    key: "tongling",
    profile: {
      name: "铜陵市", province: "安徽省", prefecture: "地级市", area: "2,992 km²",
      coordinates: [117.81, 30.95],
      tags: ["中国古铜都", "铜官山", "铜基新材料", "循环经济"],
      description:
        "采冶铜的历史绵延三千余年，金牛洞古采矿遗址印证'中国古铜都'之名。1950 年代恢复铜官山矿建设并设市，铜产业至今仍是城市命脉；2009 年列入第二批资源枯竭城市后，转向铜基新材料与循环经济。",
    },
    config: {
      timeRange: { start: 1949, end: 2024 },
      phases: [
        { name: "恢复期", start: 1949, end: 1977, color: "green" },
        { name: "壮盛期", start: 1978, end: 2008, color: "yellow" },
        { name: "调整期", start: 2009, end: 2016, color: "red" },
        { name: "转型期", start: 2017, end: 2024, color: "teal" },
      ],
      primaryIndicators: [
        { key: "copper", label: "电解铜产量", unit: "万吨", max: 170, color: "#c9752e" },
        { key: "products", label: "铜材加工量", unit: "万吨", max: 220, color: "#38bdf8" },
      ],
      currentStatus: "全国资源型城市转型示范",
      transformationAssessment: "从采矿冶铜到铜基新材料全链",
      transformationDetail:
        "铜陵有色是中国最早的铜工业企业之一，电解铜产量长期居全国前列。矿山资源品位下降后，城市把重心转向冶炼技术与铜材深加工，进口铜精矿支撑冶炼规模，循环经济工业园实现'吃干榨净'。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1949, title: "铜官山矿恢复建设", category: "discovery", desc: "新中国重开铜官山铜矿，第一批有色金属工业基地起步", impact: 9, pop: 60000, copper: 0.3, products: 0, gdp: 0.2, event: true },
      { year: 1956, title: "设立铜官山市", category: "peak", desc: "因矿设市，1964 年改名铜陵，'中国古铜都'名实归一", impact: 8, pop: 150000, copper: 2, products: 0.3, gdp: 0.8, event: true },
      { year: 1978, title: "第二冶炼厂投产", category: "peak", desc: "电解铜产能跃升，铜陵有色跻身全国铜工业主力", impact: 7, pop: 460000, copper: 8, products: 2, gdp: 6, event: true },
      { year: 1992, title: "铜商品市场", category: "peak", desc: "建成全国重要铜材集散地，铜经济深度嵌入城市肌理", impact: 6, pop: 660000, copper: 16, products: 8, gdp: 42, event: true },
      { year: 2002, title: "资源危机显现", category: "decline", desc: "本地矿山品位降至 0.5% 以下，铜官山矿等相继闭坑", impact: 8, pop: 700000, copper: 26, products: 15, gdp: 92, event: true },
      { year: 2009, title: "列入资源枯竭城市", category: "decline", desc: "国务院第二批资源枯竭城市，转型基金到位", impact: 9, pop: 730000, copper: 55, products: 45, gdp: 343, event: true },
      { year: 2013, title: "循环经济升级", category: "transformation", desc: "铜陵经开区循环化改造，冶炼废渣制酸建材全利用", impact: 7, pop: 740000, copper: 120, products: 120, gdp: 640, event: true },
      { year: 2016, title: "枞阳划入", category: "peak", desc: "区划调整人口增加，拥江发展打开腹地", impact: 6, pop: 1310000, copper: 135, products: 150, gdp: 950, event: true },
      { year: 2020, title: "七普人口", category: "decline", desc: "常住人口 131 万，市域人口多年基本盘稳定但增长乏力", impact: 6, pop: 1310000, copper: 150, products: 185, gdp: 1004, event: true },
      { year: 2023, title: "铜基新材料集群", category: "transformation", desc: "高端铜箔、铜板带产能扩张，新能源电池铜材放量", impact: 7, pop: 1300000, copper: 165, products: 210, gdp: 1229, event: true },
      { year: 2024, title: "古铜都新篇", category: "transformation", desc: "矿山公园与金牛洞遗址申遗推进，冶炼-加工-文创全链格局成型", impact: 7, pop: 1295000, copper: 170, products: 220, gdp: 1260, event: true },
    ],
    chains: {
      copper: {
        name: "铜冶炼产业链", color: "#c9752e", icon: "🔶",
        lifecycle: { birth: 1949, peak: 2005, decline: 2010, collapse: null, dead: null },
        nodes: [
          { id: "mine", name: "矿山采选", x: 50, y: 50, status: "dying", peak: "1950s-1990s", decline: "2000s" },
          { id: "smelt", name: "铜冶炼", x: 150, y: 50, status: "active", peak: "1990s-2020s", decline: null },
          { id: "refine", name: "电解精炼", x: 250, y: 50, status: "active", peak: "2000s-2020s", decline: null },
          { id: "acid", name: "制酸化工", x: 350, y: 50, status: "active", peak: "2000s-2020s", decline: null },
          { id: "recycle", name: "再生铜", x: 450, y: 50, status: "growing", peak: "2010s-2020s", decline: null },
        ],
        connections: [
          { from: "mine", to: "smelt", flow: "铜精矿" },
          { from: "smelt", to: "refine", flow: "粗铜" },
          { from: "smelt", to: "acid", flow: "烟气" },
          { from: "recycle", to: "refine", flow: "杂铜" },
        ],
        employment: { peak: 100000, current: 35000 },
      },
      products: {
        name: "铜材加工与新材料链", color: "#38bdf8", icon: "🌀",
        lifecycle: { birth: 1990, peak: 2024, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "rod", name: "铜杆线缆", x: 50, y: 200, status: "active", peak: "2000s-2010s", decline: null },
          { id: "strip", name: "高精铜板带", x: 150, y: 200, status: "growing", peak: "2010s-2020s", decline: null },
          { id: "foil", name: "电子铜箔", x: 250, y: 200, status: "emerging", peak: "2020s", decline: null },
          { id: "newmat", name: "铜基合金", x: 350, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "culture", name: "铜文化创意", x: 450, y: 200, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "rod", to: "strip", flow: "深加工" },
          { from: "strip", to: "foil", flow: "极薄化" },
          { from: "strip", to: "newmat", flow: "合金化" },
          { from: "newmat", to: "culture", flow: "材料让艺术" },
        ],
        employment: { peak: 60000, current: 55000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "resource", name: "矿山品位衰减", weight: 34, evidence: "本地矿铜品位跌破 0.5%，铜官山等老矿闭坑", icon: "⛏️", selected: false },
        { id: "single", name: "对铜依赖过深", weight: 25, evidence: "铜产业占规上工业比重长期过半，抗周期脆弱", icon: "🧱", selected: false },
        { id: "price", name: "铜价周期", weight: 18, evidence: "2008 与 2015 两轮铜价深跌冲击冶炼利润", icon: "📉", selected: false },
        { id: "env", name: "冶炼环保约束", weight: 13, evidence: "酸雾重金属排放治理抬高成本", icon: "🌫️", selected: false },
        { id: "market", name: "原料外依", weight: 10, evidence: "铜精矿依赖进口，港口物流成本敏感", icon: "🚢", selected: false },
      ],
      rebirth_factors: [
        { id: "chain", name: "全产业链纵深", weight: 28, evidence: "从冶炼到铜箔的完整加工链，抗波动能力强于单纯采掘", icon: "🔗", selected: false },
        { id: "newmat", name: "铜基新材料", weight: 24, evidence: "国家先进结构材料产业集群（铜基）落地", icon: "🧪", selected: false },
        { id: "recycle", name: "再生铜循环", weight: 20, evidence: "循环经济园使废旧铜再入冶炼体系", icon: "♻️", selected: false },
        { id: "heritage", name: "古铜都文化", weight: 18, evidence: "金牛洞遗址与铜雕艺术形成文旅品牌", icon: "🏛️", selected: false },
        { id: "location", name: "长江黄金水道", weight: 10, evidence: "长江港口降低进口矿运输成本", icon: "⚓", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1949, built: 0.5, vacant: 0, density: 9000 },
        { year: 1956, built: 3, vacant: 0, density: 14000 },
        { year: 1980, built: 12, vacant: 0.02, density: 12000 },
        { year: 2000, built: 30, vacant: 0.05, density: 10000 },
        { year: 2012, built: 45, vacant: 0.12, density: 8600 },
        { year: 2024, built: 58, vacant: 0.15, density: 7400 },
      ],
      built_up_area_km2: 58, current_pop: 1295000, peak_pop: 1310000, vacancy_rate: 0.15,
      housing_price_rank: "安徽省内中游",
      landmark: "青铜文化广场",
    },
    migration: {
      outflow_total: 45000,
      destinations: [
        { city: "合肥", province: "安徽", count: 14000, reason: "省会就业" },
        { city: "芜湖", province: "安徽", count: 8000, reason: "同城制造业" },
        { city: "上海", province: "上海", count: 7000, reason: "长三角务工" },
        { city: "杭州", province: "浙江", count: 5000, reason: "电商与制造" },
        { city: "其他地区", province: "全国", count: 11000, reason: "务工求学" },
      ],
    },
  },

  {
    key: "huludao",
    profile: {
      name: "葫芦岛市", province: "辽宁省", prefecture: "地级市", area: "10,415 km²",
      coordinates: [120.84, 40.71],
      tags: ["中国锌都", "锦西", "环渤海工业带", "核電新篇"],
      description:
        "辽西走廊咽喉，葫芦岛锌厂始建于一九三〇年代，曾为亚洲最大锌冶炼企业；锦西石化等老工业与造船业共同构成环渤海工业重镇。1989 年升格地级市，有色金属与石化主业随资源与市场周期起落，正向精细化工与清洁能源转型。",
    },
    config: {
      timeRange: { start: 1937, end: 2024 },
      phases: [
        { name: "起家期", start: 1937, end: 1965, color: "green" },
        { name: "壮盛期", start: 1966, end: 2005, color: "yellow" },
        { name: "调整期", start: 2006, end: 2017, color: "red" },
        { name: "转型期", start: 2018, end: 2024, color: "teal" },
      ],
      primaryIndicators: [
        { key: "zinc", label: "锌产量", unit: "万吨", max: 40, color: "#7c8ea0" },
        { key: "refine", label: "原油加工量", unit: "万吨", max: 800, color: "#0ea5e9" },
      ],
      currentStatus: "辽西老工业基地转型城市",
      transformationAssessment: "从有色冶金到精细化工与清洁能源",
      transformationDetail:
        "葫芦岛（旧称锦西）因港而兴、因厂设市。锌冶炼伴随环保与原料约束多次限产搬迁，石化装置老化倒逼升级。近年依托徐大堡核电与精细化工园区寻找新支点，老工业城市在渤海湾重新落子。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1937, title: "锌厂始建", category: "discovery", desc: "日据时期在锦西建设制炼所，葫芦岛锌厂的前身开工", impact: 8, pop: 60000, zinc: 0.2, refine: 0, gdp: 0.1, event: true },
      { year: 1948, title: "辽西解放", category: "peak", desc: "辽沈战役后工厂回到人民手中，迅速恢复生产", impact: 8, pop: 120000, zinc: 0.6, refine: 2, gdp: 0.3, event: true },
      { year: 1959, title: "锦西石化扩建", category: "peak", desc: "炼油装置扩能，锦西成为辽西能源化工支点", impact: 7, pop: 400000, zinc: 2, refine: 40, gdp: 3, event: true },
      { year: 1989, title: "升格地级市", category: "peak", desc: "撤锦西市设葫芦岛市，辖县扩容开启港口工业城市时代", impact: 9, pop: 2400000, zinc: 18, refine: 260, gdp: 52, event: true },
      { year: 1998, title: "产量高峰", category: "peak", desc: "电解锌产量跻身全国前列，'中国锌都'叫响", impact: 8, pop: 2600000, zinc: 33, refine: 380, gdp: 176, event: true },
      { year: 2008, title: "周期与环保夹击", category: "decline", desc: "全球金融危机叠加环保标准收紧，锌冶炼开工率下滑", impact: 8, pop: 2680000, zinc: 26, refine: 450, gdp: 456, event: true },
      { year: 2013, title: "渤海综合治理", category: "decline", desc: "渤海湾生态治理攻坚，沿海工业排污门槛大幅提高", impact: 7, pop: 2670000, zinc: 20, refine: 500, gdp: 725, event: true },
      { year: 2017, title: "老厂搬迁改造", category: "decline", desc: "城区锌冶炼产能启动搬迁升级，城区化工企业退城入园", impact: 8, pop: 2640000, zinc: 15, refine: 560, gdp: 700, event: true },
      { year: 2020, title: "七普人口", category: "decline", desc: "常住人口 243.4 万，十年间人口净流出近 20 万", impact: 8, pop: 2434000, zinc: 14, refine: 600, gdp: 820, event: true },
      { year: 2022, title: "核电开工", category: "transformation", desc: "徐大堡核电项目推进，清洁能源基地写入城市未来", impact: 8, pop: 2390000, zinc: 16, refine: 660, gdp: 871, event: true },
      { year: 2024, title: "精细化工转身", category: "transformation", desc: "沿海精细化工园区投产， Zinc 新材料与船舶海工并进", impact: 7, pop: 2360000, zinc: 17, refine: 690, gdp: 935, event: true },
    ],
    chains: {
      zinc: {
        name: "锌冶金产业链", color: "#7c8ea0", icon: "⚗️",
        lifecycle: { birth: 1937, peak: 1998, decline: 2008, collapse: 2017, dead: null },
        nodes: [
          { id: "concentrate", name: "锌精矿", x: 50, y: 50, status: "dying", peak: "1950s-1990s", decline: "2000s" },
          { id: "roast", name: "焙烧", x: 150, y: 50, status: "declining", peak: "1970s-2000s", decline: "2010s" },
          { id: "electro", name: "湿法电解", x: 250, y: 50, status: "declining", peak: "1990s", decline: "2010s" },
          { id: "alloy", name: "锌基合金", x: 350, y: 50, status: "declining", peak: "2000s", decline: "2020s" },
          { id: "newmat", name: "锌基新材料", x: 450, y: 50, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "concentrate", to: "roast", flow: "矿砂" },
          { from: "roast", to: "electro", flow: "焙砂" },
          { from: "electro", to: "alloy", flow: "锌锭" },
          { from: "alloy", to: "newmat", flow: "升级" },
        ],
        employment: { peak: 50000, current: 8000 },
      },
      refine: {
        name: "石化精细化工链", color: "#0ea5e9", icon: "🛢️",
        lifecycle: { birth: 1950, peak: 2024, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "crude", name: "原油加工", x: 50, y: 200, status: "active", peak: "1990s-2020s", decline: null },
          { id: "olefin", name: "烯烃芳烃", x: 150, y: 200, status: "growing", peak: "2010s-2020s", decline: null },
          { id: "fine", name: "精细化工", x: 250, y: 200, status: "emerging", peak: "2020s", decline: null },
          { id: "ship", name: "船舶海工", x: 350, y: 200, status: "active", peak: "2000s-2010s", decline: null },
          { id: "nuclear", name: "核电能源", x: 450, y: 200, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "crude", to: "olefin", flow: "原料" },
          { from: "olefin", to: "fine", flow: "下游" },
          { from: "crude", to: "ship", flow: "燃油涂料" },
          { from: "nuclear", to: "fine", flow: "绿电" },
        ],
        employment: { peak: 60000, current: 40000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "resource", name: "有色资源外依", weight: 26, evidence: "本地无自有锌矿，原料长期依赖进口与外购", icon: "⛏️", selected: false },
        { id: "env", name: "环保标准升级", weight: 24, evidence: "渤海治理与大气攻坚使老冶炼装置难以达标", icon: "🌫️", selected: false },
        { id: "age", name: "装备老化", weight: 20, evidence: "三线前建成的装置服役超半个世纪，改造欠账大", icon: "🏚️", selected: false },
        { id: "outflow", name: "人口外流", weight: 18, evidence: "东北普遍现象，十年常住人口下降近两成", icon: "🚉", selected: false },
        { id: "market", name: "价格周期", weight: 12, evidence: "锌价与油价双周期叠加，波动放大亏损", icon: "📉", selected: false },
      ],
      rebirth_factors: [
        { id: "nuclear", name: "徐大堡核电", weight: 30, evidence: "中俄合作核电项目落地，清洁能源基地打开增量", icon: "☢️", selected: false },
        { id: "port", name: "港口区位", weight: 22, evidence: "葫芦岛港与绥中港连接东北腹地与环渤海航线", icon: "⚓", selected: false },
        { id: "fine", name: "精细化工升级", weight: 20, evidence: "退城入园后向高附加值精细品延伸", icon: "⚗️", selected: false },
        { id: "tourism", name: "滨海文旅", weight: 18, evidence: "兴城古城与海滨浴场构成辽西旅游带", icon: "🏖️", selected: false },
        { id: "ship", name: "船舶海工底盘", weight: 10, evidence: "渤海造船厂等军工船坞保持产业底盘", icon: "🚢", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1937, built: 0.6, vacant: 0, density: 7000 },
        { year: 1959, built: 6, vacant: 0, density: 10000 },
        { year: 1989, built: 30, vacant: 0.03, density: 9000 },
        { year: 2005, built: 55, vacant: 0.1, density: 7500 },
        { year: 2017, built: 78, vacant: 0.2, density: 6000 },
        { year: 2024, built: 88, vacant: 0.24, density: 5200 },
      ],
      built_up_area_km2: 88, current_pop: 2360000, peak_pop: 2680000, vacancy_rate: 0.24,
      housing_price_rank: "辽宁省内偏低",
      landmark: "兴城古城",
    },
    migration: {
      outflow_total: 260000,
      destinations: [
        { city: "沈阳", province: "辽宁", count: 70000, reason: "省会就业" },
        { city: "大连", province: "辽宁", count: 45000, reason: "沿海制造业" },
        { city: "北京", province: "北京", count: 40000, reason: "京津冀务工" },
        { city: "秦皇岛", province: "河北", count: 20000, reason: "邻近就业" },
        { city: "其他地区", province: "全国", count: 85000, reason: "务工定居" },
      ],
    },
  },

  {
    key: "jiaozuo",
    profile: {
      name: "焦作市", province: "河南省", prefecture: "地级市", area: "4,071 km²",
      coordinates: [113.24, 35.22],
      tags: ["百年煤城", "英福公司", "云台山", "转型典范"],
      description:
        "豫西北百年煤城，1898 年英国福公司在此开矿，是中原最早实现近代化采煤的城市之一。煤炭枯竭后先于 2008 年列入首批资源枯竭城市，随即以云台山为代表的文旅转型声名鹊起，被誉为资源型城市转型样板。",
    },
    config: {
      timeRange: { start: 1898, end: 2024 },
      phases: [
        { name: "起家期", start: 1898, end: 1948, color: "green" },
        { name: "壮盛期", start: 1949, end: 1998, color: "yellow" },
        { name: "衰落期", start: 1999, end: 2015, color: "red" },
        { name: "转型期", start: 2016, end: 2024, color: "teal" },
      ],
      primaryIndicators: [
        { key: "coal", label: "煤炭产量", unit: "万吨", max: 1100, color: "#1a1a2e" },
        { key: "tourism", label: "旅游收入", unit: "亿元", max: 550, color: "#22c55e" },
      ],
      currentStatus: "资源枯竭城市转型样板",
      transformationAssessment: "从黑色矿井到山水焦作",
      transformationDetail:
        "焦作煤矿曾与英国资本深度纠缠，也孕育了焦作路矿学堂（今中国矿业大学前身之一）。上世纪末煤炭见底后，城市把太行山水做成王牌：云台山景区收入连年攀升，同时以氟化工、汽车零部件再造工业底盘。",
      reportStamp: "ARCHIVED",
    },
    events: [
      { year: 1898, title: "英福公司开矿", category: "discovery", desc: "英国福公司取得矿权，焦作进入近代机械化采煤时代", impact: 10, pop: 20000, coal: 5, tourism: 0, gdp: 0.05, event: true },
      { year: 1909, title: "焦作路矿学堂", category: "culture", desc: "福公司创办路矿学堂，开中国矿业高等教育先河", impact: 8, pop: 60000, coal: 30, tourism: 0, gdp: 0.2, event: true },
      { year: 1925, title: "焦作煤矿大罢工", category: "peak", desc: "五卅运动推动下焦作煤矿工人大罢工坚持八个月并获胜", impact: 9, pop: 100000, coal: 60, tourism: 0, gdp: 0.4, event: true },
      { year: 1956, title: "设立焦作市", category: "peak", desc: "因煤设市，成为河南重要能源基地", impact: 8, pop: 460000, coal: 200, tourism: 0, gdp: 1.6, event: true },
      { year: 1985, title: "千万吨矿区", category: "peak", desc: "煤炭产量破千万吨，煤化工与耐火材料同步壮大", impact: 8, pop: 2300000, coal: 1000, tourism: 0.3, gdp: 45, event: true },
      { year: 1999, title: "资源见底", category: "decline", desc: "浅部煤炭枯竭，矿井大面积亏损，'因煤而困'显现", impact: 8, pop: 3100000, coal: 500, tourism: 5, gdp: 212, event: true },
      { year: 2001, title: "云台山崛起", category: "transformation", desc: "云台山地质公园开园，旅游立市战略启动", impact: 9, pop: 3150000, coal: 450, tourism: 12, gdp: 256, event: true },
      { year: 2008, title: "首批资源枯竭城市", category: "decline", desc: "列入国务院首批资源枯竭城市，转型获国家支持", impact: 9, pop: 3280000, coal: 400, tourism: 80, gdp: 1030, event: true },
      { year: 2013, title: "旅游收入破三百亿", category: "transformation", desc: "云台山成为全国 5A 标杆，文旅替代煤炭成为名片", impact: 8, pop: 3390000, coal: 350, tourism: 300, gdp: 1600, event: true },
      { year: 2016, title: "去产能关矿", category: "decline", desc: "最后一批矿井关闭退出，煤炭让位接续产业", impact: 7, pop: 3490000, coal: 200, tourism: 350, gdp: 2020, event: true },
      { year: 2020, title: "七普人口", category: "decline", desc: "常住人口 352.1 万，稳中微降", impact: 6, pop: 3521000, coal: 180, tourism: 180, gdp: 2125, event: true },
      { year: 2022, title: "氟锂新材料", category: "transformation", desc: "多氟多等企业带动氟化工向新能源材料跃迁", impact: 7, pop: 3510000, coal: 170, tourism: 250, gdp: 2235, event: true },
      { year: 2024, title: "山水富民", category: "transformation", desc: "全域旅游与新材料双轮驱动，百年煤城完成换轨", impact: 7, pop: 3490000, coal: 160, tourism: 420, gdp: 2300, event: true },
    ],
    chains: {
      coal: {
        name: "煤炭产业链", color: "#1a1a2e", icon: "⛏️",
        lifecycle: { birth: 1898, peak: 1985, decline: 1999, collapse: 2016, dead: null },
        nodes: [
          { id: "mine", name: "矿井开采", x: 50, y: 50, status: "dying", peak: "1950s-1990s", decline: "2000s" },
          { id: "wash", name: "洗选加工", x: 150, y: 50, status: "dying", peak: "1970s-2000s", decline: "2010s" },
          { id: "chem", name: "煤化工", x: 250, y: 50, status: "declining", peak: "1990s-2000s", decline: "2010s" },
          { id: "alumina", name: "铝工业", x: 350, y: 50, status: "declining", peak: "2000s", decline: "2010s" },
          { id: "heritage", name: "矿业遗产", x: 450, y: 50, status: "emerging", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "mine", to: "wash", flow: "原煤" },
          { from: "wash", to: "chem", flow: "精煤" },
          { from: "chem", to: "alumina", flow: "电力" },
          { from: "mine", to: "heritage", flow: "矿址活化" },
        ],
        employment: { peak: 180000, current: 15000 },
      },
      tourism: {
        name: "文旅与新材料链", color: "#22c55e", icon: "🏔️",
        lifecycle: { birth: 2001, peak: 2024, decline: null, collapse: null, dead: null },
        nodes: [
          { id: "yuntai", name: "云台山", x: 50, y: 200, status: "active", peak: "2010s-2020s", decline: null },
          { id: "stay", name: "民宿康养", x: 150, y: 200, status: "growing", peak: "2020s", decline: null },
          { id: "fluor", name: "氟化工", x: 250, y: 200, status: "growing", peak: "2010s-2020s", decline: null },
          { id: "battery", name: "电池新材料", x: 350, y: 200, status: "emerging", peak: "2020s", decline: null },
          { id: "equip", name: "装备制造", x: 450, y: 200, status: "growing", peak: "2020s", decline: null },
        ],
        connections: [
          { from: "yuntai", to: "stay", flow: "客流" },
          { from: "fluor", to: "battery", flow: "氟盐延伸" },
          { from: "battery", to: "equip", flow: "零部件" },
        ],
        employment: { peak: 120000, current: 140000 },
      },
    },
    diagnosis: {
      decline_factors: [
        { id: "resource", name: "煤炭资源枯竭", weight: 36, evidence: "百年开采后浅部无煤可采，剩余储量零散高硫", icon: "⛏️", selected: false },
        { id: "sink", name: "沉陷与生态欠账", weight: 18, evidence: "采煤沉陷区广泛分布，矿区生态修复任务重", icon: "🕳️", selected: false },
        { id: "single", name: "煤铝路径依赖", weight: 20, evidence: "电解铝与煤化工曾高度绑定煤炭能源", icon: "🧱", selected: false },
        { id: "price", name: "煤价周期", weight: 14, evidence: "1998 与 2015 两轮煤价低谷放大矿区困境", icon: "📉", selected: false },
        { id: "policy", name: "安全与去产能", weight: 12, evidence: "高瓦斯矿井安全整顿与去产能政策加速退出", icon: "🛡️", selected: false },
      ],
      rebirth_factors: [
        { id: "yuntai", name: "云台山品牌", weight: 32, evidence: "红石峡丹崖碧水成为中原文旅第一IP", icon: "🏔️", selected: false },
        { id: "fluor", name: "氟化工升级", weight: 24, evidence: "从传统氟盐到六氟磷酸锂的电子级跃迁", icon: "⚗️", selected: false },
        { id: "traffic", name: "中原枢纽", weight: 18, evidence: "郑焦城际与太焦高铁接入中原城市群", icon: "🚄", selected: false },
        { id: "education", name: "高教科研", weight: 16, evidence: "河南理工大学等百年矿院校地合作", icon: "🎓", selected: false },
        { id: "ecology", name: "南水北调穿城", weight: 10, evidence: "干渠穿城改善生态与城市形象", icon: "💧", selected: false },
      ],
    },
    space: {
      timeline: [
        { year: 1898, built: 0.3, vacant: 0, density: 6000 },
        { year: 1956, built: 5, vacant: 0, density: 11000 },
        { year: 1985, built: 30, vacant: 0.02, density: 12000 },
        { year: 2005, built: 55, vacant: 0.1, density: 9000 },
        { year: 2016, built: 80, vacant: 0.16, density: 7600 },
        { year: 2024, built: 95, vacant: 0.18, density: 7000 },
      ],
      built_up_area_km2: 95, current_pop: 3490000, peak_pop: 3521000, vacancy_rate: 0.18,
      housing_price_rank: "河南省内中游",
      landmark: "云台山红石峡",
    },
    migration: {
      outflow_total: 70000,
      destinations: [
        { city: "郑州", province: "河南", count: 24000, reason: "省会都市圈就业" },
        { city: "洛阳", province: "河南", count: 8000, reason: "邻近城市就业" },
        { city: "深圳", province: "广东", count: 8000, reason: "珠三角务工" },
        { city: "西安", province: "陕西", count: 5000, reason: "就近省会圈" },
        { city: "其他地区", province: "全国", count: 25000, reason: "务工求学" },
      ],
    },
  },
];
