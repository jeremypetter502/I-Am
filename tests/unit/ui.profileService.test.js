import { describe, it, expect } from 'vitest';
const { scoreAndExport } = require('../../src/ui/services/profileService');

describe('UI profileService', () => {
  it('produces a ContextFile from 50 responses', () => {
    const responses = Array(50).fill(3);
    const ctx = scoreAndExport(responses);
    expect(ctx).toBeTruthy();
    expect(ctx.profile).toBeTruthy();
  });
});
