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
      skills.responses = skills.responses.map((item) => (item && typeof item === 'object' ? { ...item } : item));
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
    if (skills.disabled === true) {
      skills.disabled = true;
    }
  }

  if (profile.modules.state && typeof profile.modules.state === 'object') {
    const state = profile.modules.state;
    profile.modules.state = {
      ...state,
      bandwidth: Number.isFinite(Number(state.bandwidth)) ? Math.max(0, Math.min(100, Math.round(Number(state.bandwidth)))) : 50,
      mode: state.mode === 'divergent' ? 'divergent' : 'convergent',
      horizon: state.horizon === 'now' ? 'now' : 'long',
      stakes: state.stakes === 'critical' ? 'critical' : 'casual',
      completed: state.completed === undefined ? true : Boolean(state.completed),
      disabled: state.disabled === true,
      last_updated: state.last_updated
    };
  }
  if (profile.modules.delivery2 && typeof profile.modules.delivery2 === 'object') {
    const delivery2 = profile.modules.delivery2;
    profile.modules.delivery2 = {
      ...delivery2,
      responses: Array.isArray(delivery2.responses)
        ? delivery2.responses.map((value) => {
            const numeric = Number(value);
            return Number.isFinite(numeric) ? numeric : null;
          })
        : [],
      disabled: delivery2.disabled === true
    };
  }
  for (const [moduleKey, moduleValue] of Object.entries(profile.modules)) {
    if (!moduleValue || typeof moduleValue !== 'object' || Array.isArray(moduleValue)) continue;
    profile.modules[moduleKey] = {
      ...moduleValue,
      disabled: moduleValue.disabled === true
    };
  }
  return { valid, errors: validate.errors || null, profile, inferred };
}
