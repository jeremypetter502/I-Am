import { describe, it, expect, beforeEach } from 'vitest';
const svc = require('../../src/ui/services/sessionService.js');

describe('sessionService', () => {
  beforeEach(() => {
    // provide a simple localStorage mock in case test harness lacks it
    global.localStorage = (function(){
      let store = {};
      return {
        getItem: (k) => (k in store) ? store[k] : null,
        setItem: (k,v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { store = {}; }
      };
    })();
  });

  it('saves, loads, detects and clears progress', () => {
    expect(svc.hasSaved()).toBe(false);
    const ok = svc.saveProgress('ipip', { responses: Array(10).fill(3), current: 5, expectedLength: 50 });
    expect(ok).toBe(true);
    expect(svc.hasSaved()).toBe(true);
    const data = svc.loadProgress();
    expect(data).toBeTruthy();
    expect(data.modules.ipip.responses.length).toBe(10);
    expect(data.modules.ipip.current).toBe(5);
    expect(typeof data.updated_at).toBe('string');
    const cleared = svc.clearProgress();
    expect(cleared).toBe(true);
    expect(svc.hasSaved()).toBe(false);
  });

  it('persists skills testAnswers confirmation state', () => {
    const ok = svc.saveProgress('skills', {
      responses: [3, null, null],
      current: 1,
      expectedLength: 35,
      testAnswers: {
        1: {
          interview_defense: true,
          day_one_autonomy: false,
          relevance_recency: true
        }
      }
    });
    expect(ok).toBe(true);

    const data = svc.loadProgress();
    expect(data.modules.skills.testAnswers).toBeTruthy();
    expect(data.modules.skills.testAnswers['1']).toEqual({
      interview_defense: true,
      day_one_autonomy: false,
      relevance_recency: true
    });
  });

  it('persists canonical state module payload', () => {
    const ok = svc.saveProgress('state', {
      responses: [1],
      current: 1,
      expectedLength: 1,
      state: {
        bandwidth: 101,
        mode: 'divergent',
        horizon: 'now',
        stakes: 'critical'
      }
    });
    expect(ok).toBe(true);

    const data = svc.loadProgress();
    expect(data.modules.state.state).toEqual({
      bandwidth: 100,
      mode: 'divergent',
      horizon: 'now',
      stakes: 'critical'
    });
  });

  it('persists and preserves per-module disabled state on reset', () => {
    const ok = svc.saveProgress('music', {
      responses: [3, 4, 5],
      current: 2,
      expectedLength: 20,
      disabled: true
    });
    expect(ok).toBe(true);

    expect(svc.clearModuleProgress('music')).toBe(true);

    const data = svc.loadProgress();
    expect(data.modules.music.responses).toEqual([]);
    expect(data.modules.music.current).toBe(0);
    expect(data.modules.music.disabled).toBe(true);
  });
});