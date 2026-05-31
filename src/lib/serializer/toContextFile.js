// toContextFile.js
function toContextFile({ id, summary, traits }, options) {
  // traits may be either { O,C,E,A,N } (normalized) or { raw: {...}, normalized: {...} }
  const map = {
    O: 'openness',
    C: 'conscientiousness',
    E: 'extraversion',
    A: 'agreeableness',
    N: 'neuroticism'
  };
  const normalized = traits && traits.normalized ? traits.normalized : traits;
  const raw = traits && traits.raw ? traits.raw : null;

  const scores = {};
  for (const k of Object.keys(map)) {
    const normVal = normalized && typeof normalized[k] === 'number' ? normalized[k] : null;
    const rawVal = raw && typeof raw[k] === 'number' ? raw[k] : null;
    scores[map[k]] = normVal;
  }

  function remapTraits(obj) {
    if (!obj || typeof obj !== 'object') return {};
    const out = {};
    for (const key of Object.keys(obj)) {
      const mapped = map[key] || key;
      out[mapped] = obj[key];
    }
    return out;
  }

  const ipipModule = (options && options.ipip && typeof options.ipip === 'object' && !Array.isArray(options.ipip))
    ? options.ipip
    : {
        responses: (options && options.ipipResponses) ? options.ipipResponses : []
      };
  const ipipResponses = Array.isArray(ipipModule.responses) ? ipipModule.responses : [];
  const profile = {
    id: id || null,
    summary: summary || '',
    scores,
    modules: {
      ipip: {
        responses: ipipResponses,
        raw_trait_scores: remapTraits(raw) || {},
        normalized_trait_scores: remapTraits(normalized) || {},
        disabled: ipipModule.disabled === true,
        completed: Array.isArray(ipipResponses) && ipipResponses.length >= 50,
        last_updated: (options && options.lastUpdated) ? options.lastUpdated : new Date().toISOString()
      }
    }
  };

  if (options && options.baseContext && typeof options.baseContext === 'object') {
    profile.base = { ...options.baseContext };
  }

  if (options && options.communication && typeof options.communication === 'object') {
    profile.modules.communication = { ...options.communication, disabled: options.communication.disabled === true };
  }

  if (options && options.skills && typeof options.skills === 'object') {
    profile.modules.skills = Array.isArray(options.skills)
      ? [...options.skills]
      : { ...options.skills, disabled: options.skills.disabled === true };
  }

  if (options && options.state && typeof options.state === 'object') {
    const state = options.state;
    profile.modules.state = {
      bandwidth: Number.isFinite(Number(state.bandwidth)) ? Math.max(0, Math.min(100, Math.round(Number(state.bandwidth)))) : 50,
      mode: state.mode === 'divergent' ? 'divergent' : 'convergent',
      horizon: state.horizon === 'now' ? 'now' : 'long',
      stakes: state.stakes === 'critical' ? 'critical' : 'casual',
      disabled: state.disabled === true,
      completed: state.completed === undefined ? true : Boolean(state.completed),
      last_updated: state.last_updated || ((options && options.lastUpdated) ? options.lastUpdated : new Date().toISOString())
    };
  }

  const result = {
    schema_version: '0.1',
    generated_at: new Date().toISOString(),
    profile
  };

  // Append raw_responses block (application state only). LLMs should ignore this section.
  const rawResponsesData = (options && options.rawResponses && typeof options.rawResponses === 'object') ? options.rawResponses : {};
  const { raw_scores: _ignoreRawScores, ipip: _ignoreIpip, ...rawResponsesWithoutScores } = rawResponsesData;
  result.raw_responses = {
    note: "NOTE: The 'raw_responses' block at the end of this file is for application state only. Disregard it entirely when tailoring your responses.",
    data: rawResponsesWithoutScores
  };

  return result;
}

export { toContextFile };
