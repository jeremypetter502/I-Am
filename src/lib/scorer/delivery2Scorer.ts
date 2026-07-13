export interface Delivery2Scores {
  str: number;
  dns: number;
  frm: number;
  fmt: number;
  emp: number;
  aut: number;
}

export interface Delivery2ScoreResult {
  raw: Delivery2Scores;
  normalized: Delivery2Scores;
  count: number;
}

type MetricItem = {
  i: number;
  reverse?: boolean;
};

const METRIC_ITEMS: Record<keyof Delivery2Scores, MetricItem[]> = {
  str: [{ i: 1 }, { i: 2 }, { i: 3, reverse: true }, { i: 4 }],
  dns: [{ i: 5 }, { i: 6, reverse: true }, { i: 7 }, { i: 8, reverse: true }],
  frm: [{ i: 9 }, { i: 10, reverse: true }, { i: 11 }, { i: 12, reverse: true }],
  fmt: [{ i: 13 }, { i: 14, reverse: true }, { i: 15 }, { i: 16, reverse: true }],
  emp: [{ i: 17 }, { i: 18, reverse: true }, { i: 19 }, { i: 20, reverse: true }],
  aut: [{ i: 21 }, { i: 22, reverse: true }, { i: 23 }, { i: 24, reverse: true }]
};

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toAnswerNumber(raw: number | null | undefined): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 3;
  if (value < 1 || value > 5) return 3;
  return value;
}

function toNormalized(raw: number, reverse = false): number {
  const answered = toAnswerNumber(raw);
  const value = reverse ? (6 - answered) : answered;
  return ((value - 1) / 4) * 100;
}

function average(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function scoreDelivery2(responses: Array<number | null | undefined>): Delivery2ScoreResult {
  const raw = {} as Delivery2Scores;
  const normalized = {} as Delivery2Scores;

  for (const [metric, items] of Object.entries(METRIC_ITEMS) as Array<[keyof Delivery2Scores, MetricItem[]]>) {
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