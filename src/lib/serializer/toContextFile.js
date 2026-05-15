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
  const raw_scores = {};
  for (const k of Object.keys(map)) {
    const normVal = normalized && typeof normalized[k] === 'number' ? normalized[k] : null;
    const rawVal = raw && typeof raw[k] === 'number' ? raw[k] : null;
    scores[map[k]] = normVal;
    raw_scores[map[k]] = rawVal;
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

  const ipipResponses = (options && options.ipipResponses) ? options.ipipResponses : [];
  const profile = {
    id: id || null,
    summary: summary || '',
    scores,
    raw_scores,
    modules: {
      ipip: {
        responses: ipipResponses,
        raw_trait_scores: remapTraits(raw) || {},
        normalized_trait_scores: remapTraits(normalized) || {},
        completed: Array.isArray(ipipResponses) && ipipResponses.length >= 50,
        last_updated: (options && options.lastUpdated) ? options.lastUpdated : new Date().toISOString()
      }
    }
  };

  const preamble = {
    purpose: 'compact personality profile for LLM prompts',
    schema_version: '1.0',
    scoring_version: 'ipip-v1',
    trait_key_map: map,
    normalization: '0-100 (Normalized = ((Raw - 10)/40) * 100 for IPIP-50)',
    provenance: { tool: 'personality-site', tool_version: '0.1' },
    privacy: { persist_client_side_only: true },
    usage_snippet: "Use 'profile.scores' for summary prompts; 'modules.ipip' contains detailed responses and trait-level scores."
  };

  return {
    schema_version: '0.1',
    generated_at: new Date().toISOString(),
    preamble,
    profile
  };
}

module.exports = { toContextFile };
