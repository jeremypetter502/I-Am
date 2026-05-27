import { describe, it, expect } from 'vitest';
const { toIamDataStorageObject, toIamDataStorageJson, scoreAndExport } = require('../../src/ui/services/profileService.js');

describe('IAM JSON export', () => {

  it('exports storage JSON with iam as top-level first field and no duplicate sections', () => {
    const stale = {
      profile: {
        iam: {
          code: 'IAM/0.7:O70C60E50A40N30/DELIVERY/DEF55PEER60CHL70DNS50AUD40STR80ABS65FMT60VBS55EMP70CND68HMR52AUT72BUR45'
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

    expect(topLevelKeys[0]).toBe('iam');
    expect(payload.iam.startsWith('IAM/0.7')).toBe(true);
    expect(payload.profile.modules.ipip.responses).toEqual([3, 3]);
    expect(payload.profile.modules.delivery.normalized.aut).toBe(72);
    expect(payload.profile.modules.skills.responses).toHaveLength(1);
    expect(payload.profile.modules.skills.responses[0]).toEqual({
      name: 'Critical Thinking',
      index: 7,
      category: 'Cognitive & Analysis',
      raw_score: 8
    });
    expect(payload.profile.modules.skills.filtered).toBeUndefined();
    expect(payload.profile.modules.skills.normalized).toBeUndefined();
    expect(payload.profile.modules.skills.responses[0].normalized_score).toBeUndefined();
    expect(payload.profile.modules.skills.responses[0].threshold_status).toBeUndefined();
    expect(payload.profile.modules.skills.responses[0].listed_status).toBeUndefined();
    expect(payload.profile.preferences).toBeUndefined();
    expect(payload.profile.iam).toBeUndefined();
    expect(payload.raw_responses).toBeUndefined();
  });

  it('derives IAM code when profile.iam is missing', () => {
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
    expect(typeof payload.iam).toBe('string');
    expect(payload.iam.includes('IAM/')).toBe(true);
    expect(payload.iam.includes('O53C50E50A55N50')).toBe(true);
    expect(payload.iam.includes('IAM code unavailable')).toBe(false);
  });

  it('derives IAM with canonical STATE segment when state module exists', () => {
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
    expect(typeof payload.iam).toBe('string');
    expect(payload.iam.includes('STATE:bandwidth30,mode:convergent,horizon:now,stakes:critical')).toBe(true);
  });

  it('keeps all answers and scores in storage object generated from scoreAndExport', () => {
    const context = scoreAndExport(Array(50).fill(3), {
      music: Array(20).fill(2),
      delivery: Array(30).fill(4)
    });
    const storage = toIamDataStorageObject(context);

    expect(storage.iam).toBeTruthy();
    expect(storage.profile.modules.ipip.responses).toHaveLength(50);
    expect(storage.profile.modules.music.responses).toHaveLength(20);
    expect(storage.profile.modules.delivery.responses).toHaveLength(30);
    expect(storage.profile.modules.delivery.normalized).toBeTruthy();
  });
});
