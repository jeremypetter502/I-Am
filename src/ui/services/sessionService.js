// sessionService.js
const STORAGE_KEY = 'iam_inprogress_v1';
const BASE_CONTEXT_KEY = 'iam_base_context_v1';

function normalizeResponseValue(value) {
  const rawValue = (value && typeof value === 'object' && !Array.isArray(value))
    ? (value.raw_score ?? value.score ?? value.value)
    : value;
  if (rawValue === null || rawValue === undefined || rawValue === '') return null;
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) return null;
  if (numeric < 1 || numeric > 10) return null;
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
  if (moduleName === 'delivery') return 30;
  if (moduleName === 'delivery2') return 24;
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
    stakes: value.stakes === 'critical' ? 'critical' : 'casual',
    humor: value.humor === 'none' || value.humor === 'low' || value.humor === 'normal' || value.humor === 'high' ? value.humor : 'normal',
    domain: value.domain === 'home' ? 'home' : 'work'
  };
}

function normalizeDisabledFlag(value) {
  return value === true;
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
    const disabled = data.disabled === undefined
      ? normalizeDisabledFlag(existingModule.disabled)
      : normalizeDisabledFlag(data.disabled);
    const hasIncomingNote = typeof data.note === 'string';
    const normalizedIncomingNote = hasIncomingNote ? String(data.note).trim() : undefined;
    const nextModule = Object.assign({}, stored.modules[moduleName] || {}, {
      responses: nextResponses,
      ...(normalizedTestAnswers || fallbackTestAnswers ? { testAnswers: normalizedTestAnswers || fallbackTestAnswers } : {}),
      ...(normalizedState || fallbackState ? { state: normalizedState || fallbackState } : {}),
      disabled,
      current: typeof data.current === 'number' ? data.current : existingModule.current || 0,
      expectedLength,
      answered,
      last_updated: now,
      completed: explicitComplete || (expectedLength > 0 && answered >= expectedLength)
    });
    if (hasIncomingNote) {
      if (normalizedIncomingNote) {
        nextModule.note = normalizedIncomingNote;
      } else {
        delete nextModule.note;
      }
    }
    stored.modules[moduleName] = nextModule;
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

export function clearModuleProgress(moduleName) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!stored.modules || typeof stored.modules !== 'object' || !stored.modules[moduleName]) return true;
    const existingModule = stored.modules[moduleName];
    const nextModule = {
      ...existingModule,
      responses: [],
      current: 0,
      answered: 0,
      completed: false,
      last_updated: new Date().toISOString()
    };
    if (moduleName === 'skills') {
      nextModule.testAnswers = {};
    }
    if (moduleName === 'state') {
      nextModule.state = normalizeStatePayload(existingModule.state);
    }
    stored.modules[moduleName] = nextModule;
    stored.updated_at = nextModule.last_updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
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
  clearModuleProgress,
  countAnsweredResponses,
  isModuleCompleted,
  saveBaseContext,
  loadBaseContext,
  clearBaseContext
};

