import { describe, it, expect } from 'vitest';
const fs = require('fs');
const { importJson } = require('../../src/lib/importer/index');
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

  it('imports module disabled flags without dropping saved responses', async () => {
    const filePath = path.join(os.tmpdir(), `importer-disabled-${Date.now()}.json`);
    const contextFile = toContextFile(
      { id: 'p1', summary: 's', traits: { O: 10, C: 20, E: 30, A: 40, N: 50 } },
      {
        ipipResponses: Array(50).fill(3),
        communication: {
          responses: Array(20).fill(3),
          result: {
            responses: Array(20).fill(3),
            raw_trait_scores: { driver: 10, analytical: 10, expressive: 10, amiable: 10 },
            normalized_trait_scores: { driver: 40, analytical: 45, expressive: 50, amiable: 55 },
            completed: true
          },
          disabled: true
        }
      }
    );

    fs.writeFileSync(filePath, JSON.stringify(contextFile, null, 2), 'utf8');
    const result = await importJson(filePath);
    const root = resolveRoot(result);

    expect(root.modules.communication.disabled).toBe(true);
    expect(root.modules.communication.responses).toHaveLength(20);
  });

  it('preserves disabled flags for skills and state on import', async () => {
    const filePath = path.join(os.tmpdir(), `importer-disabled-rt-${Date.now()}.json`);
    const contextFile = toContextFile(
      { id: 'p1', summary: 's', traits: { O: 10, C: 20, E: 30, A: 40, N: 50 } },
      {
        ipipResponses: Array(50).fill(3),
        skills: {
          responses: [
            { name: 'Reading Comprehension', index: 1, raw_score: 9 }
          ],
          disabled: true
        },
        state: {
          bandwidth: 30,
          mode: 'convergent',
          horizon: 'now',
          stakes: 'critical',
          disabled: true
        }
      }
    );

    fs.writeFileSync(filePath, JSON.stringify(contextFile, null, 2), 'utf8');
    const result = await importJson(filePath);
    const root = resolveRoot(result);

    expect(root.modules.skills.disabled).toBe(true);
    expect(root.modules.state.disabled).toBe(true);
  });

  it('imports compact skills raw-score arrays without mutation', async () => {
    const filePath = path.join(os.tmpdir(), `importer-compact-skills-${Date.now()}.json`);
    const payload = {
      schema_version: '0.1',
      generated_at: new Date().toISOString(),
      profile: {
        modules: {
          skills: {
            responses: [9, 6, 6, 4, 6],
            completed: false
          }
        }
      }
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    const result = await importJson(filePath);
    const root = resolveRoot(result);

    expect(root.modules.skills.responses).toEqual([9, 6, 6, 4, 6]);
    expect(root.modules.skills.disabled).toBe(false);
  });

  it('normalizes missing disabled flags to false for module objects', async () => {
    const filePath = path.join(os.tmpdir(), `importer-disabled-defaults-${Date.now()}.json`);
    const payload = {
      schema_version: '0.1',
      generated_at: new Date().toISOString(),
      profile: {
        modules: {
          ipip: {
            responses: Array(50).fill(3),
            raw_trait_scores: {},
            normalized_trait_scores: {},
            completed: true,
            last_updated: new Date().toISOString()
          },
          music: {
            responses: [1, 2, 3],
            completed: false,
            last_updated: new Date().toISOString()
          }
        }
      }
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    const result = await importJson(filePath);
    const root = resolveRoot(result);

    expect(root.modules.ipip.disabled).toBe(false);
    expect(root.modules.music.disabled).toBe(false);
  });
});


