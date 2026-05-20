// sessionService.js
const STORAGE_KEY = 'iam_inprogress_v1';
const BASE_CONTEXT_KEY = 'iam_base_context_v1';

function normalizeResponseValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (numeric < 0 || numeric > 5) return null;
  return numeric;
}

export function countAnsweredResponses(responses) {
  if (!Array.isArray(responses)) return 0;
  return responses.filter((value) => normalizeResponseValue(value) !== null).length;
}

function resolveExpectedLength(moduleName, data, existingModule) {
  if (typeof data.expectedLength === 'number' && data.expectedLength > 0) return data.expectedLength;
  if (typeof existingModule?.expectedLength === 'number' && existingModule.expectedLength > 0) return existingModule.expectedLength;
  if (moduleName === 'ipip') return 50;
  if (Array.isArray(data.responses) && data.responses.length > 0) return data.responses.length;
  if (Array.isArray(existingModule?.responses) && existingModule.responses.length > 0) return existingModule.responses.length;
  return 0;
}

function normalizeTestAnswers(value) {
  if (!value || typeof value !== 'object') return null;
  const out = {};
  for (const [indexKey, item] of Object.entries(value)) {
    if (!item || typeof item !== 'object') continue;
    out[indexKey] = {
      interview_defense: Boolean(item.interview_defense),
      day_one_autonomy: Boolean(item.day_one_autonomy),
      relevance_recency: Boolean(item.relevance_recency)
    };
  }
  return out;
}

function normalizeStatePayload(value) {
  if (!value || typeof value !== 'object') return null;
  const bandwidth = Number(value.bandwidth);
  return {
    bandwidth: Number.isFinite(bandwidth) ? Math.max(0, Math.min(100, Math.round(bandwidth))) : 50,
    mode: value.mode === 'divergent' ? 'divergent' : 'convergent',
    horizon: value.horizon === 'now' ? 'now' : 'long',
    stakes: value.stakes === 'critical' ? 'critical' : 'casual'
  };
}

export function isModuleCompleted(moduleName, moduleData) {
  if (!moduleData || typeof moduleData !== 'object') return false;
  const answered = countAnsweredResponses(moduleData.responses);
  const expectedLength = resolveExpectedLength(moduleName, moduleData, null);
  if (moduleData.completed === true && expectedLength > 0) {
    return answered >= expectedLength;
  }
  return expectedLength > 0 && answered >= expectedLength;
}

export function saveProgress(moduleName, data) {
  try {
    const now = new Date().toISOString();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    stored.modules = stored.modules || {};
    const existingModule = stored.modules[moduleName] || {};
    const sourceResponses = data.responses || existingModule.responses || [];
    const nextResponses = Array.isArray(sourceResponses)
      ? sourceResponses.map((entry) => normalizeResponseValue(entry))
      : [];
    const expectedLength = resolveExpectedLength(moduleName, data, existingModule);
    const answered = countAnsweredResponses(nextResponses);
    const explicitComplete = data.completed === true;
    const normalizedTestAnswers = normalizeTestAnswers(data.testAnswers);
    const fallbackTestAnswers = normalizeTestAnswers(existingModule.testAnswers);
    const normalizedState = normalizeStatePayload(data.state);
    const fallbackState = normalizeStatePayload(existingModule.state);
    stored.modules[moduleName] = Object.assign({}, stored.modules[moduleName] || {}, {
      responses: nextResponses,
      ...(normalizedTestAnswers || fallbackTestAnswers ? { testAnswers: normalizedTestAnswers || fallbackTestAnswers } : {}),
      ...(normalizedState || fallbackState ? { state: normalizedState || fallbackState } : {}),
      current: typeof data.current === 'number' ? data.current : existingModule.current || 0,
      expectedLength,
      answered,
      last_updated: now,
      completed: explicitComplete || (expectedLength > 0 && answered >= expectedLength)
    });
    stored.updated_at = now;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return true;
  } catch (e) {
    // ignore storage errors
    return false;
  }
}

export function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return stored || null;
  } catch (e) {
    return null;
  }
}

export function hasSaved() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return !!(stored && stored.modules && Object.keys(stored.modules).length > 0);
  } catch (e) {
    return false;
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

export function saveBaseContext(baseContext) {
  try {
    const payload = baseContext && typeof baseContext === 'object' ? baseContext : {};
    localStorage.setItem(BASE_CONTEXT_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadBaseContext() {
  try {
    const raw = localStorage.getItem(BASE_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearBaseContext() {
  try {
    localStorage.removeItem(BASE_CONTEXT_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

export default {
  saveProgress,
  loadProgress,
  hasSaved,
  clearProgress,
  countAnsweredResponses,
  isModuleCompleted,
  saveBaseContext,
  loadBaseContext,
  clearBaseContext
};

