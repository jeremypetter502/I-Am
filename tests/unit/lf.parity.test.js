import { describe, test, expect } from 'vitest';
import { buildIam } from '../../src/lib/iam/iam.js';

describe('LF generation', () => {
  test('aesthetics values are emitted in long form', () => {
    const scored = { normalized: {} };
    const modules = {
      aesthetics: { normalized: { minimalism: 50, colorfulness: 38, warmth: 75, motion: 63 } }
    };
    const lf = buildIam(scored, modules).code;
    const lfMinMatch = lf.match(/minimalism(\d{1,3})/);
    expect(lfMinMatch).toBeTruthy();
    expect(lfMinMatch[1]).toBe('50');
  });
});
