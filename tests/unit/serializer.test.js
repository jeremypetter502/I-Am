import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const { scoreIpip } = require('../../src/lib/scorer/ipipScorer');
const { toContextFile } = require('../../src/lib/serializer/toContextFile');
const { decodeCareerSegment } = require('../../src/lib/iam/iam.js');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { importJson } = require('../../src/lib/importer/index');

function resolveRoot(importResult) {
  let root = importResult?.profile || {};
  if (root && typeof root === 'object' && root.profile && !root.modules) root = root.profile;
  if (root && typeof root === 'object' && root.profile && !root.modules) root = root.profile;
  return root || {};
}

describe('Serializer + schema', () => {
  it('generates a ContextFile that validates against schema', () => {
    const responses = Array(50).fill(3);
    const scored = scoreIpip(responses);
    const ctx = toContextFile({ id: 'test', summary: 's', traits: { raw: scored.raw, normalized: scored.normalized } }, { ipipResponses: responses });
    const schema = JSON.parse(fs.readFileSync('specs/001-personality-context-site/contextfile.schema.json','utf8'));
    const ajv = new Ajv({ allErrors: true, strict:false }); addFormats(ajv);
    const valid = ajv.validate(schema, ctx);
    if (!valid) console.error(ajv.errors);
    expect(valid).toBe(true);
  });

  it('accepts optional base context and communication module fields', () => {
    const responses = Array(50).fill(3);
    const scored = scoreIpip(responses);
    const communication = {
      responses: Array(20).fill(3),
      raw_trait_scores: { driver: 15, analytical: 15, expressive: 15, amiable: 15 },
      normalized_trait_scores: { driver: 50, analytical: 50, expressive: 50, amiable: 50 },
      completed: true,
      last_updated: '2026-05-18T00:00:00Z'
    };
    const baseContext = {
      onet: { soc_code: '15-1252', title: 'Software Developers' },
      job_title: 'Engineer',
      locale: 'en-US'
    };

    const ctx = toContextFile(
      { id: 'test', summary: 's', traits: { raw: scored.raw, normalized: scored.normalized } },
      { ipipResponses: responses, communication, baseContext }
    );

    const schema = JSON.parse(fs.readFileSync('specs/001-personality-context-site/contextfile.schema.json','utf8'));
    const ajv = new Ajv({ allErrors: true, strict:false }); addFormats(ajv);
    const valid = ajv.validate(schema, ctx);
    if (!valid) console.error(ajv.errors);
    expect(valid).toBe(true);
    expect(ctx.profile.base).toBeTruthy();
    expect(ctx.profile.modules.communication).toBeTruthy();
  });

  it('round-trips base.onet and skills without loss', async () => {
    const sample = toContextFile(
      { id: 'career-rt', summary: 'career round trip', traits: { O: 10, C: 20, E: 30, A: 40, N: 50 } },
      {
        ipipResponses: Array(50).fill(3),
        baseContext: {
          onet: { soc_code: '15-1252', title: 'Software Developers' },
          job_title: 'Software Developer'
        },
        skills: {
          responses: [
            { index: 1, name: 'Reading Comprehension', normalized_score: 90, test_results: { interview: true, autonomy: true, recency: true } },
            { index: 18, name: 'Troubleshooting', normalized_score: 99, test_results: { interview: true, autonomy: true, recency: true } },
            { index: 24, name: 'Quality Control Analysis', normalized_score: 85, test_results: { interview: true, autonomy: true, recency: true } },
            { index: 33, name: 'Systems Evaluation', normalized_score: 60, test_results: { interview: true, autonomy: true, recency: true } }
          ]
        }
      }
    );

    const filePath = path.join(os.tmpdir(), `iam-roundtrip-${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(sample, null, 2), 'utf8');

    const imported = await importJson(filePath);
    const importedRoot = resolveRoot(imported);
    expect(importedRoot.base.onet).toEqual({ soc_code: '15-1252', title: 'Software Developers' });
    expect(importedRoot.modules.skills.responses).toHaveLength(4);
    expect(importedRoot.modules.skills.responses[0].name).toBe('Reading Comprehension');

    const decoded = decodeCareerSegment('/CAR15125200S0190S1899S2485S3360');
    expect(decoded.soc8).toBe('15125200');
    expect(decoded.skills.map((skill) => skill.name)).toEqual([
      'Reading Comprehension',
      'Troubleshooting',
      'Quality Control Analysis',
      'Systems Evaluation'
    ]);
  });

  it('serializes and re-imports state module and skills testAnswers', async () => {
    const sample = toContextFile(
      {
        id: 'state-rt',
        summary: 'state round trip',
        traits: {
          raw: { O: 20, C: 24, E: 28, A: 32, N: 36 },
          normalized: { O: 10, C: 20, E: 30, A: 40, N: 50 }
        }
      },
      {
        ipipResponses: Array(50).fill(3),
        state: { bandwidth: 30, mode: 'convergent', horizon: 'now', stakes: 'critical' },
        skills: {
          responses: [
            {
              name: 'Reading Comprehension',
              index: 1,
              normalized_score: 90,
              listed_status: 'confirmed'
            }
          ],
          testAnswers: {
            1: {
              interview_defense: true,
              day_one_autonomy: true,
              relevance_recency: false
            }
          }
        }
      }
    );

    const schema = JSON.parse(fs.readFileSync('specs/001-personality-context-site/contextfile.schema.json','utf8'));
    const ajv = new Ajv({ allErrors: true, strict:false }); addFormats(ajv);
    expect(ajv.validate(schema, sample)).toBe(true);

    const filePath = path.join(os.tmpdir(), `state-rt-${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(sample, null, 2), 'utf8');

    const imported = await importJson(filePath);
    const root = resolveRoot(imported);
    expect(root.modules.state).toBeTruthy();
    expect(root.modules.state.horizon).toBe('now');
    expect(root.modules.skills.testAnswers['1']).toEqual({
      interview_defense: true,
      day_one_autonomy: true,
      relevance_recency: false
    });
  });
});
