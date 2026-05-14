import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const { scoreIpip } = require('../../src/lib/scorer/ipipScorer');
const { toContextFile } = require('../../src/lib/serializer/toContextFile');
const fs = require('fs');

describe('Serializer + schema', () => {
  it('generates a ContextFile that validates against schema', () => {
    const responses = Array(50).fill(3);
    const scored = scoreIpip(responses);
    const ctx = toContextFile({ id: 'test', summary: 's', traits: { raw: scored.raw, normalized: scored.normalized } }, { ipipResponses: responses });
    const schema = JSON.parse(fs.readFileSync('specs/001-personality-context-site/contextfile.schema.json','utf8'));
    const ajv = new Ajv({ allErrors: true, strict:false }); addFormats(ajv);
    const valid = ajv.validate(schema, ctx);
    if (!valid) console.error(ajv.errors);
    expect(valid).toBe(true);
  });
});
