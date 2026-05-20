import { describe, it, expect } from 'vitest';
const { searchOnetJobs, validateBaseContext, normalizeBaseContext } = require('../../src/lib/baseContext/index.js');

describe('baseContext helpers', () => {
  it('finds software-related jobs from O*NET index', () => {
    const results = searchOnetJobs('software engineer');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('soc_code');
    expect(results[0]).toHaveProperty('title');
  });

  it('validates soc code format', () => {
    const invalid = validateBaseContext({ onet: { soc_code: 'abc', title: 'x' } });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.some((e) => e.includes('soc_code'))).toBe(true);
  });

  it('normalizes and trims base context text', () => {
    const normalized = normalizeBaseContext({
      name: '  Jeremy Doe  ',
      job_title: '  Engineer  ',
      company: '  Acme  ',
      skills: '  JavaScript, Design  ',
      short_bio: 'hello',
      years_experience: '4'
    });
    expect(normalized.name).toBe('Jeremy Doe');
    expect(normalized.job_title).toBe('Engineer');
    expect(normalized.company).toBe('Acme');
    expect(normalized.skills).toBe('JavaScript, Design');
    expect(normalized.years_experience).toBe(4);
  });

  it('validates length bounds for name and skills', () => {
    const invalid = validateBaseContext({
      name: 'x'.repeat(121),
      skills: 'y'.repeat(401)
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.some((e) => e.includes('name'))).toBe(true);
    expect(invalid.errors.some((e) => e.includes('skills'))).toBe(true);
  });
});
