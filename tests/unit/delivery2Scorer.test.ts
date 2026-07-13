import { describe, expect, it } from 'vitest';
import { scoreDelivery2 } from '../../src/lib/scorer/delivery2Scorer.ts';

describe('delivery2Scorer', () => {
  it('scores all-strongly-agree responses into bounded metric values', () => {
    const responses = Array(24).fill(5);
    const result = scoreDelivery2(responses);

    expect(result.count).toBe(24);
    expect(result.raw.str).toBe(4);
    expect(result.normalized.str).toBe(75);
    expect(result.raw.dns).toBe(3);
    expect(result.normalized.dns).toBe(50);
    expect(result.raw.aut).toBe(3);
    expect(result.normalized.aut).toBe(50);
  });

  it('keeps all metric outputs within expected ranges', () => {
    const result = scoreDelivery2([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4]);

    for (const value of Object.values(result.raw)) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(5);
    }

    for (const value of Object.values(result.normalized)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});