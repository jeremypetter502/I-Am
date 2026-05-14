import { describe, it, expect } from 'vitest';
const fs = require('fs');
const { importJson } = require('../../src/lib/importer/index');
const { serializePbtxt, parsePbtxt } = require('../../src/lib/importer/pbtxt');

describe('importer', () => {
  it('importJson validates and returns profile with inferred modules', () => {
    const sample = { profile: { id: 'p1', summary: 's' } };
    const result = importJson(sample);
    // Minimal sample does not satisfy full ContextFile schema; expect validation to fail but return profile and inferred fields
    expect(result.valid).toBe(false);
    expect(result.errors).toBeTruthy();
    expect(result.profile).toBeTruthy();
    expect(Array.isArray(result.inferred)).toBe(true);
  });

  it('pbtxt round-trip', () => {
    const obj = { hello: 'world', profile: { id: 'p1' } };
    const txt = serializePbtxt(obj);
    const parsed = parsePbtxt(txt);
    expect(parsed).toEqual(obj);
  });
});
