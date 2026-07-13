export type StateMode = 'convergent' | 'divergent';
export type StateHorizon = 'now' | 'long';
export type StateStakes = 'critical' | 'casual';
export type StateHumor = 'none' | 'low' | 'normal' | 'high';
export type StateDomain = 'work' | 'home';

export interface UserState {
  bandwidth: number;
  mode: StateMode;
  horizon: StateHorizon;
  stakes: StateStakes;
  humor: StateHumor;
  domain?: StateDomain;
}

export const DEFAULT_STATE: UserState = {
  bandwidth: 50,
  mode: 'convergent',
  horizon: 'long',
  stakes: 'casual',
  humor: 'normal'
  ,domain: 'work'
};

const MODE_VALUES = new Set<StateMode>(['convergent', 'divergent']);
const HORIZON_VALUES = new Set<StateHorizon>(['now', 'long']);
const STAKES_VALUES = new Set<StateStakes>(['critical', 'casual']);
const HUMOR_VALUES = new Set<StateHumor>(['none', 'low', 'normal', 'high']);
const DOMAIN_VALUES = new Set<StateDomain>(['work', 'home']);

function clampBandwidth(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_STATE.bandwidth;
  if (num < 0) return 0;
  if (num > 100) return 100;
  return Math.round(num);
}

export function canonicalizeState(input: Partial<UserState> | null | undefined = {}): UserState {
  const merged = {
    ...DEFAULT_STATE,
    ...(input && typeof input === 'object' ? input : {})
  };
  return {
    bandwidth: clampBandwidth(merged.bandwidth),
    mode: MODE_VALUES.has(merged.mode as StateMode) ? (merged.mode as StateMode) : DEFAULT_STATE.mode,
    horizon: HORIZON_VALUES.has(merged.horizon as StateHorizon) ? (merged.horizon as StateHorizon) : DEFAULT_STATE.horizon,
    stakes: STAKES_VALUES.has(merged.stakes as StateStakes) ? (merged.stakes as StateStakes) : DEFAULT_STATE.stakes
    ,humor: HUMOR_VALUES.has(merged.humor as StateHumor) ? (merged.humor as StateHumor) : DEFAULT_STATE.humor
    ,domain: DOMAIN_VALUES.has(merged.domain as StateDomain) ? (merged.domain as StateDomain) : DEFAULT_STATE.domain
  };
}

export function applyStateDelta(currentState: Partial<UserState> | null | undefined = DEFAULT_STATE, token = ''): UserState {
  const next = canonicalizeState(currentState);
  const normalized = String(token || '').trim();

  if (normalized.startsWith('STATE:bandwidth')) {
    const match = normalized.match(/^STATE:bandwidth(\d{1,3})$/);
    if (match) next.bandwidth = clampBandwidth(Number(match[1]));
    return canonicalizeState(next);
  }

  const mapping: Record<string, { key: keyof UserState; value: StateMode | StateHorizon | StateStakes | StateHumor }> = {
    'STATE:mode_convergent': { key: 'mode', value: 'convergent' },
    'STATE:mode_divergent': { key: 'mode', value: 'divergent' },
    'STATE:horizon_now': { key: 'horizon', value: 'now' },
    'STATE:horizon_long': { key: 'horizon', value: 'long' },
    'STATE:stakes_critical': { key: 'stakes', value: 'critical' },
    'STATE:stakes_casual': { key: 'stakes', value: 'casual' },
    'STATE:humor_none': { key: 'humor', value: 'none' },
    'STATE:humor_low': { key: 'humor', value: 'low' },
    'STATE:humor_normal': { key: 'humor', value: 'normal' },
    'STATE:humor_high': { key: 'humor', value: 'high' }
  };
  // domain mapping
  if (normalized === 'STATE:domain_work') {
    (next as Record<string, unknown>)['domain'] = 'work';
    return canonicalizeState(next);
  }
  if (normalized === 'STATE:domain_home') {
    (next as Record<string, unknown>)['domain'] = 'home';
    return canonicalizeState(next);
  }

  const mapped = mapping[normalized];
  if (mapped) {
    (next as Record<string, unknown>)[mapped.key] = mapped.value;
  }

  return canonicalizeState(next);
}

export function mergeStateDeltas(currentState: Partial<UserState> | null | undefined = DEFAULT_STATE, deltas: string[] | string = []): UserState {
  const list = Array.isArray(deltas) ? deltas : [deltas];
  return list.reduce((acc, token) => applyStateDelta(acc, token), canonicalizeState(currentState));
}

export function formatStateSegment(input: Partial<UserState> | null | undefined = {}): string {
  const state = canonicalizeState(input);
  return `STATE:bandwidth${state.bandwidth},mode:${state.mode},horizon:${state.horizon},stakes:${state.stakes},humor:${state.humor},domain:${state.domain}`;
}

export function parseStateSegment(segment = ''): UserState {
  const value = String(segment || '').trim();
  const canonicalMatch = value.match(/^STATE:bandwidth(\d{1,3}),mode:(convergent|divergent),horizon:(now|long),stakes:(critical|casual),humor:(none|low|normal|high),domain:(work|home)$/);
  if (canonicalMatch) {
    return canonicalizeState({
      bandwidth: Number(canonicalMatch[1]),
      mode: canonicalMatch[2] as StateMode,
      horizon: canonicalMatch[3] as StateHorizon,
      stakes: canonicalMatch[4] as StateStakes,
      humor: canonicalMatch[5] as StateHumor,
      domain: canonicalMatch[6] as StateDomain
    });
  }

  if (value.startsWith('STATE:mode_') || value.startsWith('STATE:horizon_') || value.startsWith('STATE:stakes_') || value.startsWith('STATE:humor_') || value.startsWith('STATE:bandwidth') || value.startsWith('STATE:domain_')) {
    return applyStateDelta(DEFAULT_STATE, value);
  }

  return canonicalizeState(DEFAULT_STATE);
}
