import { buildIam } from '../iam/iam.js';

// Deprecated alias for backward compatibility. Prefer `buildIam`.
export function buildPctx(scored, modules) {
  if (typeof console !== 'undefined' && console && console.warn) {
    console.warn('buildPctx is deprecated; use buildIam instead.');
  }
  return buildIam(scored, modules);
}
