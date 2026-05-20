import fs from 'fs';
import Ajv from 'ajv';

function loadSchema() {
  const p = 'specs/001-personality-context-site/contextfile.schema.json';
  if (!fs.existsSync(p)) throw new Error('Schema not found: ' + p);
  return JSON.parse(fs.readFileSync(p,'utf8'));
}

export function importJson(input) {
  let obj = input;
  if (typeof input === 'string') {
    if (!fs.existsSync(input)) throw new Error('File not found: ' + input);
    obj = JSON.parse(fs.readFileSync(input,'utf8'));
  }
  const schema = loadSchema();
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(obj);
  const inferred = [];
  // Basic merge semantics: ensure profile exists
  const profile = obj.profile || {};
  // If modules missing, mark inferred empty placeholder
  if (!profile.modules) {
    inferred.push('modules');
    profile.modules = {};
  }
  if (profile.modules.skills && typeof profile.modules.skills === 'object') {
    const skills = profile.modules.skills;
    if (Array.isArray(skills.responses)) {
      skills.responses = skills.responses.map((item) => ({ ...item }));
    }
    if (Array.isArray(skills.filtered)) {
      skills.filtered = skills.filtered.map((item) => ({ ...item }));
    }
    if (skills.testAnswers && typeof skills.testAnswers === 'object') {
      skills.testAnswers = Object.fromEntries(
        Object.entries(skills.testAnswers).map(([indexKey, value]) => [indexKey, {
          interview_defense: Boolean(value?.interview_defense),
          day_one_autonomy: Boolean(value?.day_one_autonomy),
          relevance_recency: Boolean(value?.relevance_recency)
        }])
      );
    }
  }

  if (profile.modules.state && typeof profile.modules.state === 'object') {
    const state = profile.modules.state;
    profile.modules.state = {
      bandwidth: Number.isFinite(Number(state.bandwidth)) ? Math.max(0, Math.min(100, Math.round(Number(state.bandwidth)))) : 50,
      mode: state.mode === 'divergent' ? 'divergent' : 'convergent',
      horizon: state.horizon === 'now' ? 'now' : 'long',
      stakes: state.stakes === 'critical' ? 'critical' : 'casual',
      completed: state.completed === undefined ? true : Boolean(state.completed),
      last_updated: state.last_updated
    };
  }
  return { valid, errors: validate.errors || null, profile, inferred };
}
