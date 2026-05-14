export async function loadQuestions() {
  // load ipip 50 question bank from specs folder
  const res = await fetch('/specs/questions/ipip_50_respondent.txt');
  if (!res.ok) throw new Error('Failed to load questions');
  const txt = await res.text();
  const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines;
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

export function toContextFile(scored) {
  const now = new Date().toISOString();
  return {
    schema_version: '1.0.0',
    generated_at: now,
    profile: {
      scores: scored.normalized,
      raw_scores: scored.raw,
      modules: {
        ipip: {
          raw_scores: scored.raw,
          normalized: scored.normalized
        }
      }
    }
  };
}

export function toPbtxt(json) {
  // simple stub: protobuf text-format is not implemented yet; use JSON as fallback
  return JSON.stringify(json, null, 2);
}
