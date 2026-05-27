import { describe, it, expect } from 'vitest';
import { scoreSkills } from '../../src/lib/scorer/skillsScorer.js';

describe('skills scorer', () => {
  it('normalizes 1-10 responses and returns full 35-skill assessment', () => {
    const responses = Array(35).fill(6);
    const result = scoreSkills(responses);

    expect(result.raw).toHaveLength(35);
    expect(result.normalized).toHaveLength(35);
    expect(result.fullAssessment).toHaveLength(35);
    expect(result.normalized[0]).toBe(60);
  });

  it('filters skills by threshold (omit < 60, include >= 60)', () => {
    const responses = [9, 6, 5, 10, 7, ...Array(30).fill(1)];
    const result = scoreSkills(responses);

    const s1 = result.fullAssessment[0]; // normalized 90
    const s2 = result.fullAssessment[1]; // normalized 60
    const s3 = result.fullAssessment[2]; // normalized 50
    const s4 = result.fullAssessment[3]; // normalized 100
    const s5 = result.fullAssessment[4]; // normalized 70

    expect(s1.threshold_status).toBe('results_worthy');
    expect(s2.threshold_status).toBe('results_worthy');
    expect(s3.threshold_status).toBe('omit');
    expect(s4.threshold_status).toBe('results_worthy');
    expect(s5.threshold_status).toBe('results_worthy');

    const names = result.filtered.map((s) => s.name);
    expect(names).toContain(s1.name);
    expect(names).toContain(s2.name);
    expect(names).toContain(s4.name);
    expect(names).toContain(s5.name);
    expect(names).not.toContain(s3.name);
  });

  it('does not include test_results in skill objects', () => {
    const result = scoreSkills(Array(35).fill(8));
    expect(result.fullAssessment[0].test_results).toBeUndefined();
  });
});
