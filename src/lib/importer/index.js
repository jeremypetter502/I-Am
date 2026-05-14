const fs = require('fs');
const Ajv = require('ajv');

function loadSchema() {
  const p = 'specs/001-personality-context-site/contextfile.schema.json';
  if (!fs.existsSync(p)) throw new Error('Schema not found: ' + p);
  return JSON.parse(fs.readFileSync(p,'utf8'));
}

function importJson(input) {
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
  return { valid, errors: validate.errors || null, profile, inferred };
}

module.exports = { importJson };
