import { describe, it, expect } from 'vitest';
const { scoreAndExport, sanitizeContextFile } = require('../../src/ui/services/profileService');
const { toIamDataStorageObject } = require('../../src/ui/services/profileService');

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
    expect(ctx.profile.modules.state.disabled).toBe(false);
    expect(ctx.profile.modules.skills).toBeTruthy();
    expect(ctx.profile.modules.skills.disabled).toBe(false);
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

  it('preserves disabled skills in storage JSON export', () => {
    const responses = Array(50).fill(3);
    const ctx = scoreAndExport(responses, {
      skills: {
        responses: [
          { name: 'Reading Comprehension', index: 1, raw_score: 9 }
        ],
        disabled: true
      }
    });

    const storage = require('../../src/ui/services/profileService').toIamDataStorageObject(ctx);
    expect(storage.profile.modules.skills.disabled).toBe(true);
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

  it('emits explicit disabled booleans for active modules', () => {
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
        }
      },
      communication: {
        responses: Array(20).fill(3),
        result: {
          responses: Array(20).fill(3),
          raw_trait_scores: { driver: 10, analytical: 10, expressive: 10, amiable: 10 },
          normalized_trait_scores: { driver: 40, analytical: 45, expressive: 50, amiable: 55 },
          completed: true
        }
      }
    });

    expect(ctx.profile.modules.ipip.disabled).toBe(false);
    expect(ctx.profile.modules.music.disabled).toBe(false);
    expect(ctx.profile.modules.communication.disabled).toBe(false);
  });

  it('rebuilds malformed COMM segments when communication metrics are available', () => {
    const profile = {
      profile: {
        iam: { code: 'IAM/0.2:O50C50E50A50N50/COMM:' },
        scores: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50
        },
        modules: {
          ipip: {
            responses: Array(50).fill(3),
            disabled: false
          },
          communication: {
            responses: Array(20).fill(3),
            normalized_trait_scores: {
              driver: 40,
              analytical: 45,
              expressive: 50,
              amiable: 55
            },
            completed: true,
            disabled: false
          }
        }
      }
    };

    const out = toIamDataStorageObject(profile);
    expect(out.iam.includes('/COMM:DRV40ANC45EXP50AMB55')).toBe(true);
  });

  it('adds COMM metrics when existing IAM is missing communication segment', () => {
    const profile = {
      profile: {
        iam: { code: 'IAM/0.1:O50C50E50A50N50' },
        scores: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50
        },
        modules: {
          ipip: {
            responses: Array(50).fill(3),
            disabled: false
          },
          communication: {
            responses: Array(20).fill(3),
            normalized_trait_scores: {
              driver: 80,
              analytical: 35,
              expressive: 65,
              amiable: 20
            },
            completed: true,
            disabled: false
          }
        }
      }
    };

    const out = toIamDataStorageObject(profile);
    expect(out.iam.includes('/COMM:DRV80ANC35EXP65AMB20')).toBe(true);
  });
});

