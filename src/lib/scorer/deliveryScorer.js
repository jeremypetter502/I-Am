function normalizeResponse(value) {
  return Math.round((((value - 1) / 4) * 100 + Number.EPSILON) * 100) / 100;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toAnswerNumber(raw) {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 3;
  if (value < 1 || value > 5) return 3;
  return value;
}

function toNormalized(raw, reverse = false) {
  const answered = toAnswerNumber(raw);
  const value = reverse ? (6 - answered) : answered;
  return normalizeResponse(value);
}

function average(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const METRIC_ITEMS = {
  def: [{ i: 1 }, { i: 4 }],
  peer: [{ i: 2 }],
  chl: [{ i: 3 }, { i: 5 }, { i: 6, reverse: true }],
  dns: [{ i: 8, reverse: true }, { i: 11 }],
  aud: [{ i: 9 }],
  str: [{ i: 7 }, { i: 10 }, { i: 12, reverse: true }],
  abs: [{ i: 13 }, { i: 16 }],
  fmt: [{ i: 14 }, { i: 17, reverse: true }],
  vbs: [{ i: 15, reverse: true }, { i: 18 }],
  emp: [{ i: 19 }, { i: 22, reverse: true }],
  cnd: [{ i: 20 }, { i: 23, reverse: true }],
  hmr: [{ i: 21 }, { i: 24, reverse: true }],
  aut: [{ i: 25 }, { i: 27 }, { i: 29 }],
  bur: [{ i: 26 }, { i: 28 }, { i: 30 }]
};

export function scoreDelivery(responses) {
  const normalized = {};
  const raw = {};

  for (const [metric, items] of Object.entries(METRIC_ITEMS)) {
    const rawValues = items.map(({ i, reverse }) => {
      const answered = toAnswerNumber(responses?.[i - 1]);
      return reverse ? (6 - answered) : answered;
    });
    const normalizedValues = items.map(({ i, reverse }) => toNormalized(responses?.[i - 1], reverse));

    raw[metric] = round2(average(rawValues));
    normalized[metric] = round2(average(normalizedValues));
  }

  return {
    raw,
    normalized,
    count: Array.isArray(responses) ? responses.length : 0
  };
}

export const scoreLens = scoreDelivery;
