#!/usr/bin/env node
// validate-json.js
// Standalone Node validator for a JSON file against a JSON Schema using AJV.
// Usage:
//   npm install ajv ajv-formats
//   node validate-json.js <schema.json> <data.json>

const fs = require('fs');
const path = require('path');

function fail(msg, code=1){ console.error(msg); process.exit(code); }

if (process.argv.length < 4) {
  console.error('Usage: node validate-json.js <schema.json> <data.json>');
  process.exit(2);
}

const schemaPath = path.resolve(process.argv[2]);
const dataPath = path.resolve(process.argv[3]);

if (!fs.existsSync(schemaPath)) fail(`Schema file not found: ${schemaPath}`, 2);
if (!fs.existsSync(dataPath)) fail(`Data file not found: ${dataPath}`, 2);

let schema, data;
try { schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8')); } catch (e) { fail(`Failed to read/parse schema: ${e.message}`, 2); }
try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (e) { fail(`Failed to read/parse data JSON: ${e.message}`, 2); }

let Ajv;
try {
  Ajv = require('ajv');
} catch (e) {
  fail('AJV is not installed. Run: npm install ajv ajv-formats', 2);
}
let addFormats = null;
try { addFormats = require('ajv-formats'); } catch(e){ /* optional */ }

const ajv = new Ajv({ allErrors: true, strict: false });
if (addFormats && typeof addFormats === 'function') addFormats(ajv);

let validate;
try {
  validate = ajv.compile(schema);
} catch (e) {
  fail(`Schema compilation error: ${e.message}`, 2);
}

const valid = validate(data);
if (valid) {
  console.log('Validation succeeded: data is valid against schema.');
  process.exit(0);
} else {
  console.error('Validation failed. Errors:');
  for (const err of validate.errors || []) {
    const path = err.instancePath || err.dataPath || '<root>';
    console.error('- ' + path + ': ' + (err.message || JSON.stringify(err)));
    if (err.params) console.error('  params:', JSON.stringify(err.params));
  }
  process.exit(1);
}
