const DEFAULT_STATE = {
  bandwidth: 50,
  mode: 'convergent',
  horizon: 'long',
  stakes: 'casual'
};

const MODE_VALUES = new Set(['convergent', 'divergent']);
const HORIZON_VALUES = new Set(['now', 'long']);
const STAKES_VALUES = new Set(['critical', 'casual']);

function clampBandwidth(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_STATE.bandwidth;
  if (num < 0) return 0;
  if (num > 100) return 100;
  return Math.round(num);
}

export function canonicalizeState(input = {}) {
  const merged = {
    ...DEFAULT_STATE,
    ...(input && typeof input === 'object' ? input : {})
  };
  return {
    bandwidth: clampBandwidth(merged.bandwidth),
    mode: MODE_VALUES.has(merged.mode) ? merged.mode : DEFAULT_STATE.mode,
    horizon: HORIZON_VALUES.has(merged.horizon) ? merged.horizon : DEFAULT_STATE.horizon,
    stakes: STAKES_VALUES.has(merged.stakes) ? merged.stakes : DEFAULT_STATE.stakes
  };
}

export function applyStateDelta(currentState = DEFAULT_STATE, token = '') {
  const next = canonicalizeState(currentState);
  const normalized = String(token || '').trim();

  if (normalized.startsWith('STATE:bandwidth')) {
    const match = normalized.match(/^STATE:bandwidth(\d{1,3})$/);
    if (match) next.bandwidth = clampBandwidth(Number(match[1]));
    return canonicalizeState(next);
  }

  const mapping = {
    'STATE:mode_convergent': { key: 'mode', value: 'convergent' },
    'STATE:mode_divergent': { key: 'mode', value: 'divergent' },
    'STATE:horizon_now': { key: 'horizon', value: 'now' },
    'STATE:horizon_long': { key: 'horizon', value: 'long' },
    'STATE:stakes_critical': { key: 'stakes', value: 'critical' },
    'STATE:stakes_casual': { key: 'stakes', value: 'casual' }
  };

  const mapped = mapping[normalized];
  if (mapped) {
    next[mapped.key] = mapped.value;
  }

  return canonicalizeState(next);
}

export function mergeStateDeltas(currentState = DEFAULT_STATE, deltas = []) {
  const list = Array.isArray(deltas) ? deltas : [deltas];
  return list.reduce((acc, token) => applyStateDelta(acc, token), canonicalizeState(currentState));
}

export function formatStateSegment(input = {}) {
  const state = canonicalizeState(input);
  return `STATE:bandwidth${state.bandwidth},mode:${state.mode},horizon:${state.horizon},stakes:${state.stakes}`;
}

export function parseStateSegment(segment = '') {
  const value = String(segment || '').trim();
  const canonicalMatch = value.match(/^STATE:bandwidth(\d{1,3}),mode:(convergent|divergent),horizon:(now|long),stakes:(critical|casual)$/);
  if (canonicalMatch) {
    return canonicalizeState({
      bandwidth: Number(canonicalMatch[1]),
      mode: canonicalMatch[2],
      horizon: canonicalMatch[3],
      stakes: canonicalMatch[4]
    });
  }

  const deltaState = applyStateDelta(DEFAULT_STATE, value);
  if (value.startsWith('STATE:mode_') || value.startsWith('STATE:horizon_') || value.startsWith('STATE:stakes_') || value.startsWith('STATE:bandwidth')) {
    return deltaState;
  }

  return canonicalizeState(DEFAULT_STATE);
}

export { DEFAULT_STATE };
