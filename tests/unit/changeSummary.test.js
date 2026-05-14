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
});
