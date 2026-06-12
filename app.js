const sampleData = {
  project: {
    district: '绿洲循环校园行动',
    type: '校园低碳改造',
    area: 4200,
    vacancy: 62,
    heritage: '原型验证期',
    budget: 860,
    paybackTarget: 3,
    audience: '评委 / 投资方',
  },
  sources: [
    {
      title: '校园能耗数据',
      type: '真实',
      detail: '宿舍与教学楼用电、回收站投递、活动参与频次、设备运行日志',
      update: '2026-06-11',
      confidence: 86,
    },
    {
      title: '双碳政策数据',
      type: '公开',
      detail: '绿色校园、节能降碳、循环经济、创新创业扶持政策',
      update: '2026-06-10',
      confidence: 79,
    },
    {
      title: '赛事评审数据',
      type: '合作',
      detail: '评审维度、同赛道项目、路演反馈、投资方关注关键词',
      update: '2026-06-08',
      confidence: 72,
    },
    {
      title: '行业均值推演',
      type: '推演',
      detail: '节能设备单价、碳核证成本、校园运营人力、企业赞助转化率',
      update: '2026-06-11',
      confidence: 64,
    },
  ],
  diagnostics: [
    ['政策契合度', 88],
    ['减碳可信度', 84],
    ['校园落地性', 91],
    ['商业转化力', 76],
    ['投资吸引力', 73],
    ['执行风险指数', 43],
  ],
  plans: [
    {
      id: 'steady',
      name: '稳健试点型',
      summary: '先覆盖 2-3 个高频校园场景，用低成本传感器和回收激励验证减碳数据可信度。',
      mix: ['节能监测 32%', '回收激励 26%', '环保课程 22%', '路演材料 20%'],
      audience: '评委、高校管理者',
      capex: 380,
      revenue: 190,
      netCash: 96,
      payback: 3.9,
      roi5: 126,
      duration: '8-10 周',
      risk: '样本规模偏小，减碳模型需要第三方或校方数据背书',
      score: 82,
      costMultiplier: 0.92,
      trafficFactor: 1.08,
      activityFactor: 1.1,
    },
    {
      id: 'growth',
      name: '校园扩展型',
      summary: '把节能、回收、碳积分和活动运营整合成校园级数据看板，适合评审现场展示完整闭环。',
      mix: ['碳账本 30%', '智能回收 24%', '节能改造 20%', '企业赞助 16%', '赛事传播 10%'],
      audience: '评委 / 投资方',
      capex: 720,
      revenue: 430,
      netCash: 214,
      payback: 3.2,
      roi5: 149,
      duration: '3-4 个月',
      risk: '跨部门协同和设备运维复杂度上升，需要明确校方数据权限',
      score: 91,
      costMultiplier: 1.08,
      trafficFactor: 1.22,
      activityFactor: 1.28,
    },
    {
      id: 'landmark',
      name: '平台化增长型',
      summary: '面向多校复制，叠加企业 ESG 赞助、碳积分运营和绿色创新项目库，形成数据中台产品。',
      mix: ['多校 SaaS 34%', 'ESG 赞助 22%', '碳积分运营 18%', '创新项目库 16%', '咨询服务 10%'],
      audience: '产业合作方、投资机构',
      capex: 1280,
      revenue: 890,
      netCash: 392,
      payback: 3.7,
      roi5: 153,
      duration: '6-8 个月',
      risk: '产品化和合规要求更高，隐私、数据接口和碳核证标准需提前锁定',
      score: 78,
      costMultiplier: 1.34,
      trafficFactor: 1.38,
      activityFactor: 1.42,
    },
  ],
  costs: [
    {
      category: '数据采集类',
      quantity: 36,
      unit: '点位',
      unitLow: 1800,
      unitHigh: 4200,
      material: '电表接入、回收称重、参与热度与活动数据采集',
      alternative: '先覆盖高频点位，低频场景用人工周报补录',
    },
    {
      category: '节能设备类',
      quantity: 4200,
      unit: '人覆盖',
      unitLow: 90,
      unitHigh: 160,
      material: '照明节能、插座管理、低功耗传感器',
      alternative: '优先改造宿舍与公共教室，按季度滚动扩容',
    },
    {
      category: '循环回收类',
      quantity: 18,
      unit: '站点',
      unitLow: 9500,
      unitHigh: 22000,
      material: '智能回收箱、称重模块、积分兑换屏',
      alternative: '回收箱先租赁，积分兑换接入校内权益',
    },
    {
      category: '平台开发类',
      quantity: 8,
      unit: '模块',
      unitLow: 28000,
      unitHigh: 62000,
      material: '数据看板、碳账本、评审页、移动端打卡',
      alternative: 'V0 采用静态样例和规则引擎，后续再接 API',
    },
    {
      category: '运营活动类',
      quantity: 12,
      unit: '场',
      unitLow: 12000,
      unitHigh: 36000,
      material: '绿色挑战赛、课程共创、企业路演、志愿者运营',
      alternative: '绑定社团和学院课程，降低外包活动成本',
    },
    {
      category: '核证报告类',
      quantity: 12,
      unit: '指标',
      unitLow: 16000,
      unitHigh: 42000,
      material: '减碳模型、基线测算、第三方复核、投资材料',
      alternative: '先做校方确认口径，再引入第三方核证',
    },
  ],
  revenueMix: [
    ['校方试点', 31],
    ['企业赞助', 22],
    ['数据服务', 18],
    ['碳积分运营', 17],
    ['赛事孵化', 12],
  ],
  risks: [
    ['减碳数据核证', '中高', '明确基线、口径和第三方复核路径'],
    ['校园协同风险', '中', '提前绑定后勤、学院和学生组织负责人'],
    ['投资回收风险', '中', '把赞助、服务费和复制收入分层测算'],
    ['隐私与安全风险', '中', '只展示聚合数据，避免采集个人敏感信息'],
  ],
  materialSwatches: [
    ['Google 蓝', '#1E40AF', '评审主按钮'],
    ['生态绿', '#16A34A', '减碳正向指标'],
    ['琥珀高亮', '#D97706', '投资提醒'],
    ['雾面底色', '#F8FAFC', '中台背景'],
    ['数据边线', '#DBEAFE', '图表分隔'],
    ['深海正文', '#17213A', '核心文字'],
  ],
  storyboard: [
    '镜头一：评委输入项目条件，校园影响画布点亮节能、回收和路演节点。',
    '镜头二：切换碳数据模式，减碳潜力、校园触点和资金化指标同步出现。',
    '镜头三：切换材料策略模式，设备、数据平台和核证成本被标注。',
    '镜头四：系统收束到报告页，输出方案、造价、验证周期和投资风险摘要。',
  ],
};

const state = {
  selectedPlanId: 'growth',
  dataRefreshCount: 0,
  visualMode: 'day',
};

const formatWan = (value) => `${Math.round(value).toLocaleString('zh-CN')} 万`;
const formatPercent = (value) => `${value}%`;

function getSelectedPlan() {
  return sampleData.plans.find((plan) => plan.id === state.selectedPlanId) || sampleData.plans[0];
}

function calculateCostRange(plan) {
  const verificationFactor = sampleData.project.heritage.includes('规模化') || sampleData.project.heritage.includes('产业化') ? 1.18 : 1.06;
  const deviceFactor = sampleData.project.type.includes('能源') || sampleData.project.type.includes('低碳') ? 1.12 : 1;
  const reserveFactor = 1.08;

  const rows = sampleData.costs.map((item) => {
    const low = item.quantity * item.unitLow * verificationFactor * deviceFactor * reserveFactor * plan.costMultiplier / 10000;
    const high = item.quantity * item.unitHigh * verificationFactor * deviceFactor * reserveFactor * plan.costMultiplier / 10000;
    return { ...item, low, high };
  });

  return {
    rows,
    low: rows.reduce((sum, row) => sum + row.low, 0),
    high: rows.reduce((sum, row) => sum + row.high, 0),
  };
}

function updateAssistant(text) {
  document.querySelector('#assistantText').textContent = text;
}

function setActiveStep(targetId) {
  document.querySelectorAll('.rail-step').forEach((step) => {
    step.classList.toggle('is-active', step.dataset.target === targetId);
  });
}

function renderSummary() {
  const plan = getSelectedPlan();
  const cost = calculateCostRange(plan);
  const metrics = [
    ['推荐方案', plan.name, `推荐指数 ${plan.score}`],
    ['预计总投入', formatWan(plan.capex), `造价粗算 ${Math.round(cost.low)}-${Math.round(cost.high)} 万`],
    ['年度资金化收益', formatWan(plan.netCash), `年化收入 ${formatWan(plan.revenue)}`],
    ['验证周期', `${plan.payback} 年`, `目标 ${sampleData.project.paybackTarget} 年内`],
  ];

  document.querySelector('#summaryMetrics').innerHTML = metrics.map(([label, value, hint]) => `
    <article class="summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </article>
  `).join('');
}

function renderSources() {
  const boost = state.dataRefreshCount > 0 ? 2 : 0;
  document.querySelector('#dataSources').innerHTML = sampleData.sources.map((source) => `
    <article class="source-item">
      <header>
        <h4>${source.title}</h4>
        <span class="source-tag">${source.type}</span>
      </header>
      <p>${source.detail}</p>
      <div class="source-meta">
        <span>更新：${source.update}</span>
        <strong>可信度 ${Math.min(source.confidence + boost, 96)}%</strong>
      </div>
    </article>
  `).join('');
}

function renderDiagnosis() {
  document.querySelector('#diagnosisList').innerHTML = sampleData.diagnostics.map(([label, value]) => `
    <div class="diagnosis-item">
      <header>
        <strong>${label}</strong>
        <span>${value}/100</span>
      </header>
      <div class="bar-track" aria-hidden="true">
        <div class="bar-fill" style="width: ${value}%"></div>
      </div>
    </div>
  `).join('');
}

function renderPlans() {
  document.querySelector('#planCards').innerHTML = sampleData.plans.map((plan) => {
    const pressed = plan.id === state.selectedPlanId ? 'true' : 'false';
    return `
      <button class="plan-card" type="button" data-plan-id="${plan.id}" aria-pressed="${pressed}">
        <div>
          <p class="eyebrow">${plan.duration}</p>
          <h4>${plan.name}</h4>
        </div>
        <p>${plan.summary}</p>
        <div class="plan-tags">${plan.mix.map((item) => `<span>${item}</span>`).join('')}</div>
        <div class="plan-metrics">
          <span>预计投入<strong>${formatWan(plan.capex)}</strong></span>
          <span>年收入<strong>${formatWan(plan.revenue)}</strong></span>
          <span>验证周期<strong>${plan.payback} 年</strong></span>
          <span>5 年 ROI<strong>${formatPercent(plan.roi5)}</strong></span>
        </div>
        <p><strong>主要风险：</strong>${plan.risk}</p>
      </button>
    `;
  }).join('');

  document.querySelectorAll('.plan-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedPlanId = card.dataset.planId;
      renderDashboard();
      updateAssistant(`已切换为「${getSelectedPlan().name}」，造价、现金流和视觉提示词已同步刷新。`);
      showToast(`已切换为「${getSelectedPlan().name}」测算口径`);
    });
  });
}

function renderCost() {
  const plan = getSelectedPlan();
  const cost = calculateCostRange(plan);
  document.querySelector('#costRangeBadge').textContent = `${Math.round(cost.low)}-${Math.round(cost.high)} 万`;
  document.querySelector('#costRows').innerHTML = cost.rows.map((row) => `
    <tr>
      <td><strong>${row.category}</strong></td>
      <td>${row.quantity.toLocaleString('zh-CN')} ${row.unit}</td>
      <td>${row.unitLow.toLocaleString('zh-CN')}-${row.unitHigh.toLocaleString('zh-CN')} 元/${row.unit}</td>
      <td>${Math.round(row.low)}-${Math.round(row.high)} 万</td>
      <td>${row.material}<br>替代：${row.alternative}</td>
    </tr>
  `).join('');
}

function renderInvestment() {
  const plan = getSelectedPlan();
  const monthlyTraffic = Math.round(4200 * plan.trafficFactor);
  const eventLift = Math.round((plan.activityFactor - 1) * 100);
  const metrics = [
    ['总投资', formatWan(plan.capex)],
    ['年化收入', formatWan(plan.revenue)],
    ['年度资金化收益', formatWan(plan.netCash)],
    ['3-5 年 ROI', formatPercent(plan.roi5)],
    ['覆盖师生预测', `${monthlyTraffic.toLocaleString('zh-CN')} 人`],
    ['参与拉动系数', `+${eventLift}%`],
  ];

  document.querySelector('#paybackBadge').textContent = `${plan.payback} 年验证`;
  document.querySelector('#investmentMetrics').innerHTML = metrics.map(([label, value]) => `
    <div class="investment-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join('');

  document.querySelector('#revenueMix').innerHTML = sampleData.revenueMix.map(([label, value]) => `
    <div class="mix-row">
      <span>${label}</span>
      <div class="bar-track" aria-hidden="true"><div class="mix-fill" style="width: ${value}%"></div></div>
      <strong>${value}%</strong>
    </div>
  `).join('');

  document.querySelector('#riskList').innerHTML = sampleData.risks.map(([label, level, action]) => `
    <div class="risk-row">
      <span><strong>${label}</strong> · ${level}</span>
      <span>${action}</span>
    </div>
  `).join('');
}

function visualModeLabel() {
  if (state.visualMode === 'night') return '夜间运营';
  if (state.visualMode === 'material') return '材料策略';
  return '日间动线';
}

function renderVisuals() {
  const plan = getSelectedPlan();
  const canvas = document.querySelector('#visualCanvas');
  canvas.dataset.mode = state.visualMode;

  document.querySelectorAll('#visualModeButtons button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.visualMode === state.visualMode);
  });

  document.querySelector('#materialSwatches').innerHTML = sampleData.materialSwatches.map(([name, color, use]) => `
    <article class="swatch-card">
      <div class="swatch" style="background: ${color}"></div>
      <strong>${name}</strong>
      <span>${use}</span>
    </article>
  `).join('');

  document.querySelector('#visualPrompt').textContent =
    `${sampleData.project.district}，${plan.name}，${visualModeLabel()}，校园可持续创新赛，Material You / MD3 风格，${plan.mix.join('、')}，清晰呈现减碳数据、资金化收益、校园触点和运营边界，概念级投前沟通视觉。`;
  document.querySelector('#storyboardList').innerHTML = sampleData.storyboard.map((item) => `<li>${item}</li>`).join('');
}

function buildReportMarkdown() {
  const plan = getSelectedPlan();
  const cost = calculateCostRange(plan);
  return [
    '# 校园可持续创新赛投前评审报告',
    '',
    `项目：${sampleData.project.district}`,
    `项目类型：${sampleData.project.type}`,
    `推荐方案：${plan.name}`,
    `当前视觉模式：${visualModeLabel()}`,
    '',
    '## 核心结论',
    `建议以「${plan.name}」作为首轮深化方案。预计投入 ${formatWan(plan.capex)}，年化收入 ${formatWan(plan.revenue)}，年度资金化收益 ${formatWan(plan.netCash)}，验证周期 ${plan.payback} 年。`,
    '',
    '## 投入造价区间',
    `造价粗算区间约 ${Math.round(cost.low)}-${Math.round(cost.high)} 万元，包含数据采集、节能设备、循环回收、平台开发、运营活动和核证报告。`,
    '',
    '## 风险提示',
    ...sampleData.risks.map(([label, level, action]) => `- ${label}：${level}，${action}`),
    '',
    '## 说明',
    '本 V0 使用样例数据和规则化测算，不接真实 AI、地图、图像模型或外部数据 API；结果仅用于创新赛路演、投前沟通和方案比选。',
  ].join('\n');
}

function renderReport() {
  const plan = getSelectedPlan();
  const cost = calculateCostRange(plan);
  document.querySelector('#reportPreview').innerHTML = `
    <h4>校园可持续创新赛投前评审报告 · 预览</h4>
    <p>项目 ${sampleData.project.district} 当前更适合进入「${plan.name}」深化。系统建议以 ${plan.duration} 为验证准备周期，预计投入 ${formatWan(plan.capex)}，造价粗算 ${Math.round(cost.low)}-${Math.round(cost.high)} 万元，年度资金化收益约 ${formatWan(plan.netCash)}。</p>
    <p>成果包包含：创新赛评审摘要、三案比选报告、投入造价预评估、投资测算表、可持续影响诊断书、交互式视觉方案册。视觉内容为概念级投前沟通材料，不作为真实投资承诺或最终审计结果。</p>
  `;
}

function renderDashboard() {
  renderSummary();
  renderSources();
  renderDiagnosis();
  renderPlans();
  renderCost();
  renderInvestment();
  renderVisuals();
  renderReport();
}

function syncProjectFromForm() {
  sampleData.project.district = document.querySelector('#districtInput').value;
  sampleData.project.type = document.querySelector('#buildingTypeInput').value;
  sampleData.project.area = Number(document.querySelector('#areaInput').value);
  sampleData.project.vacancy = Number(document.querySelector('#vacancyInput').value);
  sampleData.project.heritage = document.querySelector('#heritageInput').value;
  sampleData.project.budget = Number(document.querySelector('#budgetInput').value);
  sampleData.project.paybackTarget = Number(document.querySelector('#paybackInput').value);
  sampleData.project.audience = document.querySelector('#audienceInput').value;
}

function downloadText(fileName, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function bindEvents() {
  document.querySelector('#projectForm').addEventListener('input', () => {
    syncProjectFromForm();
    renderDashboard();
    updateAssistant('项目输入已更新，三案、造价和报告预览已按样例规则联动刷新。');
  });

  document.querySelectorAll('.rail-step').forEach((step) => {
    step.addEventListener('click', () => {
      const target = document.querySelector(`#${step.dataset.target}`);
      setActiveStep(step.dataset.target);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('#visualModeButtons button').forEach((button) => {
    button.addEventListener('click', () => {
      state.visualMode = button.dataset.visualMode;
      renderVisuals();
      updateAssistant(`视觉方案已切换到「${visualModeLabel()}」模式，可继续比对材料和运营边界。`);
    });
  });

  document.querySelector('#refreshDataButton').addEventListener('click', () => {
    state.dataRefreshCount += 1;
    document.querySelector('#refreshStamp').textContent = `更新于 2026-06-11 · 已补全 ${state.dataRefreshCount} 次`;
    renderSources();
    updateAssistant('数据补全已刷新，可信度做本地模拟上调，风险提示保持人工复核口径。');
    showToast('样例数据已刷新，可信度做本地模拟上调');
  });

  document.querySelector('#fillSampleButton').addEventListener('click', () => {
    document.querySelector('#districtInput').value = sampleData.project.district;
    document.querySelector('#buildingTypeInput').value = sampleData.project.type;
    document.querySelector('#areaInput').value = sampleData.project.area;
    document.querySelector('#vacancyInput').value = sampleData.project.vacancy;
    document.querySelector('#heritageInput').value = sampleData.project.heritage;
    document.querySelector('#budgetInput').value = sampleData.project.budget;
    document.querySelector('#paybackInput').value = sampleData.project.paybackTarget;
    document.querySelector('#audienceInput').value = sampleData.project.audience;
    renderDashboard();
    updateAssistant('已填入 V0 演示样例项目，你可以直接切换方案或视觉模式。');
    showToast('已填入 V0 演示样例项目');
  });

  document.querySelector('#exportMarkdownButton').addEventListener('click', () => {
    downloadText('校园可持续创新赛投前评审报告.md', buildReportMarkdown(), 'text/markdown;charset=utf-8');
  });

  document.querySelector('#exportHtmlButton').addEventListener('click', () => {
    const html = `<!doctype html><meta charset="utf-8"><title>投前决策报告</title><pre>${buildReportMarkdown()}</pre>`;
    downloadText('校园可持续创新赛投前评审报告.html', html, 'text/html;charset=utf-8');
  });

  document.querySelector('#copyReportButton').addEventListener('click', async () => {
    await navigator.clipboard.writeText(buildReportMarkdown());
    showToast('报告摘要已复制到剪贴板');
  });
}

bindEvents();
renderDashboard();
