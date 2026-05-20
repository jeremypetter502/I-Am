import { describe, it, expect } from 'vitest';
const { toContextFile } = require('../../src/lib/serializer/toContextFile.js');

describe('Serializer preamble and module metadata', () => {
  it('omits preamble and keeps ipip metadata (completed, last_updated)', () => {
    const input = { id: 't1', summary: 's', traits: { raw: { O: 30, C: 30, E: 30, A: 30, N: 30 }, normalized: { O: 50, C:50, E:50, A:50, N:50 } } };
    const ctx = toContextFile(input, { ipipResponses: Array(50).fill(3), lastUpdated: '2026-05-14T00:00:00Z' });
    expect(ctx.preamble).toBeUndefined();
    expect(ctx).toHaveProperty('profile.modules.ipip.completed');
    expect(ctx.profile.modules.ipip.completed).toBe(true);
    expect(ctx.profile.modules.ipip).toHaveProperty('last_updated');
    expect(typeof ctx.profile.modules.ipip.last_updated).toBe('string');
  });
});