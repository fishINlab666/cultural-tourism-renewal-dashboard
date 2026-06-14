export const WORKFLOW_STEPS = [
  { id: 1, title: '项目录入', hint: '下载模板并上传资料' },
  { id: 2, title: '数据补全', hint: '校对缺失和异常字段' },
  { id: 3, title: '空间诊断', hint: '查看判断与分析依据' },
  { id: 4, title: '工程造价', hint: '了解工程投入区间' },
  { id: 5, title: '投资测算', hint: '评估收益和回收周期' },
  { id: 6, title: '三案选择', hint: '选择客户交付方向' },
  { id: 7, title: '视觉深化', hint: '深化选中方案表达' },
  { id: 8, title: '报告交付', hint: '打印并保存 PDF' },
];

export const FIELD_DEFINITIONS = [
  { key: 'name', label: '项目名称', required: true, type: 'text' },
  { key: 'type', label: '项目类型', required: true, type: 'select', options: ['历史街区活化', '古建院落活化', '旧厂房文旅更新', '景区配套提升', '公共文化空间再运营'] },
  { key: 'location', label: '项目位置', required: true, type: 'text' },
  { key: 'area', label: '建筑/项目面积（㎡）', required: true, type: 'number', min: 50, max: 500000 },
  { key: 'vacancy', label: '当前空置率（%）', required: true, type: 'number', min: 0, max: 100 },
  { key: 'heritage', label: '保护与现状等级', required: true, type: 'select', options: ['一般存量建筑', '历史建筑', '文保建筑', '历史文化街区'] },
  { key: 'budget', label: '预算上限（万元）', required: true, type: 'number', min: 50, max: 100000 },
  { key: 'paybackTarget', label: '目标回本周期（年）', required: true, type: 'number', min: 0.5, max: 20 },
  { key: 'audience', label: '主要服务客群', required: true, type: 'select', options: ['文旅主管部门', '国资/城投平台', '景区运营方', '文旅开发与商业运营方'] },
  { key: 'stylePreference', label: '初步风格方向', required: true, type: 'text' },
  { key: 'organization', label: '项目单位', required: false, type: 'text' },
  { key: 'description', label: '现状与核心诉求', required: false, type: 'textarea' },
];

export const sampleData = {
  project: {
    name: '三坊七巷历史文化街区活化示范单元',
    district: '三坊七巷历史文化街区活化示范单元',
    type: '历史街区活化',
    location: '福建省福州市鼓楼区三坊七巷历史文化街区',
    area: 4200,
    vacancy: 62,
    heritage: '历史建筑',
    budget: 860,
    paybackTarget: 3,
    audience: '文旅主管部门',
    stylePreference: '低干预修缮、在地文化、当代简约',
    organization: '某文旅发展集团',
    description: '以三坊七巷街区中的示范院落为研究单元，引入文化体验、轻餐饮和研学活动，同时控制文保、消防与夜间运营风险。',
  },
  knowledge: {
    version: 'KB-2026.06-R1',
    updatedAt: '2026-06-12',
    ruleVersion: 'RULE-URBAN-1.0',
    modelVersion: 'LOCAL-DEMO-1.0',
    matchedCases: 18,
  },
  evidence: [
    { id: 'case', category: '集团历史项目库', count: 18, version: 'KB-2026.06-R1', summary: '匹配历史街区、古建院落及低干预活化案例，重点参考规模、保护等级和投资强度。' },
    { id: 'cost', category: '集团造价指标库', count: 126, version: 'COST-2026Q2', summary: '采用华东地区修缮、消防、机电、景观和数字文旅指标区间。' },
    { id: 'operation', category: '集团运营指标库', count: 42, version: 'OPS-2026Q2', summary: '参考文旅街区客流、转化率、活动收入和招商周期的脱敏统计。' },
    { id: 'policy', category: '政策及行业规则', count: 31, version: 'POLICY-2026.06', summary: '覆盖文保、消防、规划审批、噪声和夜间运营边界。' },
  ],
  diagnostics: [
    { label: '区位与导流潜力', value: 88, summary: '具备城市文化客群基础，但需要与周边街区形成连续动线。', evidence: ['case', 'operation'], reviewNote: '需补充节假日与淡季分时客流。' },
    { label: '文化适配度', value: 91, summary: '在地文化资源较强，适合低干预修缮与内容运营。', evidence: ['case', 'policy'], reviewNote: '展陈内容需经属地文化主管部门复核。' },
    { label: '工程可实施性', value: 76, summary: '基础改造可控，消防疏散和隐蔽工程仍是主要不确定项。', evidence: ['cost', 'policy'], reviewNote: '进入深化前需完成现场勘测。' },
    { label: '商业承载力', value: 82, summary: '轻餐饮、文化体验和研学组合具备可行性，不宜重餐饮化。', evidence: ['case', 'operation'], reviewNote: '租售模型需结合实际招商条件复核。' },
    { label: '夜间运营潜力', value: 73, summary: '可发展小规模夜游和活动，但需控制噪声、照明与居民影响。', evidence: ['operation', 'policy'], reviewNote: '需确认周边居民区和夜间审批边界。' },
    { label: '投资谨慎指数', value: 43, summary: '建议分期投入，以首开区验证客流与招商效率。', evidence: ['case', 'cost', 'operation'], reviewNote: '首期投资比例建议由财务与工程团队联合确认。' },
  ],
  overview: {
    score: 82,
    map: {
      center: [119.2965, 26.0875],
      label: '当前项目中心点',
      place: '福州 · 三坊七巷',
    },
    conclusions: [
      { level: 'positive', label: '优势', text: '区位与文化资源优势显著，适合低干预活化。' },
      { level: 'review', label: '复核', text: '消防疏散、夜间噪声与居民影响需专项复核。' },
      { level: 'caution', label: '谨慎', text: '建议分期投入，首开区先行验证客流与招商效率。' },
    ],
  },
  plans: [
    {
      id: 'steady', name: '稳健保育型', duration: '8-10 周',
      summary: '先开放核心院落，以修缮、展陈和周末活动验证市场，降低首期工程与招商压力。',
      mix: ['保育修缮 32%', '文化展陈 26%', '研学活动 22%', '轻配套 20%'],
      audience: '主管部门、文化机构', capex: 380, revenue: 190, netCash: 96, payback: 3.9, roi5: 126,
      risk: '经营规模偏小，需要持续内容更新与公共资源支持。', score: 82, costMultiplier: 0.92, trafficFactor: 1.08, activityFactor: 1.1,
      evidence: ['case', 'cost', 'policy'],
    },
    {
      id: 'growth', name: '复合活化型', duration: '3-4 个月',
      summary: '整合文化体验、轻餐饮、研学和活动运营，形成可持续经营的街区示范单元。',
      mix: ['文化体验 30%', '轻餐饮 24%', '研学活动 20%', '文创零售 16%', '公共空间 10%'],
      audience: '政府平台、景区运营方', capex: 720, revenue: 430, netCash: 214, payback: 3.2, roi5: 149,
      risk: '跨部门协调和招商运营复杂度上升，需要提前明确经营边界。', score: 91, costMultiplier: 1.08, trafficFactor: 1.22, activityFactor: 1.28,
      evidence: ['case', 'cost', 'operation', 'policy'],
    },
    {
      id: 'landmark', name: '城市地标型', duration: '6-8 个月',
      summary: '通过主题展演、夜游内容和数字体验形成城市级目的地，强化传播与产业联动。',
      mix: ['主题展演 34%', '夜游体验 22%', '数字文旅 18%', '品牌联名 16%', '配套商业 10%'],
      audience: '国资平台、产业合作方', capex: 1280, revenue: 890, netCash: 392, payback: 3.7, roi5: 153,
      risk: '前期投资、内容生产和持续获客要求更高，审批与扰民风险需前置控制。', score: 78, costMultiplier: 1.34, trafficFactor: 1.38, activityFactor: 1.42,
      evidence: ['case', 'cost', 'operation', 'policy'],
    },
  ],
  costs: [
    { category: '勘测与数据采集', quantity: 36, unit: '点位', unitLow: 1800, unitHigh: 4200, material: '测绘、结构初检、客流与空间数据采集', alternative: '优先覆盖重点院落与首开区，低频区域分期补测' },
    { category: '基础工程与机电', quantity: 4200, unit: '平方米', unitLow: 90, unitHigh: 160, material: '消防、照明、给排水与低干预机电更新', alternative: '优先处理安全和开业必需项，非核心区域滚动实施' },
    { category: '院落与景观提升', quantity: 18, unit: '节点', unitLow: 9500, unitHigh: 22000, material: '铺装、绿化、庭院灯、休憩与导视节点', alternative: '保留原有材料，采用可逆装置降低永久改造量' },
    { category: '数字文旅系统', quantity: 8, unit: '模块', unitLow: 28000, unitHigh: 62000, material: '导览、票务、互动展示、运营看板与内容管理', alternative: '首期采用标准化模块，验证后再开发专属能力' },
    { category: '内容与运营启动', quantity: 12, unit: '场', unitLow: 12000, unitHigh: 36000, material: '策展、研学、活动、招商和试运营', alternative: '与属地机构和品牌共创，降低一次性内容投入' },
    { category: '专业评估与报告', quantity: 12, unit: '专项', unitLow: 16000, unitHigh: 42000, material: '文保、消防、结构、造价、运营与投资评估', alternative: '先完成关键专项，深化阶段再补充完整论证' },
  ],
  revenueMix: [['空间经营', 31], ['活动展演', 22], ['研学服务', 18], ['文创零售', 17], ['品牌合作', 12]],
  risks: [
    ['文保与审批边界', '中高', '先完成现场踏勘和主管部门预沟通'],
    ['工程不确定性', '中高', '预留隐蔽工程和修缮难度系数'],
    ['招商与运营风险', '中', '采用首开区验证和分期招商'],
    ['数据与隐私风险', '中', '仅使用脱敏摘要，客户资料默认项目隔离'],
  ],
  materialSwatches: [
    ['旧砖灰', '#6B665E', '保留修缮基底'], ['榕叶绿', '#356859', '在地生态识别'], ['朱砂红', '#A9473F', '重点文化标识'],
    ['米纸白', '#F6F2E9', '展示背景'], ['木构棕', '#785C48', '门窗与家具'], ['夜游蓝', '#263A59', '夜间氛围'],
  ],
};

export function createInitialState() {
  const emptyProject = Object.fromEntries(FIELD_DEFINITIONS.map((field) => [field.key, '']));
  emptyProject.district = '';
  return {
    schemaVersion: 1,
    currentStep: 1,
    completedSteps: [],
    intakeConfirmed: false,
    importStatus: 'idle',
    workbookFileName: '',
    workbookIssues: [],
    selectedPlanId: null,
    visualMode: 'day',
    visualSplit: 50,
    selectedVisualBudgetId: 'restoration',
    investmentSandbox: { budget: 860, ticketPrice: 80, vacancy: 40 },
    analysisRun: null,
    analysisResult: null,
    project: emptyProject,
  };
}
