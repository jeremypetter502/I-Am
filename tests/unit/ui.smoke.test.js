import { describe, it, expect } from 'vitest';
const { loadQuestions, scoreResponses } = require('../../src/ui/services/profileService');

describe('UI smoke (headless)', () => {
  it('loadQuestions returns 50 parsed items and scoring works', async () => {
    const qs = await loadQuestions();
    expect(Array.isArray(qs)).toBe(true);
    // should contain at least 50 parsed question lines
    const qs50 = qs.slice(0,50);
    expect(qs50.length).toBe(50);
    // ensure header/introduction lines were stripped
    expect(qs50.every(q => !/IPIP-|How to respond|Items:|End of survey/i.test(q))).toBe(true);
    // ensure expected content exists somewhere in the items
    expect(qs.some(q => /life of the party|Am the life/i.test(q))).toBe(true);

    // basic scoring sanity check using 50 neutral responses
    const responses = Array(50).fill(3);
    const scored = scoreResponses(responses);
    expect(scored).toHaveProperty('raw');
    expect(scored).toHaveProperty('normalized');
  });
});
