import { describe, it, expect } from 'vitest';
const { scoreCommunication } = require('../../src/lib/scorer/communicationScorer.js');

describe('communicationScorer', () => {
  it('scores 20 responses into trait raw and normalized ranges', () => {
    const responses = Array(20).fill(5);
    const result = scoreCommunication(responses);
    expect(result.responses.length).toBe(20);
    expect(result.raw_trait_scores.driver).toBe(25);
    expect(result.normalized_trait_scores.driver).toBe(100);
    expect(result.normalized_trait_scores.analytical).toBe(100);
    expect(result.completed).toBe(true);
  });

  it('defaults missing responses and remains bounded', () => {
    const result = scoreCommunication([1, 2]);
    for (const value of Object.values(result.normalized_trait_scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});
