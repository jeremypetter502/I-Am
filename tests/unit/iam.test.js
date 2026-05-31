
import { describe, it, expect } from 'vitest';
import { buildIam, buildCareerSegment, normalizeSoc8 } from '../../src/lib/iam/iam.js';
describe('Career segment (v0.4)', () => {
  it('normalizes O*NET SOC code to 8 digits', () => {
    expect(normalizeSoc8('15-1252')).toBe('15125200');
    expect(normalizeSoc8('15-1252.01')).toBe('15125201');
    expect(normalizeSoc8('11-1021')).toBe('11102100');
    expect(normalizeSoc8('bad')).toBe('');
  });

  it('builds sparse Career segment with skills', () => {
    const soc8 = normalizeSoc8('15-1252');
    const skills = [
      { index: 1, normalized_score: 90 },
      { index: 18, normalized_score: 99 },
      { index: 24, normalized_score: 85 },
      { index: 33, normalized_score: 60 },
      { index: 2, normalized_score: 0 }, // should be omitted
    ];
    const seg = buildCareerSegment(soc8, skills);
    expect(seg).toBe('CAR:15125200S0190S1899S2485S3360');
  });

  it('buildIam returns only Career segment if only base.onet and skills present', () => {
    const modules = {
      base: { onet: { soc_code: '15-1252', title: 'Software Developers' } },
      skills: [
        { index: 1, normalized_score: 90 },
        { index: 18, normalized_score: 99 },
        { index: 24, normalized_score: 85 },
        { index: 33, normalized_score: 60 },
      ]
    };
    const iam = buildIam({}, modules);
    expect(iam.version).toBe('0.4');
    expect(iam.code).toBe('/CAR:15125200S0190S1899S2485S3360');
  });

  it('prefixes IAM with first name, birth year, gender, culture, and timezone abbreviation when present', () => {
    const scored = { normalized: { O: 83, C: 60, E: 45, A: 78, N: 33 } };
    const modules = {
      base: {
        name: 'Jeremy Petter',
        birth_year: 1975,
        gender: 'male',
        culture: 'en-US',
        timezone: 'America/New_York'
      }
    };

    const iam = buildIam(scored, modules);
    expect(iam.version).toBe('0.6');
    expect(iam.code).toBe('IAM/0.6:Jeremy:1975:Male:en-US:EST:O83C60E45A78N33');
  });
});

describe('iam builder', () => {
  it('uses version 0.1 without communication segment', () => {
    const scored = { normalized: { O: 70, C: 60, E: 50, A: 40, N: 30 } };
    const iam = buildIam(scored, {});
    expect(iam.version).toBe('0.1');
    expect(iam.code.startsWith('IAM/0.1')).toBe(true);
    expect(iam.code.includes('/COMM:')).toBe(false);
  });

  it('omits OCEAN segment when personality scores are not present', () => {
    const iam = buildIam({ normalized: { O: 0, C: 0, E: 0, A: 0, N: 0 } }, {});
    expect(iam.version).toBe('0.1');
    expect(iam.code).toBe('IAM/0.1');
    expect(iam.code.includes('O0C0E0A0N0')).toBe(false);
  });

  it('appends communication segment and bumps to 0.2', () => {
    const scored = { normalized: { O: 70, C: 60, E: 50, A: 40, N: 30 } };
    const modules = {
      communication: {
        normalized_trait_scores: {
          driver: 85,
          analytical: 40,
          expressive: 20,
          amiable: 15
        }
      }
    };
    const iam = buildIam(scored, modules);
    expect(iam.version).toBe('0.2');
    expect(iam.code.startsWith('IAM/0.2')).toBe(true);
    expect(iam.code.includes('/COMM:DRV85ANC40EXP20AMB15')).toBe(true);
  });

  it('appends canonical STATE segment and bumps version to 0.6', () => {
    const scored = { normalized: { O: 70, C: 60, E: 50, A: 40, N: 30 } };
    const modules = {
      state: {
        bandwidth: 30,
        mode: 'convergent',
        horizon: 'now',
        stakes: 'critical'
      }
    };
    const iam = buildIam(scored, modules);
    expect(iam.version).toBe('0.6');
    expect(iam.code).toBe('IAM/0.6:O70C60E50A40N30/STATE:bandwidth30,mode:convergent,horizon:now,stakes:critical');
  });

  it('keeps aesthetics segment when career data is present', () => {
    const scored = { normalized: { O: 70, C: 60, E: 50, A: 40, N: 30 } };
    const modules = {
      aesthetics: {
        normalized: {
          minimalism: 80,
          colorfulness: 35,
          warmth: 60,
          motion: 45,
          texture: 70
        }
      },
      base: { onet: { soc_code: '15-1252', title: 'Software Developers' } },
      skills: [{ index: 1, normalized_score: 90 }]
    };

    const iam = buildIam(scored, modules);
    expect(iam.code).toContain('/AES:MIN80CLR35WRM60MOT45IMG70');
    expect(iam.code).toContain('/CAR:15125200S0190');
  });

  it('appends delivery segment and bumps version to 0.7', () => {
    const scored = { normalized: { O: 70, C: 60, E: 50, A: 40, N: 30 } };
    const modules = {
      delivery: {
        normalized: {
          def: 72,
          peer: 41,
          chl: 66,
          dns: 58,
          aud: 34,
          str: 77,
          abs: 68,
          fmt: 62,
          vbs: 81,
          emp: 64,
          cnd: 52,
          hmr: 49,
          aut: 74,
          bur: 37
        }
      }
    };

    const iam = buildIam(scored, modules);
    expect(iam.version).toBe('0.7');
    expect(iam.code.startsWith('IAM/0.7')).toBe(true);
    expect(iam.code).toContain('/DELIVERY:DEF72PEER41CHL66DNS58AUD34STR77ABS68FMT62VBS81EMP64CND52HMR49AUT74BUR37');
  });
});

