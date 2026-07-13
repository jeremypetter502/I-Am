import { describe, it, expect } from 'vitest';
import { buildIam, buildCareerSegment, decodeCareerSegment, normalizeSoc8 } from '../../src/lib/iam/iam.js';

describe('iam career segment', () => {
  it('normalizes O*NET SOC code to 8 digits', () => {
    expect(normalizeSoc8('15-1252')).toBe('15125200');
    expect(normalizeSoc8('15-1252.01')).toBe('15125201');
    expect(normalizeSoc8('11-1021')).toBe('11102100');
    expect(normalizeSoc8('bad')).toBe('');
  });

  it('builds sparse Career segment with ordered skills >= 60', () => {
    const seg = buildCareerSegment('15125200', [
      { index: 24, normalized_score: 85 },
      { index: 1, normalized_score: 90 },
      { index: 18, normalized_score: 99 },
      { index: 33, normalized_score: 60 },
      { index: 2, normalized_score: 59 }
    ]);

    expect(seg).toBe('SKL:15125200S0190S1899S2485S3360');
  });

  it('decodes Career segment skill names from positions', () => {
    const decoded = decodeCareerSegment('/SKL:15125200S0190S1899S2485S3360');
    expect(decoded.soc8).toBe('15125200');
    expect(decoded.skills.map((skill) => skill.index)).toEqual([1, 18, 24, 33]);
    expect(decoded.skills.map((skill) => skill.name)).toEqual([
      'Reading Comprehension',
      'Troubleshooting',
      'Quality Control Analysis',
      'Systems Evaluation'
    ]);
  });

  it('returns long-form career IAM payload when base role and skills exist', () => {
    const iam = buildIam({}, {
      base: { onet: { soc_code: '15-1252', title: 'Software Developers' } },
      skills: [
        { index: 1, normalized_score: 90 },
        { index: 18, normalized_score: 99 },
        { index: 24, normalized_score: 85 },
        { index: 33, normalized_score: 60 }
      ]
    });

    expect(iam.version).toBe('LF.0.2');
    expect(iam.code.startsWith('IAM-v0.2')).toBe(true);
    expect(iam.code).toContain('/SKILL:15125200S0190S1899S2485S3360');
  });

  it('includes PERSONALITY + career segment when personality scores are present', () => {
    const iam = buildIam(
      { normalized: { O: 72, C: 88, E: 55, A: 60, N: 22 } },
      {
        base: { onet: { soc_code: '15-1252', title: 'Software Developers' } },
        skills: [
          { index: 1, normalized_score: 90 },
          { index: 18, normalized_score: 99 },
          { index: 24, normalized_score: 85 },
          { index: 33, normalized_score: 60 }
        ]
      }
    );

    expect(iam.version).toBe('LF.0.2');
    expect(iam.code).toContain('/PERSONALITY:openness72,conscientiousness88,extraversion55,agreeableness60,neuroticism22');
    expect(iam.code).toContain('/SKILL:15125200S0190S1899S2485S3360');
  });
});

