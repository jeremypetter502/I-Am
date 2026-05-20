import { describe, it, expect } from 'vitest';
const sessionService = require('../../src/ui/services/sessionService.js');

function ensureLocalStorage() {
  const store = new Map();
  const mock = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
  Object.defineProperty(globalThis, 'localStorage', { value: mock, configurable: true, writable: true });
  if (typeof global !== 'undefined') {
    Object.defineProperty(global, 'localStorage', { value: mock, configurable: true, writable: true });
  }
}

describe('UI base context persistence', () => {
  it('saves and restores base context draft', () => {
    ensureLocalStorage();
    const base = {
      onet: { soc_code: '15-1252', title: 'Software Developers' },
      job_title: 'Frontend Engineer',
      company: 'Acme'
    };
    const ok = sessionService.saveBaseContext(base);
    expect(ok).toBe(true);
    const loaded = sessionService.loadBaseContext();
    expect(loaded.job_title).toBe('Frontend Engineer');
    expect(loaded.onet.soc_code).toBe('15-1252');
    sessionService.clearBaseContext();
  });
});
