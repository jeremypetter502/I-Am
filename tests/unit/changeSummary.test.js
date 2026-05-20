import { describe, it, expect } from 'vitest';
const { diffProfiles, summaryText } = require('../../src/lib/changeSummary');

describe('changeSummary', () => {
  it('diffProfiles detects added and updated modules', () => {
    const oldP = { id: 'p1', modules: { ipip: { a: 1 } } };
    const newP = { id: 'p1', modules: { ipip: { a: 2 }, music: { factors: {} } } };
    const d = diffProfiles(oldP, newP);
    expect(d.added).toContain('module:music');
    expect(d.updated).toContain('module:ipip');
  });

  it('summaryText composes human readable text', () => {
    const d = { added: ['module:music'], removed: [], updated: ['module:ipip'], inferred: [] };
    const s = summaryText(d);
    expect(s).toMatch(/Added/);
    expect(s).toMatch(/Updated/);
  });

  it('summarizes skills module confirmed and conditional counts', () => {
    const oldP = { modules: {} };
    const newP = {
      modules: {
        skills: {
          filtered: [
            { name: 'Critical Thinking', listed_status: 'confirmed' },
            { name: 'Programming', listed_status: 'confirmed' },
            { name: 'Time Management', listed_status: 'conditional' }
          ]
        }
      }
    };
    const d = diffProfiles(oldP, newP);
    const s = summaryText(d);
    expect(s).toMatch(/Skills Assessment module/);
    expect(s).toMatch(/2 confirmed skills/);
    expect(s).toMatch(/1 conditional skills/);
  });
});
