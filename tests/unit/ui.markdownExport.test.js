import { describe, it, expect } from 'vitest';
const { toIamDataStorageObject, toIamDataStorageJson, scoreAndExport } = require('../../src/ui/services/profileService.js');

describe('IAM JSON export', () => {

  it('exports storage JSON with raw module answers and no duplicate sections', () => {
    const stale = {
      profile: {
        iam: {
          code: 'IAM/0.7:O70C60E50A40N30/DELIVERY:DEF55PEER60CHL70DNS50AUD40STR80ABS65FMT60VBS55EMP70CND68HMR52AUT72BUR45'
        },
        modules: {
          ipip: {
            responses: [3, 3]
          },
          skills: {
            responses: [
              {
                name: 'Critical Thinking',
                index: 7,
                category: 'Cognitive & Analysis',
                raw_score: 8,
                normalized_score: 80,
                threshold_status: 'results_worthy',
                listed_status: 'confirmed'
              }
            ],
            filtered: [
              {
                name: 'Critical Thinking',
                index: 7,
                category: 'Cognitive & Analysis',
                raw_score: 8,
                normalized_score: 80,
                threshold_status: 'results_worthy',
                listed_status: 'confirmed'
              }
            ],
            normalized: [80],
            completed: true,
            last_updated: '2026-05-22T22:57:34.043Z'
          },
          delivery: {
            responses: Array(30).fill(4),
            normalized: {
              def: 55,
              peer: 60,
              chl: 70,
              dns: 50,
              aud: 40,
              str: 80,
              abs: 65,
              fmt: 60,
              vbs: 55,
              emp: 70,
              cnd: 68,
              hmr: 52,
              aut: 72,
              bur: 45
            }
          }
        }
      },
      preferences: {
        skills: [
          {
            name: 'Critical Thinking',
            index: 7,
            normalized_score: 80,
            listed_status: 'confirmed'
          }
        ]
      },
      raw_responses: {
        data: {
          ipip: [3, 3],
          music: [1]
        }
      }
    };

    const jsonText = toIamDataStorageJson(stale);
    const payload = JSON.parse(jsonText);
    const topLevelKeys = Object.keys(payload);

    expect(topLevelKeys.includes('profile')).toBe(true);
    expect(payload.profile.modules.ipip.responses).toEqual([3, 3]);
    expect(payload.profile.modules.ipip.disabled).toBe(false);
    expect(payload.profile.modules.delivery.responses).toHaveLength(30);
    expect(payload.profile.modules.delivery.disabled).toBe(false);
    expect(payload.profile.modules.skills.responses).toEqual([8]);
    expect(payload.profile.modules.skills.disabled).toBe(false);
    expect(payload.profile.modules.skills.filtered).toBeUndefined();
    expect(payload.profile.modules.skills.normalized).toBeUndefined();
    expect(payload.profile.preferences).toBeUndefined();
    expect(payload.profile.iam).toBeUndefined();
    expect(payload.raw_responses).toBeUndefined();
  });

  it('does not derive or persist top-level iam in storage payloads', () => {
    const contextWithoutIam = {
      profile: {
        scores: {
          openness: 52.5,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 55,
          neuroticism: 50
        },
        modules: {
          skills: {
            filtered: [
              { index: 1, normalized_score: 20 }
            ],
            completed: true
          }
        },
        base: {
          onet: {
            soc_code: '15-1255',
            title: 'Web and Digital Interface Designers'
          }
        }
      },
      raw_responses: { data: {} }
    };

    const payload = toIamDataStorageObject(contextWithoutIam);
    expect(payload.iam).toBeUndefined();
    expect(payload.profile.modules.skills.responses).toEqual([20]);
  });

  it('stores canonical state raw answers for round-trip', () => {
    const contextWithoutIam = {
      profile: {
        scores: {
          openness: 52.5,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 55,
          neuroticism: 50
        },
        modules: {
          state: {
            bandwidth: 30,
            mode: 'convergent',
            horizon: 'now',
            stakes: 'critical',
            completed: true
          }
        }
      }
    };

    const payload = toIamDataStorageObject(contextWithoutIam);
    expect(payload.iam).toBeUndefined();
    expect(payload.profile.modules.state.bandwidth).toBe(30);
    expect(payload.profile.modules.state.mode).toBe('convergent');
    expect(payload.profile.modules.state.horizon).toBe('now');
    expect(payload.profile.modules.state.stakes).toBe('critical');
  });

  it('keeps raw module answers in storage object generated from scoreAndExport', () => {
    const context = scoreAndExport(Array(50).fill(3), {
      music: Array(20).fill(2),
      delivery: Array(30).fill(4)
    });
    const storage = toIamDataStorageObject(context);

    expect(storage.iam).toBeUndefined();
    expect(storage.profile.modules.ipip.responses).toHaveLength(50);
    expect(storage.profile.modules.music.responses).toHaveLength(20);
    expect(storage.profile.modules.delivery.responses).toHaveLength(30);
    expect(storage.profile.modules.delivery.normalized).toBeUndefined();
  });

  it('exports module notes in iam.json storage payload', () => {
    const context = {
      profile: {
        modules: {
          music: {
            responses: [1, 2, 3],
            note: 'Use analog synth references.',
            disabled: false
          },
          state: {
            bandwidth: 42,
            mode: 'convergent',
            horizon: 'now',
            stakes: 'critical',
            note: 'Preparing for a high-stakes launch.',
            disabled: false
          },
          skills: {
            responses: [{ raw_score: 8 }],
            note: 'Focus on systems thinking.',
            disabled: false
          }
        }
      }
    };

    const payload = toIamDataStorageObject(context);
    expect(payload.profile.modules.music.note).toBe('Use analog synth references.');
    expect(payload.profile.modules.state.note).toBe('Preparing for a high-stakes launch.');
    expect(payload.profile.modules.skills.note).toBe('Focus on systems thinking.');
  });
});

