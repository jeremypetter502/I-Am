// toContextFile.js
function toContextFile({ id, summary, traits }, options) {
  // traits expected in form { O,C,E,A,N }
  const map = {
    O: 'openness',
    C: 'conscientiousness',
    E: 'extraversion',
    A: 'agreeableness',
    N: 'neuroticism'
  };
  const scores = {};
  const raw_scores = {};
  for (const k of Object.keys(map)) {
    const v = traits[k];
    scores[map[k]] = typeof v === 'number' ? v : null;
    raw_scores[map[k]] = null;
  }

  const profile = {
    id: id || null,
    summary: summary || '',
    scores,
    raw_scores,
    modules: {
      ipip: {
        responses: [],
        raw_trait_scores: {},
        normalized_trait_scores: {}
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
