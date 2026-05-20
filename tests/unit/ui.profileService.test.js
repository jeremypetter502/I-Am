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

  it('serializes state and skills testAnswers into ContextFile output', () => {
    const responses = Array(50).fill(3);
    const ctx = scoreAndExport(responses, {
      state: {
        bandwidth: 30,
        mode: 'convergent',
        horizon: 'now',
        stakes: 'critical'
      },
      skills: {
        responses: Array(35).fill(3),
        testAnswers: {
          1: {
            interview_defense: true,
            day_one_autonomy: true,
            relevance_recency: false
          }
        }
      }
    });

    expect(ctx.profile.modules.state).toBeTruthy();
    expect(ctx.profile.modules.state.bandwidth).toBe(30);
    expect(ctx.profile.modules.state.mode).toBe('convergent');
    expect(ctx.profile.modules.skills.testAnswers['1']).toEqual({
      interview_defense: true,
      day_one_autonomy: true,
      relevance_recency: false
    });
  });
});
