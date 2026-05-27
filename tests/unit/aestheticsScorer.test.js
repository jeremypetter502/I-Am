import { describe, it, expect } from 'vitest';
import { scoreAesthetics } from '../../src/lib/scorer/aestheticsScorer.js';

// norm(r) = ((r-1)/4)*100   inv(x) = 100-x
// All-4 responses: norm(4) = 75, inv(75) = 25
// minimalism = mean([inv(n(3)),inv(n(4)),n(11),n(12),inv(n(13)),n(26)]) = mean([25,25,75,75,25,75]) = 50
// colorfulness = mean([n(14),inv(n(15))]) = mean([75,25]) = 50
// warmth = inv(n(6)) = 25     (Q6=Warm—Cool; all-4 → leans cool)
// motion = mean([n(17),inv(n(18))]) = mean([75,25]) = 50
// modernity = inv(n(5)) = 25  (Q5=Modern—Traditional; all-4 → leans traditional)

describe('aestheticsScorer', () => {
  it('exports scoreAesthetics function', () => {
    expect(typeof scoreAesthetics).toBe('function');
  });

  it('returns normalized composites with correct structure', () => {
    const responses = Array(32).fill(3); // neutral responses
    const out = scoreAesthetics(responses);
    expect(out).toBeTruthy();
    expect(out.normalized).toBeDefined();
    expect(out.imagery).toBeDefined();
    expect(out.typography).toBeDefined();
    expect(out.layout).toBeDefined();
    expect(out.context).toBeDefined();
    expect(out.tags).toBeDefined();
  });

  it('maps all-neutral (3) to 50 for symmetric composites', () => {
    const responses = Array(32).fill(3);
    const out = scoreAesthetics(responses);
    // norm(3) = 50, inv(50) = 50; all composites should be 50
    expect(out.normalized.minimalism).toBeCloseTo(50, 1);
    expect(out.normalized.colorfulness).toBeCloseTo(50, 1);
    expect(out.normalized.warmth).toBeCloseTo(50, 1);
    expect(out.normalized.motion).toBeCloseTo(50, 1);
  });

  it('correctly inverts semantic-differential items (all-4 example)', () => {
    const responses = Array(32).fill(4);
    const out = scoreAesthetics(responses);
    // minimalism: items 3,4,13 inverted; 11,12,26 direct
    // mean([inv(75),inv(75),75,75,inv(75),75]) = mean([25,25,75,75,25,75]) = 50
    expect(out.normalized.minimalism).toBeCloseTo(50, 1);
    // colorfulness: mean([norm(14),inv(norm(15))]) = mean([75,25]) = 50
    expect(out.normalized.colorfulness).toBeCloseTo(50, 1);
    // warmth: inv(norm(6)) = inv(75) = 25 (response 4 leans cool)
    expect(out.normalized.warmth).toBeCloseTo(25, 1);
    // modernity: inv(norm(5)) = 25 (response 4 leans traditional)
    expect(out.normalized.modernity).toBeCloseTo(25, 1);
  });

  it('correctly computes extremes: all-1 responses', () => {
    const responses = Array(32).fill(1);
    const out = scoreAesthetics(responses);
    // norm(1) = 0, inv(0) = 100
    // minimalism: mean([inv(0),inv(0),0,0,inv(0),0]) = mean([100,100,0,0,100,0]) = 50
    expect(out.normalized.minimalism).toBeCloseTo(50, 1);
    // warmth: inv(norm(6=1)) = inv(0) = 100 (fully warm)
    expect(out.normalized.warmth).toBeCloseTo(100, 1);
    // modernity: inv(norm(5=1)) = 100 (fully modern)
    expect(out.normalized.modernity).toBeCloseTo(100, 1);
  });

  it('handles missing/short responses by substituting neutral (3)', () => {
    const responses = []; // all missing
    const out = scoreAesthetics(responses);
    expect(out.normalized.minimalism).toBeCloseTo(50, 1);
    expect(out.count).toBe(0);
  });

  it('computes boolean tags correctly', () => {
    const responses = Array(32).fill(5); // strongly agree
    const out = scoreAesthetics(responses);
    // norm(5) = 100, inv(100) = 0
    // minimalism: mean([0,0,100,100,0,100]) = ~50, tags.prefers_minimal depends on >= 65
    expect(typeof out.tags.prefers_minimal).toBe('boolean');
    expect(typeof out.tags.prefers_bold_colors).toBe('boolean');
    expect(typeof out.tags.likes_motion).toBe('boolean');
  });
});