
import { describe, it, expect } from 'vitest';
import { buildIam, buildCareerSegment, normalizeSoc8 } from '../../src/lib/iam/iam.js';
describe('Career segment', () => {
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
    expect(seg).toBe('SKL:15125200S0190S1899S2485S3360');
  });

  it('buildIam returns long-form career payload when only base.onet and skills are present', () => {
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
    expect(iam.version).toBe('LF.0.2');
    expect(iam.code.startsWith('IAM-v0.2')).toBe(true);
    expect(iam.code).toContain('/SKILL:15125200S0190S1899S2485S3360');
  });

  it('includes BASE prefix with first name, birth year, gender, culture, and timezone abbreviation when present', () => {
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
    expect(iam.version).toBe('LF.0.2');
    expect(iam.code).toContain('IAM-v0.2/BASE:Jeremy,1975,Male,en-US,EST');
    expect(iam.code).toContain('/PERSONALITY:openness83,conscientiousness60,extraversion45,agreeableness78,neuroticism33');
  });
});

describe('iam builder', () => {
  it('uses LF version without communication segment', () => {
    const scored = { normalized: { O: 70, C: 60, E: 50, A: 40, N: 30 } };
    const iam = buildIam(scored, {});
    expect(iam.version).toBe('LF.0.2');
    expect(iam.code.startsWith('IAM-v0.2')).toBe(true);
    expect(iam.code.includes('/COMMUNICATION:')).toBe(false);
  });

  it('omits PERSONALITY segment when personality scores are not present', () => {
    const iam = buildIam({ normalized: { O: 0, C: 0, E: 0, A: 0, N: 0 } }, {});
    expect(iam.version).toBe('LF.0.2');
    expect(iam.code).toBe('IAM-v0.2/PERSONALITY:openness0,conscientiousness0,extraversion0,agreeableness0,neuroticism0');
  });

  it('appends communication segment in long form', () => {
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
    expect(iam.version).toBe('LF.0.2');
    expect(iam.code.startsWith('IAM-v0.2')).toBe(true);
    expect(iam.code.includes('/COMMUNICATION:driver85,analytical40,expressive20,amiable15')).toBe(true);
  });

  it('appends STATE segment in long form', () => {
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
    expect(iam.version).toBe('LF.0.2');
    expect(iam.code).toContain('/STATE:bandwidth30,mode:Convergent,horizon:Now,stakes:Critical');
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
    expect(iam.code).toContain('/AESTHETIC:minimalism80,colorfulness35,warmth60,motion45,texture70');
    expect(iam.code).toContain('/SKILL:15125200S0190');
  });

  it('appends delivery segment in long form', () => {
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
    expect(iam.version).toBe('LF.0.2');
    expect(iam.code.startsWith('IAM-v0.2')).toBe(true);
    expect(iam.code).toContain('/DELIVERY:def72,peer41,chl66,dns58,aud34,str77,abs68,fmt62,vbs81,emp64,cnd52,hmr49,aut74,bur37');
  });

  it('appends delivery2 segment in long form', () => {
    const scored = { normalized: { O: 70, C: 60, E: 50, A: 40, N: 30 } };
    const modules = {
      delivery2: {
        normalized: {
          str: 75,
          dns: 50,
          frm: 62,
          fmt: 88,
          emp: 55,
          aut: 70
        }
      }
    };

    const iam = buildIam(scored, modules);
    expect(iam.version).toBe('LF.0.2');
    expect(iam.code.startsWith('IAM-v0.2')).toBe(true);
    expect(iam.code).toContain('/DELIVERY2:str75,dns50,frm62,fmt88,emp55,aut70');
  });
});

