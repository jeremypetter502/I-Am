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

  const ipipResponses = (options && options.ipipResponses) ? options.ipipResponses : [];
  const profile = {
    id: id || null,
    summary: summary || '',
    scores,
    raw_scores,
    modules: {
      ipip: {
        responses: ipipResponses,
        raw_trait_scores: raw || {},
        normalized_trait_scores: normalized || {}
      }
    }
  };

  return {
    schema_version: '0.1',
    generated_at: new Date().toISOString(),
    profile
  };
}

module.exports = { toContextFile };
