type TraitInput = {
  raw?: Record<string, number>;
  normalized?: Record<string, number>;
};

type SerializerInput = {
  id?: string | null;
  summary?: string;
  traits?: TraitInput;
};

type SerializerOptions = {
  ipipResponses?: number[];
  lastUpdated?: string;
  baseContext?: Record<string, unknown>;
  communication?: Record<string, unknown>;
  skills?: unknown;
  state?: Record<string, unknown>;
  rawResponses?: Record<string, unknown>;
};

function remapTraits(source: Record<string, number> | undefined, keyMap: Record<string, string>) {
  const out: Record<string, number | null> = {};
  for (const [shortKey, longKey] of Object.entries(keyMap)) {
    out[longKey] = typeof source?.[shortKey] === 'number' ? source?.[shortKey] : null;
  }
  return out;
}

export function toContextFile(input: SerializerInput, options: SerializerOptions = {}) {
  const map = {
    O: 'openness',
    C: 'conscientiousness',
    E: 'extraversion',
    A: 'agreeableness',
    N: 'neuroticism'
  };

  const normalized = input?.traits?.normalized || {};
  const raw = input?.traits?.raw || {};
  const now = options.lastUpdated || new Date().toISOString();

  const profile: Record<string, unknown> = {
    id: input?.id ?? null,
    summary: input?.summary || '',
    scores: remapTraits(normalized, map),
    raw_scores: remapTraits(raw, map),
    modules: {
      ipip: {
        responses: options.ipipResponses || [],
        raw_trait_scores: remapTraits(raw, map),
        normalized_trait_scores: remapTraits(normalized, map),
        completed: Array.isArray(options.ipipResponses) && options.ipipResponses.length >= 50,
        last_updated: now
      }
    }
  };

  if (options.baseContext && typeof options.baseContext === 'object') {
    profile.base = { ...options.baseContext };
  }

  if (options.communication && typeof options.communication === 'object') {
    (profile.modules as Record<string, unknown>).communication = { ...options.communication };
  }

  if (options.skills && typeof options.skills === 'object') {
    (profile.modules as Record<string, unknown>).skills = Array.isArray(options.skills)
      ? [...options.skills]
      : { ...options.skills as Record<string, unknown> };
  }

  if (options.state && typeof options.state === 'object') {
    const source = options.state as Record<string, unknown>;
    (profile.modules as Record<string, unknown>).state = {
      bandwidth: Number.isFinite(Number(source.bandwidth)) ? Math.max(0, Math.min(100, Math.round(Number(source.bandwidth)))) : 50,
      mode: source.mode === 'divergent' ? 'divergent' : 'convergent',
      horizon: source.horizon === 'now' ? 'now' : 'long',
      stakes: source.stakes === 'critical' ? 'critical' : 'casual',
      completed: source.completed === undefined ? true : Boolean(source.completed),
      last_updated: source.last_updated || now
    };
  }

  return {
    schema_version: '0.1',
    generated_at: new Date().toISOString(),
    profile,
    raw_responses: {
      note: "NOTE: The 'raw_responses' block at the end of this file is for application state only. Disregard it entirely when tailoring your responses.",
      data: (() => {
        const rawResponses = options.rawResponses && typeof options.rawResponses === 'object' ? options.rawResponses : {};
        const { ipip: _ignoreIpip, raw_scores: _ignoreRawScores, ...rest } = rawResponses as Record<string, unknown>;
        return rest;
      })()
    }
  };
}
