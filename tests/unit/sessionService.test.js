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
});