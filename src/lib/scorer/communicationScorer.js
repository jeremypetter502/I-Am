const TRAIT_ITEMS = {
  driver: [1, 2, 3, 4, 5],
  analytical: [6, 7, 8, 9, 10],
  expressive: [11, 12, 13, 14, 15],
  amiable: [16, 17, 18, 19, 20]
};

function normalizeResponse(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1 || num > 5) return 3;
  return Math.round(num);
}

function normalizeTraitRaw(raw) {
  const normalized = ((raw - 5) / 20) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

export function scoreCommunication(responses) {
  const input = Array.isArray(responses) ? responses : [];
  const normalizedResponses = Array.from({ length: 20 }, (_, idx) => normalizeResponse(input[idx]));

  const raw_trait_scores = {};
  const normalized_trait_scores = {};

  for (const [trait, items] of Object.entries(TRAIT_ITEMS)) {
    const raw = items.reduce((sum, itemNum) => sum + normalizeResponse(normalizedResponses[itemNum - 1]), 0);
    raw_trait_scores[trait] = raw;
    normalized_trait_scores[trait] = normalizeTraitRaw(raw);
  }

  return {
    responses: normalizedResponses,
    raw_trait_scores,
    normalized_trait_scores,
    completed: normalizedResponses.length === 20,
    last_updated: new Date().toISOString()
  };
}
