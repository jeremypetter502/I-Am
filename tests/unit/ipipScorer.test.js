import { describe, it, expect } from 'vitest';
const { scoreIpip } = require('../../src/lib/scorer/ipipScorer');

describe('IPIP scorer', () => {
  it('scores all 3 responses as 50 normalized', () => {
    const responses = Array(50).fill(3);
    const res = scoreIpip(responses);
    for (const t of Object.keys(res.normalized)) {
      expect(res.normalized[t]).toBe(50);
    }
  });

  it('applies official reverse-keying for Agreeableness, Conscientiousness, Neuroticism, and Openness', () => {
    const responses = Array(50).fill(3);

    // Extraversion check (existing reverse pattern)
    responses[1] = 5; // item 2, reverse-keyed

    // Agreeableness: reverse-keyed items are 11,13,15,17
    responses[10] = 5; // 11 reverse
    responses[12] = 5; // 13 reverse
    responses[14] = 5; // 15 reverse
    responses[16] = 5; // 17 reverse
    responses[11] = 1; // 12 keyed
    responses[13] = 1; // 14 keyed
    responses[15] = 1; // 16 keyed
    responses[17] = 1; // 18 keyed
    responses[18] = 1; // 19 keyed
    responses[19] = 1; // 20 keyed

    // Conscientiousness: item 30 is keyed (not reverse-keyed)
    responses[29] = 5; // 30 keyed

    // Neuroticism: items 36/38/40 are keyed (not reverse-keyed)
    responses[35] = 5; // 36 keyed
    responses[37] = 5; // 38 keyed
    responses[39] = 5; // 40 keyed

    // Openness: items 48/50 are keyed (not reverse-keyed)
    responses[47] = 5; // 48 keyed
    responses[49] = 5; // 50 keyed

    const res = scoreIpip(responses);

    expect(res.raw.E).toBe(28);
    expect(res.raw.A).toBe(10);
    expect(res.raw.C).toBe(32);
    expect(res.raw.N).toBe(36);
    expect(res.raw.O).toBe(34);
  });
});
