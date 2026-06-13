export const STORAGE_KEY = 'urban-renewal-workflow-draft-v1';

function getDefaultStorage(storage) {
  if (storage) return storage;
  return typeof localStorage === 'undefined' ? null : localStorage;
}

export function saveDraft(state, storage) {
  const target = getDefaultStorage(storage);
  if (!target) return;
  const safeDraft = {
    schemaVersion: 1,
    currentStep: state.currentStep,
    completedSteps: [...(state.completedSteps ?? [])],
    intakeConfirmed: Boolean(state.intakeConfirmed),
    importStatus: state.importStatus,
    workbookFileName: state.workbookFileName,
    workbookIssues: [...(state.workbookIssues ?? [])],
    selectedPlanId: state.selectedPlanId,
    visualMode: state.visualMode,
    analysisRun: state.analysisRun,
    analysisResult: state.analysisResult,
    project: { ...state.project },
  };
  target.setItem(STORAGE_KEY, JSON.stringify(safeDraft));
}

export function loadDraft(storage) {
  const target = getDefaultStorage(storage);
  if (!target) return null;
  try {
    const parsed = JSON.parse(target.getItem(STORAGE_KEY));
    return parsed?.schemaVersion === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDraft(storage) {
  getDefaultStorage(storage)?.removeItem(STORAGE_KEY);
}
