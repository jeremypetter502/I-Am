import { describe, it, expect } from 'vitest';
import { scoreResponses, toContextFile } from '../../src/ui/services/profileService.js';

import { scoreAesthetics } from '../../src/lib/scorer/aestheticsScorer.js';
import { scoreMusic } from '../../src/lib/scorer/musicScorer.js';

describe('UI module integration', () => {
  it('includes aesthetics and music modules in ContextFile when responses provided', () => {
    // ipip dummy: 50 answers of 3
    const ipip = Array(50).fill(3);
    const scored = scoreResponses(ipip);

    const aestResponses = Array(18).fill(4);
    const musicResponses = Array(10).fill(2);

    const ctx = toContextFile(scored, { aesthetics: aestResponses, music: musicResponses });
    expect(ctx).toBeDefined();
    expect(ctx.profile).toBeDefined();
    expect(ctx.profile.modules).toBeDefined();
    expect(ctx.profile.modules.aesthetics).toBeDefined();
    expect(ctx.profile.modules.music).toBeDefined();
    expect(ctx.profile.modules.aesthetics.normalized).toBeDefined();
    expect(typeof Object.values(ctx.profile.modules.aesthetics.normalized)[0]).toBe('number');
    expect(ctx.profile.modules.music.normalized).toBeDefined();
    expect(typeof Object.values(ctx.profile.modules.music.normalized)[0]).toBe('number');
  });
});