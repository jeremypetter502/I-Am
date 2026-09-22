import { describe, expect, it } from 'vitest';
import { scoreDelivery2 } from '../../src/lib/scorer/delivery2Scorer.js';

describe('delivery2 validation', () => {
  it('defaults missing and invalid responses to neutral', () => {
    const result = scoreDelivery2([null, undefined, 99, -1]);

    expect(result.raw.structure).toBe(3);
    expect(result.normalized.structure).toBe(50);
  });

  it('applies reverse-scored items before aggregation', () => {
    const responses = Array(24).fill(3);
    responses[2] = 5;
    const result = scoreDelivery2(responses);

    expect(result.raw.structure).toBe(2.5);
    expect(result.normalized.structure).toBe(37.5);
  });
});