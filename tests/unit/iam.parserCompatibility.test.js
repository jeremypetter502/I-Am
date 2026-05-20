import { describe, it, expect } from 'vitest';
import { decodeCareerSegment, buildIam } from '../../src/lib/iam/iam.js';

describe('IAM parser compatibility', () => {
  it('parses v0.4 sparse career segment with /CAR prefix', () => {
    const decoded = decodeCareerSegment('IAM/0.4:O72C88E55A60N22/CAR15113200S0190S1899S2485S3360');
    expect(decoded).toBeTruthy();
    expect(decoded.soc8).toBe('15113200');
    expect(decoded.skills.map((s) => s.index)).toEqual([1, 18, 24, 33]);
  });

  it('returns null for older strings with no career segment', () => {
    const v01 = decodeCareerSegment('IAM/0.1:O70C60E50A40N30');
    const v02 = decodeCareerSegment('IAM/0.2:O70C60E50A40N30/COMM/DRV85ANC40EXP20AMB15');
    const v03 = decodeCareerSegment('IAM/0.3:O70C60E50A40N30/AES/MIN80');
    expect(v01).toBe(null);
    expect(v02).toBe(null);
    expect(v03).toBe(null);
  });

  it('keeps legacy generation behavior when no career data is present', () => {
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
    expect(iam.code).toContain('IAM/0.2');
    expect(iam.code).toContain('/COMM/DRV85ANC40EXP20AMB15');
  });
});
