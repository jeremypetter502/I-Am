import { describe, it, expect } from 'vitest';
const fs = require('fs');
const { importJson } = require('../../src/lib/importer/index');
const { serializePbtxt, parsePbtxt } = require('../../src/lib/importer/pbtxt');
const { toContextFile } = require('../../src/lib/serializer/toContextFile');
const os = require('os');
const path = require('path');

function resolveRoot(importResult) {
  let root = importResult?.profile || {};
  if (root && typeof root === 'object' && root.profile && !root.modules) root = root.profile;
  if (root && typeof root === 'object' && root.profile && !root.modules) root = root.profile;
  return root || {};
}

describe('importer', () => {
  it('importJson round-trips a serialized ContextFile with base.onet and skills', async () => {
    const filePath = path.join(os.tmpdir(), `importer-roundtrip-${Date.now()}.json`);
    const contextFile = toContextFile(
      { id: 'p1', summary: 's', traits: { O: 10, C: 20, E: 30, A: 40, N: 50 } },
      {
        ipipResponses: Array(50).fill(3),
        baseContext: { onet: { soc_code: '15-1252', title: 'Software Developers' } },
        state: { bandwidth: 70, mode: 'divergent', horizon: 'long', stakes: 'casual' },
        skills: {
          responses: [
            { index: 1, name: 'Reading Comprehension', normalized_score: 90 },
            { index: 18, name: 'Troubleshooting', normalized_score: 99 }
          ]
        }
      }
    );

    fs.writeFileSync(filePath, JSON.stringify(contextFile, null, 2), 'utf8');
    const result = await importJson(filePath);
    const root = resolveRoot(result);

    expect(root.base.onet).toEqual({ soc_code: '15-1252', title: 'Software Developers' });
    expect(root.modules.state).toBeTruthy();
    expect(root.modules.state.mode).toBe('divergent');
    expect(root.modules.skills.responses).toHaveLength(2);
    expect(root.modules.skills.responses[1].name).toBe('Troubleshooting');
  });

  it('pbtxt round-trip', () => {
    const obj = { hello: 'world', profile: { id: 'p1' } };
    const txt = serializePbtxt(obj);
    const parsed = parsePbtxt(txt);
    expect(parsed).toEqual(obj);
  });

  it('preserves skills filtered/test fields across export-import-reexport', async () => {
    const firstPath = path.join(os.tmpdir(), `skills-roundtrip-first-${Date.now()}.json`);
    const secondPath = path.join(os.tmpdir(), `skills-roundtrip-second-${Date.now()}.json`);

    const exported = toContextFile(
      { id: 'skills-rt', summary: 'skills rt', traits: { O: 10, C: 20, E: 30, A: 40, N: 50 } },
      {
        ipipResponses: Array(50).fill(3),
        skills: {
          responses: [
            {
              name: 'Reading Comprehension',
              index: 1,
              normalized_score: 90,
              test_results: { interview_defense: true, day_one_autonomy: true, relevance_recency: true },
              listed_status: 'confirmed'
            }
          ],
          filtered: [
            {
              name: 'Reading Comprehension',
              index: 1,
              normalized_score: 90,
              test_results: { interview_defense: true, day_one_autonomy: true, relevance_recency: true },
              listed_status: 'confirmed'
            }
          ],
          testAnswers: {
            1: {
              interview_defense: true,
              day_one_autonomy: true,
              relevance_recency: true
            }
          }
        }
      }
    );

    fs.writeFileSync(firstPath, JSON.stringify(exported, null, 2), 'utf8');
    const imported = await importJson(firstPath);
    fs.writeFileSync(secondPath, JSON.stringify({ profile: imported.profile }, null, 2), "utf8");
    const reimported = await importJson(secondPath);
    const reimportedRoot = resolveRoot(reimported);

    const skill = reimportedRoot.modules.skills.filtered[0];
    expect(skill.name).toBe('Reading Comprehension');
    expect(skill.normalized_score).toBe(90);
    expect(skill.test_results.interview_defense).toBe(true);
    expect(skill.listed_status).toBe('confirmed');
    expect(reimportedRoot.modules.skills.testAnswers['1']).toEqual({
      interview_defense: true,
      day_one_autonomy: true,
      relevance_recency: true
    });
  });
});


