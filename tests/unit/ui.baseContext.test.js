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
      birth_month: 5,
      birth_day: 14,
      birth_year: 1990,
      gender: 'female',
      job_title: 'Frontend Engineer',
      company: 'Acme'
    };
    const ok = sessionService.saveBaseContext(base);
    expect(ok).toBe(true);
    const loaded = sessionService.loadBaseContext();
    expect(loaded.birth_month).toBe(5);
    expect(loaded.birth_day).toBe(14);
    expect(loaded.birth_year).toBe(1990);
    expect(loaded.gender).toBe('female');
    expect(loaded.job_title).toBe('Frontend Engineer');
    expect(loaded.onet.soc_code).toBe('15-1252');
    sessionService.clearBaseContext();
  });
});
