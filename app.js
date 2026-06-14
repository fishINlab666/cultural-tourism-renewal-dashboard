import { FIELD_DEFINITIONS, WORKFLOW_STEPS, createInitialState, sampleData } from './data.mjs';
import {
  LocalAnalysisProvider,
  calculateCostRange,
  calculateScenarioEnvelope,
  canEnterStep,
  getSelectedPlan,
  invalidateProjectDependentState,
  validateProject,
} from './analysis.mjs';
import { parseWorkbook } from './workbook.mjs';
import { clearDraft, loadDraft, saveDraft } from './storage.mjs';
import { createDiagnosticView } from './diagnostic-view.mjs';
import {
  buildSandboxRevenueMix,
  calculateInvestmentSandbox,
  createInvestmentSandboxView,
} from './investment-sandbox.mjs';
import { createVisualDeepeningView, reduceVisualState } from './visual-deepening.mjs';

const stepDescriptions = {
  1: '先用统一模板准备项目资料，系统只会要求您处理必要字段。',
  2: '确认项目资料后，系统将综合集团数据、规则模型与 AI 推理开始分析。',
  3: '先看结论，再按需查看集团数据依据、可信度和人工复核事项。',
  4: '在选择最终方案前，先了解三条路径可能形成的工程投入边界。',
  5: '用总体收益区间和风险动作判断项目是否值得继续深化。',
  6: '分析与测算完成后，由您选择最终提交给客户的方案方向。',
  7: '围绕已确认方案深化日间、夜间和材料表达，不展示技术提示词。',
  8: '检查完整成果后，通过浏览器打印功能保存为 PDF。',
};

const initialState = createInitialState();
const restoredDraft = loadDraft();
const state = restoredDraft
  ? { ...initialState, ...restoredDraft, project: { ...initialState.project, ...restoredDraft.project } }
  : initialState;
const provider = new LocalAnalysisProvider(sampleData);
const diagnosticView = createDiagnosticView(window);
const investmentSandboxView = createInvestmentSandboxView(window);
const visualDeepeningView = createVisualDeepeningView(window);
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const formatWan = (value) => `${Math.round(value).toLocaleString('zh-CN')} 万`;
const formatPercent = (value) => `${value}%`;
const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function getVisualElements() {
  return {
    selectedPlanTitle: $('#selectedPlanTitle'),
    selectedPlanSummary: $('#selectedPlanSummary'),
    visualCostRange: $('#visualCostRange'),
    modeButtons: $('#visualModeButtons'),
    tabs: $$('#visualModeButtons [role="tab"]'),
    comparisonPanel: $('#visualComparisonPanel'),
    materialPanel: $('#visualMaterialPanel'),
    comparison: $('#visualComparison'),
    split: $('#visualSplit'),
    beforeImage: $('#visualBeforeImage'),
    afterImage: $('#visualAfterImage'),
    imageStatus: $('#visualImageStatus'),
    hotspots: $('#visualHotspots'),
    budgetDetail: $('#visualBudgetDetail'),
    allocationBar: $('#visualAllocationBar'),
    allocationLegend: $('#visualAllocationLegend'),
  };
}

function persistState() {
  try {
    saveDraft(state);
    $('#autosaveStatus').textContent = '草稿已自动保存';
  } catch {
    $('#autosaveStatus').textContent = '草稿保存失败';
  }
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

function showMessage(message) {
  const banner = $('#messageBanner');
  banner.textContent = message;
  banner.hidden = false;
}

function clearMessage() {
  $('#messageBanner').hidden = true;
}

function markComplete(step) {
  if (!state.completedSteps.includes(step)) state.completedSteps.push(step);
  state.completedSteps.sort((a, b) => a - b);
}

function renderStepper() {
  $$('.step-button').forEach((button) => {
    const step = Number(button.dataset.step);
    button.classList.toggle('is-current', step === state.currentStep);
    button.classList.toggle('is-complete', state.completedSteps.includes(step));
    button.disabled = !canEnterStep(step, state) && step !== state.currentStep;
    button.setAttribute('aria-current', step === state.currentStep ? 'step' : 'false');
  });
  $('#progressText').textContent = `${state.currentStep} / ${WORKFLOW_STEPS.length}`;
}

function renderHeader() {
  const step = WORKFLOW_STEPS[state.currentStep - 1];
  $('#stepEyebrow').textContent = `第 ${step.id} 步，共 ${WORKFLOW_STEPS.length} 步`;
  $('#stepTitle').textContent = step.title;
  $('#stepDescription').textContent = stepDescriptions[step.id];
  $('#projectBadge strong').textContent = state.importStatus === 'parsed' || state.intakeConfirmed ? state.project.name : '尚未导入';
  $$('.step-panel').forEach((panel) => { panel.hidden = Number(panel.dataset.stepPanel) !== state.currentStep; });
}

function renderFileState() {
  const fileState = $('#fileState');
  if (state.importStatus === 'parsed') {
    fileState.classList.add('is-ready');
    fileState.querySelector('strong').textContent = state.workbookFileName || '演示项目数据';
    fileState.querySelector('small').textContent = `已读取 ${FIELD_DEFINITIONS.length} 个标准字段，可进入下一步校对。`;
  } else {
    fileState.classList.remove('is-ready');
    fileState.querySelector('strong').textContent = '等待上传 .xlsx 文件';
    fileState.querySelector('small').textContent = '系统将在本地解析，不会把原始文件发送到外部服务。';
  }
}

function fieldControl(field, value) {
  const safeValue = escapeHtml(value);
  if (field.type === 'select') {
    return `<select id="field-${field.key}" name="${field.key}">${field.options.map((option) => `<option${option === value ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select>`;
  }
  if (field.type === 'textarea') return `<textarea id="field-${field.key}" name="${field.key}">${safeValue}</textarea>`;
  return `<input id="field-${field.key}" name="${field.key}" type="${field.type}" value="${safeValue}"${field.min !== undefined ? ` min="${field.min}"` : ''}${field.max !== undefined ? ` max="${field.max}"` : ''}${field.type === 'number' ? ' step="any"' : ''}>`;
}

function renderCorrectionForm() {
  const issuesByField = new Map(state.workbookIssues.map((issue) => [issue.field, issue.message]));
  $('#projectCorrectionForm').innerHTML = FIELD_DEFINITIONS.map((field) => {
    const issue = issuesByField.get(field.key);
    const wide = field.type === 'textarea' || field.key === 'stylePreference' || field.key === 'location';
    return `<label class="field${issue ? ' has-error' : ''}${wide ? ' is-wide' : ''}" for="field-${field.key}">
      <span>${field.label}${field.required ? ' *' : ''}</span>
      ${fieldControl(field, state.project[field.key] ?? '')}
      <small>${issue ? escapeHtml(issue) : field.required ? '必填' : '选填'}</small>
    </label>`;
  }).join('');
  updateValidationSummary();
}

function updateValidationSummary() {
  const issues = state.workbookIssues;
  const status = $('#validationStatus');
  const summary = $('#workbookIssues');
  if (!state.workbookFileName && state.importStatus !== 'parsed') {
    status.textContent = '待上传';
    status.classList.remove('is-good');
    summary.hidden = true;
    return;
  }
  if (issues.length) {
    status.textContent = `${issues.length} 项需处理`;
    status.classList.remove('is-good');
    summary.innerHTML = `<strong>请完成以下校对：</strong>${issues.map((issue) => `<div>${escapeHtml(FIELD_DEFINITIONS.find((field) => field.key === issue.field)?.label ?? issue.field)}：${escapeHtml(issue.message)}</div>`).join('')}`;
    summary.hidden = false;
  } else {
    status.textContent = '数据完整';
    status.classList.add('is-good');
    summary.hidden = true;
  }
}

function renderSources() {
  $('#analysisSources').innerHTML = sampleData.evidence.map((source) => `<article class="source-row">
    <div><strong>${escapeHtml(source.category)}</strong><span>${source.count} 条</span></div>
    <small>${escapeHtml(source.summary)}</small>
    <span>版本 ${escapeHtml(source.version)}</span>
  </article>`).join('');
}

function renderAnalysisProgress() {
  const currentStage = state.analysisStage ?? (state.analysisRun?.status === 'completed' ? 4 : 0);
  $$('[data-analysis-stage]').forEach((item) => {
    const stage = Number(item.dataset.analysisStage);
    item.classList.toggle('is-active', state.analysisRun?.status === 'running' && stage === currentStage);
    item.classList.toggle('is-complete', state.analysisRun?.status === 'completed' || stage < currentStage);
  });
}

function evidenceTags(evidence) {
  return `<div class="evidence-tags">${evidence.map((item) => `<span>${escapeHtml(item.category)} · ${item.count} 条</span>`).join('')}</div>`;
}

function renderDiagnostics() {
  const diagnostics = state.analysisResult?.diagnostics ?? [];
  const isComplete = state.analysisRun?.status === 'completed' && Boolean(state.analysisResult?.overview);
  $('#analysisProgress').hidden = isComplete;
  $('#diagnosticWorkbench').hidden = !isComplete;
  $('#diagnosticEvidence').hidden = !isComplete;
  $('#diagnosticList').innerHTML = diagnostics.map((item) => `<article class="diagnostic-card">
    <div class="diagnostic-head"><strong>${escapeHtml(item.label)}</strong><strong>${item.value}</strong></div>
    <p>${escapeHtml(item.summary)}</p>
    <div class="evidence-summary"><strong>分析依据</strong>${evidenceTags(item.evidence)}</div>
    <div class="manual-review">人工复核：${escapeHtml(item.reviewNote)}</div>
  </article>`).join('');
  const run = state.analysisResult?.run;
  $('#analysisVersion').innerHTML = run
    ? `<span>集团知识库 ${escapeHtml(run.knowledgeVersion)}</span><span>规则版本 ${escapeHtml(run.ruleVersion)}</span><span>模型版本 ${escapeHtml(run.modelVersion)}</span><span>本次分析可按版本复现</span>`
    : '<span>完成数据确认后显示分析版本。</span>';
  if (isComplete && state.currentStep === 3) {
    window.requestAnimationFrame(() => diagnosticView.render({
      overview: state.analysisResult.overview,
      diagnostics,
      elements: {
        projectMap: $('#projectMap'),
        mapboxCanvas: $('#mapboxCanvas'),
        mapModeChip: $('#mapModeChip'),
        mapPlaceName: $('#mapPlaceName'),
        overallScore: $('#overallScore'),
        diagnosticRadar: $('#diagnosticRadar'),
        radarFallbackValues: $('#radarFallbackValues'),
        diagnosticConclusions: $('#diagnosticConclusions'),
      },
    }));
  }
}

function currentCostContext() {
  const selected = getSelectedPlan(sampleData, state.selectedPlanId);
  if (selected && state.completedSteps.includes(6)) return { selected, range: calculateCostRange(state.project, sampleData.costs, selected) };
  return { selected: null, range: calculateScenarioEnvelope(state.project, sampleData.costs, sampleData.plans).cost };
}

function renderCost() {
  const envelope = calculateScenarioEnvelope(state.project, sampleData.costs, sampleData.plans);
  const context = currentCostContext();
  const selectedLabel = context.selected ? `已按「${context.selected.name}」更新` : '覆盖全部候选方案';
  $('#costSummary').innerHTML = [
    ['工程造价区间', `${Math.round(context.range.low)}-${Math.round(context.range.high)} 万`, selectedLabel],
    ['预算上限', formatWan(state.project.budget), '来自客户项目资料'],
    ['候选方案投入', `${envelope.investment.low}-${envelope.investment.high} 万`, '三条路径总体边界'],
    ['知识库版本', sampleData.knowledge.version, '受控发布快照'],
  ].map(([label, value, note]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');

  const planRanges = sampleData.plans.map((plan) => calculateCostRange(state.project, sampleData.costs, plan));
  $('#costRows').innerHTML = sampleData.costs.map((item, index) => {
    const low = context.selected ? context.range.rows[index].low : Math.min(...planRanges.map((range) => range.rows[index].low));
    const high = context.selected ? context.range.rows[index].high : Math.max(...planRanges.map((range) => range.rows[index].high));
    return `<tr><td><strong>${escapeHtml(item.category)}</strong></td><td>${item.quantity.toLocaleString('zh-CN')} ${escapeHtml(item.unit)}</td><td>${Math.round(low)}-${Math.round(high)} 万</td><td>${escapeHtml(item.material)}<br><span>替代：${escapeHtml(item.alternative)}</span></td></tr>`;
  }).join('');
}

function renderInvestment() {
  const metrics = calculateInvestmentSandbox(state.investmentSandbox);
  const mix = buildSandboxRevenueMix(metrics.inputs);
  state.investmentSandbox = { ...metrics.inputs };
  const controls = [
    ['#sandboxBudget', '#sandboxBudgetValue', 'budget', (value) => `${value} 万`],
    ['#sandboxTicketPrice', '#sandboxTicketPriceValue', 'ticketPrice', (value) => `${value} 元`],
    ['#sandboxVacancy', '#sandboxVacancyValue', 'vacancy', (value) => `${value}%`],
  ];
  controls.forEach(([inputSelector, outputSelector, key, formatter]) => {
    const input = $(inputSelector);
    const value = metrics.inputs[key];
    input.value = String(value);
    input.style.setProperty('--range-progress', `${(value - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100}%`);
    $(outputSelector).textContent = formatter(value);
  });
  if (state.currentStep === 5) {
    window.requestAnimationFrame(() => investmentSandboxView.render({
      metrics,
      mix,
      elements: {
        totalInvestment: $('#totalInvestmentKpi'),
        annualNetCashFlow: $('#annualNetCashFlowKpi'),
        paybackYears: $('#paybackKpi'),
        roi5: $('#roi5Kpi'),
        revenueMix: $('#revenueMix'),
        revenueLegend: $('#revenueLegend'),
      },
    }));
  }
}

function renderPlans() {
  const plans = state.analysisResult?.scenarios ?? sampleData.plans.map((plan) => ({ ...plan, evidence: sampleData.evidence.filter((item) => plan.evidence.includes(item.id)) }));
  $('#planCards').innerHTML = plans.map((plan) => `<button class="plan-card" type="button" data-plan-id="${plan.id}" aria-pressed="${plan.id === state.selectedPlanId}">
    <span class="plan-duration">${escapeHtml(plan.duration)}</span><h3>${escapeHtml(plan.name)}</h3><p>${escapeHtml(plan.summary)}</p>
    <div class="plan-metrics"><div><span>预计投入</span><strong>${formatWan(plan.capex)}</strong></div><div><span>年化收入</span><strong>${formatWan(plan.revenue)}</strong></div><div><span>回本周期</span><strong>${plan.payback} 年</strong></div><div><span>5 年 ROI</span><strong>${formatPercent(plan.roi5)}</strong></div></div>
    <div class="evidence-summary"><strong>分析依据</strong>${evidenceTags(plan.evidence)}</div>
    <p><strong>主要风险：</strong>${escapeHtml(plan.risk)}</p>
  </button>`).join('');
  const selected = getSelectedPlan(sampleData, state.selectedPlanId);
  $('#planSelectionStatus').textContent = selected ? `已暂选：${selected.name}` : '尚未选择';
  $('#planSelectionStatus').classList.toggle('is-good', Boolean(selected));
  $('#confirmPlanButton').disabled = !selected;
}

function renderVisual() {
  const plan = getSelectedPlan(sampleData, state.selectedPlanId);
  if (!plan) return;
  visualDeepeningView.render({
    plan,
    costRange: calculateCostRange(state.project, sampleData.costs, plan),
    visualState: {
      mode: state.visualMode,
      split: state.visualSplit,
      selectedBudgetId: state.selectedVisualBudgetId,
    },
    elements: getVisualElements(),
  });
}

function buildReport() {
  const plan = getSelectedPlan(sampleData, state.selectedPlanId);
  if (!plan) return '<p>请选择并确认方案后生成报告。</p>';
  const cost = calculateCostRange(state.project, sampleData.costs, plan);
  const run = state.analysisResult?.run ?? {
    knowledgeVersion: sampleData.knowledge.version,
    ruleVersion: sampleData.knowledge.ruleVersion,
    modelVersion: sampleData.knowledge.modelVersion,
  };
  const diagnostics = state.analysisResult?.diagnostics ?? [];
  return `<header class="report-cover"><p class="eyebrow">城更智算舱 · 投前决策成果</p><h2>${escapeHtml(state.project.name)}<br>投前综合分析报告</h2><div class="report-meta"><span>${escapeHtml(state.project.location)}</span><span>${escapeHtml(state.project.organization || '项目单位待补充')}</span><span>生成日期：2026-06-12</span></div></header>
    <section class="report-section"><h3>一、项目概况</h3><p>${escapeHtml(state.project.description || '暂无补充说明')}</p><ul class="report-list"><li>项目类型：${escapeHtml(state.project.type)}</li><li>项目规模：${Number(state.project.area).toLocaleString('zh-CN')} ㎡</li><li>预算上限：${formatWan(state.project.budget)}</li><li>风格方向：${escapeHtml(state.project.stylePreference)}</li></ul></section>
    <section class="report-section"><h3>二、核心判断</h3><ul class="report-list">${diagnostics.map((item) => `<li><strong>${escapeHtml(item.label)}：</strong>${escapeHtml(item.summary)} 人工复核：${escapeHtml(item.reviewNote)}</li>`).join('')}</ul></section>
    <section class="report-section"><h3>三、确认方案与测算</h3><p>客户确认采用「${escapeHtml(plan.name)}」作为后续深化方向。${escapeHtml(plan.summary)}</p><div class="report-kpis"><div><span>预计投入</span><strong>${formatWan(plan.capex)}</strong></div><div><span>工程造价</span><strong>${Math.round(cost.low)}-${Math.round(cost.high)} 万</strong></div><div><span>年化收入</span><strong>${formatWan(plan.revenue)}</strong></div><div><span>回本周期</span><strong>${plan.payback} 年</strong></div></div></section>
    <section class="report-section"><h3>四、分析依据</h3><div class="report-evidence">${sampleData.evidence.map((source) => `<article><strong>${escapeHtml(source.category)} · ${source.count} 条</strong><p>${escapeHtml(source.summary)}</p><p>版本 ${escapeHtml(source.version)}</p></article>`).join('')}</div></section>
    <section class="report-section"><h3>五、风险与成果边界</h3><ul class="report-list">${sampleData.risks.map(([label, level, action]) => `<li>${escapeHtml(label)}（${escapeHtml(level)}）：${escapeHtml(action)}</li>`).join('')}<li>视觉内容为概念级投前沟通材料，不作为施工图、报批图或最终投资承诺。</li><li>客户资料默认项目隔离，不自动进入集团案例库，也不用于模型训练。</li></ul></section>
    <footer class="report-section"><h3>版本记录</h3><p>集团知识库 ${escapeHtml(run.knowledgeVersion)} · 规则版本 ${escapeHtml(run.ruleVersion)} · 模型版本 ${escapeHtml(run.modelVersion)}。本报告可按上述快照复现，关键结论仍需专业团队人工复核。</p></footer>`;
}

function renderReport() {
  $('#reportDocument').innerHTML = buildReport();
}

function renderActions() {
  const previous = $('#previousStepButton');
  const next = $('#nextStepButton');
  previous.disabled = state.currentStep === 1;
  next.hidden = false;
  const hints = {
    1: state.importStatus === 'parsed' ? '模板已读取，可以继续校对' : '上传模板后可继续',
    2: state.intakeConfirmed ? '项目数据已确认' : '确认数据后开始分析',
    3: state.analysisRun?.status === 'completed' ? '分析已完成，可以查看造价' : '等待综合分析完成',
    4: '查看完工程区间后继续', 5: '查看完投资测算后继续',
    6: state.completedSteps.includes(6) ? '方案已确认' : '确认一个方案后继续',
    7: '确认视觉方向后生成报告', 8: '报告可通过浏览器保存为 PDF',
  };
  $('#actionHint').textContent = hints[state.currentStep];
  const disabled = (state.currentStep === 1 && state.importStatus !== 'parsed')
    || (state.currentStep === 2 && !state.intakeConfirmed)
    || (state.currentStep === 3 && state.analysisRun?.status !== 'completed')
    || (state.currentStep === 6 && !state.completedSteps.includes(6));
  next.disabled = disabled;
  next.textContent = state.currentStep === 8 ? '打印 / 保存 PDF' : '保存并继续';
}

function renderAll() {
  renderStepper();
  renderHeader();
  renderFileState();
  renderSources();
  if (state.currentStep === 2) renderCorrectionForm();
  renderAnalysisProgress();
  renderDiagnostics();
  renderCost();
  renderInvestment();
  renderPlans();
  renderVisual();
  renderReport();
  renderActions();
}

function goToStep(step) {
  clearMessage();
  if (!canEnterStep(step, state)) {
    showMessage('请先完成当前步骤，再继续后续分析。');
    return;
  }
  state.currentStep = step;
  persistState();
  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function runAnalysis() {
  state.currentStep = 3;
  state.analysisRun = { status: 'running' };
  state.analysisResult = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (let stage = 1; stage <= 4; stage += 1) {
    state.analysisStage = stage;
    renderAll();
    if (!reducedMotion) await new Promise((resolve) => window.setTimeout(resolve, 180));
  }
  try {
    state.analysisResult = await provider.analyze(state.project);
    state.analysisRun = state.analysisResult.run;
    state.analysisStage = 4;
    showToast('综合分析已完成');
  } catch {
    state.analysisRun = { status: 'failed' };
    showMessage('AI 分析暂时不可用，已保留规则测算结果，请稍后重试或由专业团队复核。');
  }
  persistState();
  renderAll();
}

async function handleWorkbook(file) {
  clearMessage();
  state.importStatus = 'parsing';
  try {
    const project = await parseWorkbook(file);
    state.project = { ...createInitialState().project, ...project };
    state.workbookFileName = file.name;
    state.workbookIssues = validateProject(state.project);
    state.importStatus = 'parsed';
    state.intakeConfirmed = false;
    state.selectedPlanId = null;
    state.completedSteps = [];
    state.analysisResult = null;
    state.analysisRun = null;
    markComplete(1);
    persistState();
    showToast('Excel 已解析，请校对项目数据');
    goToStep(2);
  } catch (error) {
    state.importStatus = 'error';
    showMessage(error.message || 'Excel 解析失败，请重新下载模板填写。');
    renderAll();
  }
}

function useSampleProject() {
  state.project = { ...sampleData.project };
  state.workbookFileName = '演示项目数据';
  state.workbookIssues = [];
  state.importStatus = 'parsed';
  state.intakeConfirmed = false;
  state.selectedPlanId = null;
  state.completedSteps = [1];
  state.analysisResult = null;
  state.analysisRun = null;
  persistState();
  goToStep(2);
  showToast('已载入演示项目');
}

async function confirmIntake() {
  state.workbookIssues = validateProject(state.project);
  renderCorrectionForm();
  if (state.workbookIssues.length) {
    showMessage('仍有项目数据需要校对，请处理标记字段。');
    $('#projectCorrectionForm').querySelector('.has-error input, .has-error select, .has-error textarea')?.focus();
    return;
  }
  state.intakeConfirmed = true;
  markComplete(1);
  markComplete(2);
  persistState();
  await runAnalysis();
}

function confirmPlan() {
  const plan = getSelectedPlan(sampleData, state.selectedPlanId);
  if (!plan) return;
  markComplete(6);
  persistState();
  renderAll();
  showToast(`已确认「${plan.name}」，下游成果已同步更新`);
}

function handleNext() {
  if (state.currentStep === 8) {
    window.print();
    return;
  }
  if (state.currentStep === 2 && !state.intakeConfirmed) {
    confirmIntake();
    return;
  }
  if (state.currentStep === 6 && !state.completedSteps.includes(6)) {
    showMessage('请先选择并确认一个方案。');
    return;
  }
  markComplete(state.currentStep);
  goToStep(state.currentStep + 1);
}

function bindEvents() {
  $('#workbookInput').addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (file) handleWorkbook(file);
  });
  $('#useSampleButton').addEventListener('click', useSampleProject);
  $('#confirmIntakeButton').addEventListener('click', confirmIntake);
  $('#previousStepButton').addEventListener('click', () => goToStep(Math.max(1, state.currentStep - 1)));
  $('#nextStepButton').addEventListener('click', handleNext);
  $('#printReportButton').addEventListener('click', () => window.print());

  $('.stepper').addEventListener('click', (event) => {
    const button = event.target.closest('.step-button');
    if (button) goToStep(Number(button.dataset.step));
  });

  $('#projectCorrectionForm').addEventListener('input', (event) => {
    const field = FIELD_DEFINITIONS.find((item) => item.key === event.target.name);
    if (!field) return;
    state.project[field.key] = field.type === 'number' ? Number(event.target.value) : event.target.value;
    if (field.key === 'name') state.project.district = event.target.value;
    state.workbookIssues = validateProject(state.project);
    Object.assign(state, invalidateProjectDependentState(state));
    persistState();
    updateValidationSummary();
  });

  $('#planCards').addEventListener('click', (event) => {
    const card = event.target.closest('[data-plan-id]');
    if (!card) return;
    state.selectedPlanId = card.dataset.planId;
    state.completedSteps = state.completedSteps.filter((step) => step < 6);
    persistState();
    renderAll();
  });
  $('#investmentSandbox').addEventListener('input', (event) => {
    if (!event.target.matches('input[type="range"]')) return;
    state.investmentSandbox = {
      ...state.investmentSandbox,
      [event.target.name]: Number(event.target.value),
    };
    persistState();
    renderInvestment();
  });
  $('#confirmPlanButton').addEventListener('click', confirmPlan);

  visualDeepeningView.bind({
    elements: getVisualElements(),
    onStateChange(action) {
      const nextVisualState = reduceVisualState({
        mode: state.visualMode,
        split: state.visualSplit,
        selectedBudgetId: state.selectedVisualBudgetId,
      }, action);
      state.visualMode = nextVisualState.mode;
      state.visualSplit = nextVisualState.split;
      state.selectedVisualBudgetId = nextVisualState.selectedBudgetId;
      persistState();
      renderVisual();
    },
  });

  $('#resetDraftButton').addEventListener('click', () => {
    if (!window.confirm('确定清除当前项目草稿并重新开始吗？')) return;
    clearDraft();
    window.location.reload();
  });
  window.addEventListener('resize', () => {
    diagnosticView.resize();
    investmentSandboxView.resize();
  });
}

if (state.currentStep > 1 && !canEnterStep(state.currentStep, state)) state.currentStep = 1;
bindEvents();
renderAll();
