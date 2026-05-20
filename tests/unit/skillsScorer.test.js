import { describe, it, expect } from 'vitest';
import { scoreSkills } from '../../src/lib/scorer/skillsScorer.js';

describe('skills scorer', () => {
  it('normalizes responses and returns full 35-skill assessment', () => {
    const responses = Array(35).fill(3);
    const result = scoreSkills(responses);

    expect(result.raw).toHaveLength(35);
    expect(result.normalized).toHaveLength(35);
    expect(result.fullAssessment).toHaveLength(35);
    expect(result.normalized[0]).toBe(60);
  });

  it('applies thresholds and confirmation tests to filtered output', () => {
    const responses = [4.5, 2.25, 1, 3.75, 2.75, ...Array(30).fill(0)];
    const tests = {
      1: { interview_defense: true, day_one_autonomy: true, relevance_recency: true },
      4: { interview_defense: true, day_one_autonomy: true, relevance_recency: false },
      5: { interview_defense: true, day_one_autonomy: true, relevance_recency: true }
    };

    const result = scoreSkills(responses, tests);

    const s1 = result.fullAssessment[0]; // 90
    const s2 = result.fullAssessment[1]; // 45
    const s3 = result.fullAssessment[2]; // 20
    const s4 = result.fullAssessment[3]; // 75
    const s5 = result.fullAssessment[4]; // 55

    expect(s1.threshold_status).toBe('results_worthy');
    expect(s2.threshold_status).toBe('conditional');
    expect(s3.threshold_status).toBe('omit');
    expect(s4.threshold_status).toBe('results_worthy');
    expect(s5.threshold_status).toBe('conditional');

    const names = result.filtered.map((s) => s.name);
    expect(names).toContain(s1.name);
    expect(names).toContain(s2.name);
    expect(names).toContain(s5.name);
    expect(names).not.toContain(s3.name);
    expect(names).not.toContain(s4.name);
  });
});
