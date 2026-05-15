import { describe, it, expect } from 'vitest';
const scorer = require('../../src/lib/scorer/musicScorer.js');

describe('musicScorer', () => {
  it('computes normalized factors for sample responses', () => {
    const responses = Array(20).fill(2); // slightly disagree
    const out = scorer.scoreMusic(responses);
    expect(out).toBeTruthy();
    expect(typeof out.normalized.mellow).toBe('number');
    // with responses=2, normalized = ((2-1)/4)*100 = 25
    expect(out.normalized.mellow).toBeCloseTo(25, 1);
  });
});