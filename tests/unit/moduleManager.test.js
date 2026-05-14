import { describe, it, expect } from 'vitest';
const { retakeModule } = require('../../src/lib/modules/moduleManager');

describe('moduleManager', () => {
  it('retakeModule replaces module data and updates meta', () => {
    const profile = { modules: { ipip: { responses: [1,2,3] } }, modules_meta: [{ name: 'ipip', updated_at: 'old' }] };
    const updated = retakeModule(profile, 'ipip', { responses: [3,3,3] });
    expect(updated.modules.ipip.responses[0]).toBe(3);
    expect(Array.isArray(updated.modules_meta)).toBe(true);
    expect(updated.modules_meta.find(m=>m.name==='ipip')).toBeTruthy();
  });
});
