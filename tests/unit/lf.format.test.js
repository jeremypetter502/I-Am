import { describe, test, expect } from 'vitest';
import { buildIam } from '../../src/lib/iam/iam.js';

describe('LF format generator', () => {
  test('produces LF prefix and expected segments', () => {
    const scored = { normalized: { O: 83, C: 60, E: 45, A: 78, N: 33 } };
    const modules = {
      aesthetics: { normalized: { minimalism: 50, colorfulness: 38, warmth: 75, motion: 63 } },
      music: { normalized: { mellow: 40 } }
    };
    const out = buildIam(scored, modules, { format: 'long_form', lfVersion: 'LF.0.2' });
    expect(out).toBeTruthy();
    expect(out.code.startsWith('IAM-v0.2')).toBe(true);
    expect(out.code).toContain('AESTHETIC:minimalism50,colorfulness38,warmth75,motion63');
    expect(out.code).toContain('PERSONALITY:openness83,conscientiousness60,extraversion45,agreeableness78,neuroticism33');
  });
});
