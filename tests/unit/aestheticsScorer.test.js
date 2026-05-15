import { describe, it, expect } from 'vitest';
const scorer = require('../../src/lib/scorer/aestheticsScorer.js');

describe('aestheticsScorer', () => {
  it('computes normalized composites for sample responses', () => {
    const responses = Array(18).fill(4); // mostly agree
    const out = scorer.scoreAesthetics(responses);
    expect(out).toBeTruthy();
    expect(typeof out.normalized.minimalism).toBe('number');
    // with responses=4, normalized = ((4-1)/4)*100 = 75
    expect(out.normalized.minimalism).toBeCloseTo(75, 1);
  });
});