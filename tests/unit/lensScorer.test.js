import { describe, it, expect } from 'vitest';
import { scoreDelivery } from '../../src/lib/scorer/deliveryScorer.js';

describe('deliveryScorer', () => {
  it('exports scoreDelivery function', () => {
    expect(typeof scoreDelivery).toBe('function');
  });

  it('returns normalized delivery metrics for 30 responses', () => {
    const responses = Array(30).fill(5);
    const out = scoreDelivery(responses);

    expect(out).toHaveProperty('raw');
    expect(out).toHaveProperty('normalized');
    expect(out.count).toBe(30);
    expect(out.normalized.def).toBe(100);
    expect(out.normalized.peer).toBe(100);
    expect(out.normalized.aud).toBe(100);
    expect(out.normalized.aut).toBe(100);
    expect(out.normalized.chl).toBeLessThan(100);
  });

  it('applies reverse-scored items correctly', () => {
    const responses = Array(30).fill(3);
    responses[5] = 1; // Q6 is reverse-scored CHL
    const out = scoreDelivery(responses);

    // With reverse scoring, a 1 on a reverse item contributes as a high score.
    expect(out.normalized.chl).toBeGreaterThan(50);
  });
});
