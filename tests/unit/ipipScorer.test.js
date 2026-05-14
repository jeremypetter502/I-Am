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
});
