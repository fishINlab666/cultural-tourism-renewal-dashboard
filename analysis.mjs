import { FIELD_DEFINITIONS } from './data.mjs';

/**
 * @typedef {Object} EvidenceReference
 * @property {string} id
 * @property {string} category
 * @property {number} count
 * @property {string} version
 * @property {string} summary
 */

/**
 * @typedef {Object} AnalysisRun
 * @property {string} id
 * @property {'completed'|'failed'} status
 * @property {string} knowledgeVersion
 * @property {string} ruleVersion
 * @property {string} modelVersion
 * @property {string} completedAt
 */

/**
 * @typedef {Object} DiagnosticResult
 * @property {string} label
 * @property {number} value
 * @property {string} summary
 * @property {EvidenceReference[]} evidence
 * @property {string} reviewNote
 */

/**
 * @typedef {Object} ScenarioResult
 * @property {string} id
 * @property {string} name
 * @property {EvidenceReference[]} evidence
 */

export function validateProject(project) {
  const issues = [];
  const add = (field, message) => issues.push({ field, message });
  const enumFields = new Map(FIELD_DEFINITIONS.filter((field) => field.options).map((field) => [field.key, field.options]));
  const validateText = (field) => {
    const value = String(project[field] ?? '').trim();
    if (!value) add(field, '请补充必填内容');
    else if (enumFields.has(field) && !enumFields.get(field).includes(value)) add(field, '请使用模板中的标准选项');
  };
  const validateNumber = (field, min, max, message) => {
    const raw = project[field];
    if (raw === '' || raw === null || raw === undefined || !Number.isFinite(Number(raw)) || Number(raw) < min || Number(raw) > max) add(field, message);
  };

  validateText('name');
  validateText('type');
  validateText('location');
  validateNumber('area', 50, 500000, '面积需在 50-500000 ㎡之间');
  validateNumber('vacancy', 0, 100, '空置率需在 0-100% 之间');
  validateText('heritage');
  validateNumber('budget', 50, 100000, '预算需在 50-100000 万元之间');
  validateNumber('paybackTarget', 0.5, 20, '目标回本周期需在 0.5-20 年之间');
  validateText('audience');
  validateText('stylePreference');

  return issues;
}

export function calculateCostRange(project, costs, plan) {
  const verificationFactor = project.heritage.includes('文保') || project.heritage.includes('历史文化街区') ? 1.18 : 1.06;
  const deviceFactor = project.type.includes('更新') || project.type.includes('街区') || project.type.includes('古建') ? 1.12 : 1;
  const reserveFactor = 1.08;
  const multiplier = plan?.costMultiplier ?? 1;

  const rows = costs.map((item) => {
    const low = item.quantity * item.unitLow * verificationFactor * deviceFactor * reserveFactor * multiplier / 10000;
    const high = item.quantity * item.unitHigh * verificationFactor * deviceFactor * reserveFactor * multiplier / 10000;
    return { ...item, low, high };
  });

  return {
    rows,
    low: rows.reduce((sum, row) => sum + row.low, 0),
    high: rows.reduce((sum, row) => sum + row.high, 0),
  };
}

export function calculateScenarioEnvelope(project, costs, plans) {
  const ranges = plans.map((plan) => calculateCostRange(project, costs, plan));
  return {
    cost: {
      low: Math.min(...ranges.map((range) => range.low)),
      high: Math.max(...ranges.map((range) => range.high)),
    },
    investment: {
      low: Math.min(...plans.map((plan) => plan.capex)),
      high: Math.max(...plans.map((plan) => plan.capex)),
    },
    revenue: {
      low: Math.min(...plans.map((plan) => plan.revenue)),
      high: Math.max(...plans.map((plan) => plan.revenue)),
    },
    cash: {
      low: Math.min(...plans.map((plan) => plan.netCash)),
      high: Math.max(...plans.map((plan) => plan.netCash)),
    },
    payback: {
      low: Math.min(...plans.map((plan) => plan.payback)),
      high: Math.max(...plans.map((plan) => plan.payback)),
    },
  };
}

export function canEnterStep(step, state) {
  if (step === 1) return true;
  if (step === 2) return state.importStatus === 'parsed' || state.completedSteps.includes(1);
  if (!state.intakeConfirmed) return false;
  if (step === 3) return true;
  if (step <= 6) return state.completedSteps.includes(step - 1);
  if (!state.selectedPlanId || !state.completedSteps.includes(6)) return false;
  if (step === 7) return true;
  return state.completedSteps.includes(7);
}

export function invalidateProjectDependentState(state) {
  return {
    ...state,
    intakeConfirmed: false,
    completedSteps: state.completedSteps.includes(1) ? [1] : [],
    selectedPlanId: null,
    analysisRun: null,
    analysisResult: null,
  };
}

function makeRun(knowledge) {
  return {
    id: `analysis-${Date.now()}`,
    status: 'completed',
    knowledgeVersion: knowledge.version,
    ruleVersion: knowledge.ruleVersion,
    modelVersion: knowledge.modelVersion,
    completedAt: new Date().toISOString(),
  };
}

export class LocalAnalysisProvider {
  constructor(data) {
    this.data = data;
  }

  async analyze(project) {
    const evidenceById = new Map(this.data.evidence.map((item) => [item.id, item]));
    const resolveEvidence = (ids) => ids.map((id) => evidenceById.get(id)).filter(Boolean);

    return {
      run: makeRun(this.data.knowledge),
      project: { ...project },
      diagnostics: this.data.diagnostics.map((item) => ({ ...item, evidence: resolveEvidence(item.evidence) })),
      overview: {
        ...this.data.overview,
        map: { ...this.data.overview.map, center: [...this.data.overview.map.center] },
        conclusions: this.data.overview.conclusions.map((item) => ({ ...item })),
      },
      scenarios: this.data.plans.map((plan) => ({ ...plan, evidence: resolveEvidence(plan.evidence) })),
      evidence: this.data.evidence.map((item) => ({ ...item })),
      fallback: false,
    };
  }
}

export class RemoteAnalysisProvider {
  constructor(transport) {
    this.transport = transport;
  }

  async analyze(project) {
    if (typeof this.transport !== 'function') throw new Error('远程分析服务尚未配置');
    return this.transport({ project });
  }
}

export function getSelectedPlan(data, selectedPlanId) {
  return data.plans.find((plan) => plan.id === selectedPlanId) ?? null;
}
