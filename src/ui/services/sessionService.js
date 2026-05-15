// sessionService.js
const STORAGE_KEY = 'pctx_inprogress_v1';

export function saveProgress(moduleName, data) {
  try {
    const now = new Date().toISOString();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    stored.modules = stored.modules || {};
    stored.modules[moduleName] = Object.assign({}, stored.modules[moduleName] || {}, {
      responses: data.responses || stored.modules[moduleName]?.responses || [],
      current: typeof data.current === 'number' ? data.current : stored.modules[moduleName]?.current || 0,
      last_updated: now,
      completed: !!(data.responses && Array.isArray(data.responses) && data.responses.length >= (data.expectedLength || 50))
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

export default { saveProgress, loadProgress, hasSaved, clearProgress };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { saveProgress, loadProgress, hasSaved, clearProgress };
}