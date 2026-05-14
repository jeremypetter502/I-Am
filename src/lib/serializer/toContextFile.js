// toContextFile.js
function toContextFile({ id, summary, traits }, options) {
  const profile = { id: id || null, summary: summary || '', traits: traits || {} };
  return {
    schema_version: '0.1',
    generated_at: new Date().toISOString(),
    profile,
    preferences: {},
    modules: []
  };
}

module.exports = { toContextFile };
