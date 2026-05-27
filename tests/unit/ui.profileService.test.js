import { describe, it, expect } from 'vitest';
const { scoreAndExport, sanitizeContextFile } = require('../../src/ui/services/profileService');

describe('UI profileService', () => {
  it('produces a ContextFile from 50 responses', () => {
    const responses = Array(50).fill(3);
    const ctx = scoreAndExport(responses);
    expect(ctx).toBeTruthy();
    expect(ctx.profile).toBeTruthy();
    expect(ctx.profile.modules.ipip).toBeTruthy();
    expect(ctx.profile.modules.ipip.responses).toHaveLength(50);
    expect(ctx.profile.modules.ipip.raw_trait_scores).toBeTruthy();
    expect(ctx.profile.modules.ipip.normalized_trait_scores).toBeTruthy();
    expect(typeof ctx.profile.modules.ipip.raw_trait_scores.openness).toBe('number');
    expect(typeof ctx.profile.modules.ipip.normalized_trait_scores.openness).toBe('number');
    expect(ctx.raw_responses).toBeTruthy();
    expect(ctx.raw_responses.data.ipip).toBeUndefined();
  });

  it('sanitizes stale cached ipip raw responses', () => {
    const stale = {
      profile: {
        modules: {
          ipip: {
            responses: [3, 3, 3]
          }
        }
      },
      raw_responses: {
        data: {
          ipip: [3, 3, 3],
          music: [1, 2]
        }
      }
    };

    const sanitized = sanitizeContextFile(stale);
    expect(sanitized.raw_responses.data.ipip).toBeUndefined();
    expect(sanitized.raw_responses.data.music).toEqual([1, 2]);
    expect(stale.raw_responses.data.ipip).toEqual([3, 3, 3]);
  });

  it('serializes state and skills into ContextFile output', () => {
    const responses = Array(50).fill(3);
    const ctx = scoreAndExport(responses, {
      state: {
        bandwidth: 30,
        mode: 'convergent',
        horizon: 'now',
        stakes: 'critical'
      },
      skills: {
        responses: Array(35).fill(3)
      }
    });

    expect(ctx.profile.modules.state).toBeTruthy();
    expect(ctx.profile.modules.state.bandwidth).toBe(30);
    expect(ctx.profile.modules.state.mode).toBe('convergent');
    expect(ctx.profile.modules.skills).toBeTruthy();
    expect(ctx.profile.modules.skills.testAnswers).toBeUndefined();
  });

  it('stores disabled module data while omitting it from IAM string', () => {
    const responses = Array(50).fill(3);
    const ctx = scoreAndExport(responses, {
      music: {
        responses: Array(20).fill(3),
        result: {
          normalized: {
            mellow: 75,
            sophisticated: 35,
            unpretentious: 50,
            intense: 20,
            contemporary: 55
          }
        },
        disabled: true
      }
    });

    expect(ctx.profile.modules.music).toBeTruthy();
    expect(ctx.profile.modules.music.disabled).toBe(true);
    expect(ctx.profile.iam.code.includes('/MEL')).toBe(false);
  });

  it('omits personality OCEAN metrics when ipip module is disabled', () => {
    const responses = Array(50).fill(3);
    const ctx = scoreAndExport(responses, {
      ipip: {
        responses,
        disabled: true
      }
    });

    expect(ctx.profile.modules.ipip).toBeTruthy();
    expect(ctx.profile.modules.ipip.disabled).toBe(true);
    expect(ctx.profile.iam.code.includes('O')).toBe(false);
    expect(ctx.profile.modules.ipip.responses).toHaveLength(50);
  });
});
