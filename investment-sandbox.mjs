export const DEFAULT_INVESTMENT_SANDBOX = Object.freeze({
  budget: 860,
  ticketPrice: 80,
  vacancy: 40,
});

const INPUT_LIMITS = {
  budget: [300, 1000],
  ticketPrice: [40, 120],
  vacancy: [10, 60],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
const roundOne = (value) => Math.round(value * 10) / 10;

export function normalizeSandboxInputs(inputs = {}) {
  return Object.fromEntries(Object.entries(INPUT_LIMITS).map(([key, [min, max]]) => [
    key,
    clamp(inputs[key] ?? DEFAULT_INVESTMENT_SANDBOX[key], min, max),
  ]));
}

export function calculateInvestmentSandbox(inputs = {}) {
  const normalized = normalizeSandboxInputs(inputs);
  const operatingRate = 1 - normalized.vacancy / 100;
  const totalInvestmentRaw = normalized.budget * (0.84 + normalized.vacancy * 0.0015);
  const annualRevenue = normalized.ticketPrice * 105000 * operatingRate / 10000 + normalized.budget * 0.05;
  const annualOperatingCost = totalInvestmentRaw * 0.22 + normalized.vacancy * 1.4;
  const annualNetCashFlowRaw = Math.max(1, annualRevenue - annualOperatingCost);
  const paybackYearsRaw = totalInvestmentRaw / annualNetCashFlowRaw;
  const roi5Raw = (annualNetCashFlowRaw * 5 - totalInvestmentRaw) / totalInvestmentRaw * 100;

  return {
    inputs: normalized,
    totalInvestment: Math.round(totalInvestmentRaw),
    annualNetCashFlow: Math.round(annualNetCashFlowRaw),
    paybackYears: roundOne(paybackYearsRaw),
    roi5: Math.round(roi5Raw),
  };
}

export function buildSandboxRevenueMix(inputs = {}) {
  const normalized = normalizeSandboxInputs(inputs);
  const ticket = Math.round(28 + (normalized.ticketPrice - 40) * 0.2);
  const space = Math.round(32 + (60 - normalized.vacancy) * 0.15);
  const activity = 18;
  const retail = 100 - ticket - space - activity;

  return [
    { name: '门票体验', value: ticket },
    { name: '空间经营', value: space },
    { name: '活动研学', value: activity },
    { name: '文创商业', value: retail },
  ];
}
