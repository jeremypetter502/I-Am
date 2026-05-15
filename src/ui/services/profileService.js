export async function loadQuestions() {
  // Attempt to fetch the question bank at runtime first (dev server static asset).
  // If that fails (404/CORS/etc), fall back to a Vite raw import so the file is bundled by Vite.
  const parse = (txt) => {
    const lines = txt.split(/\r?\n/);
    // Only keep lines that look like numbered items (e.g., "1. ...") and strip the prefix
    return lines
      .map(l => l.trim())
      .filter(l => /^\d+\./.test(l))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());
  };

  try {
    if (typeof fetch === 'function') {
      const res = await fetch('/specs/questions/ipip_50_respondent.txt');
      if (res.ok) {
        const txt = await res.text();
        return parse(txt);
      }
    }
  } catch (e) {
    // continue to fallback
  }

  // Fallback: import via Vite raw import so the file is available even if fetch path isn't served.
  try {
    // In Node test environments, import of text with ?raw may not be supported. Try reading from disk when running under Node.
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const p = path.resolve(process.cwd(), 'specs', 'questions', 'ipip_50_respondent.txt');
        const txt = await fs.promises.readFile(p, 'utf8');
        return parse(txt);
      } catch (fsErr) {
        // fall through to dynamic import attempt
      }
    }

    const mod = await import('../../../specs/questions/ipip_50_respondent.txt?raw');
    const txt = mod?.default ?? mod;
    return parse(txt);
  } catch (e) {
    throw new Error('Failed to load questions: ' + (e && e.message ? e.message : String(e)));
  }
}

export function scoreResponses(responses) {
  if (!Array.isArray(responses) || responses.length !== 50) throw new Error('responses must be length 50');
  const indicesByTrait = {
    O: [41,42,43,44,45,46,47,48,49,50],
    C: [21,22,23,24,25,26,27,28,29,30],
    E: [1,2,3,4,5,6,7,8,9,10],
    A: [11,12,13,14,15,16,17,18,19,20],
    N: [31,32,33,34,35,36,37,38,39,40]
  };
  const REVERSE_INDICES = {
    O: [42,44,46,48,50],
    C: [22,24,26,28,30],
    E: [2,4,6,8,10],
    A: [12,14,16,18,20],
    N: [32,34,36,38,40]
  };
  const raw = { O:0, C:0, E:0, A:0, N:0 };
  const normalized = { O:0, C:0, E:0, A:0, N:0 };
  for (const t of Object.keys(indicesByTrait)) {
    let sum = 0;
    for (const idx of indicesByTrait[t]) {
      const resp = responses[idx-1];
      const isRev = REVERSE_INDICES[t].includes(idx);
      const val = isRev ? (6 - resp) : resp;
      sum += val;
    }
    raw[t] = sum;
    normalized[t] = Math.round((((sum - 10) / 40) * 100 + Number.EPSILON) * 100) / 100;
  }
  return { raw, normalized };
}

export function toContextFile(scored, moduleResponses = {}) {
  const now = new Date().toISOString();
  const modules = {
    ipip: {
      responses: Array.isArray(moduleResponses.ipip) ? moduleResponses.ipip : [],
      raw_scores: scored.raw,
      normalized: scored.normalized,
      completed: Array.isArray(moduleResponses.ipip) ? moduleResponses.ipip.length >= 50 : true,
      last_updated: now,
      scoring_version: 'ipip-v1'
    }
  };

  // If aesthetics responses provided and external scorer present, compute and include
  if (moduleResponses.aesthetics && typeof externalAesthetics === 'function') {
    try {
      const aest = externalAesthetics(moduleResponses.aesthetics);
      modules.aesthetics = Object.assign({ responses: moduleResponses.aesthetics, last_updated: now }, aest);
    } catch (e) {
      // ignore scorer errors
    }
  }

  // If music responses provided and external scorer present, compute and include
  if (moduleResponses.music && typeof externalMusic === 'function') {
    try {
      const mus = externalMusic(moduleResponses.music);
      modules.music = Object.assign({ responses: moduleResponses.music, last_updated: now }, mus);
    } catch (e) {
      // ignore scorer errors
    }
  }

  return {
    schema_version: '1.0.0',
    generated_at: now,
    profile: {
      scores: scored.normalized,
      raw_scores: scored.raw,
      modules
    }
  };
}

export function toPbtxt(json) {
  // simple stub: protobuf text-format is not implemented yet; use JSON as fallback
  return JSON.stringify(json, null, 2);
}

export function scoreAndExport(responses) {
  const scored = scoreResponses(responses);
  return toContextFile(scored);
}

// Expose module scorers if available
let externalAesthetics = null;
let externalMusic = null;
try { externalAesthetics = require('../../lib/scorer/aestheticsScorer.js').scoreAesthetics; } catch (e) {}
try { externalMusic = require('../../lib/scorer/musicScorer.js').scoreMusic; } catch (e) {}

export function scoreAestheticsIfAvailable(responses){
  if (typeof externalAesthetics === 'function') return externalAesthetics(responses);
  return null;
}

export function scoreMusicIfAvailable(responses){
  if (typeof externalMusic === 'function') return externalMusic(responses);
  return null;
}

// CommonJS compatibility for tests and scripts that use require()
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadQuestions, scoreResponses, toContextFile, toPbtxt, scoreAndExport, scoreAestheticsIfAvailable, scoreMusicIfAvailable };
}
