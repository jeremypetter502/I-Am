import { describe, it, expect } from 'vitest';
const { scoreCommunicationIfAvailable, toContextFile } = require('../../src/ui/services/profileService.js');

describe('UI communication module integration', () => {
  it('scores communication responses and includes module in context export', () => {
    const communicationResponses = Array(20).fill(4);
    const communication = scoreCommunicationIfAvailable(communicationResponses);
    expect(communication).toBeTruthy();
    expect(communication.responses.length).toBe(20);

    const scored = { raw: { O: 30, C: 30, E: 30, A: 30, N: 30 }, normalized: { O: 60, C: 60, E: 60, A: 60, N: 60 } };
    const ctx = toContextFile(scored, {
      ipip: Array(50).fill(3),
      communication: { responses: communicationResponses, result: communication }
    });

    expect(ctx.profile.modules.communication).toBeTruthy();
    expect(ctx.profile.modules.communication.normalized_trait_scores.driver).toBeGreaterThanOrEqual(0);
  });
});
