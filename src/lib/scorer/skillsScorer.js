import { skillPositionMap } from '../iam/skillPositionMap.js';

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeLikert(value) {
  return clamp(Math.round(toNumber(value, 0) * 10), 0, 100);
}

function thresholdStatus(normalizedScore) {
  if (normalizedScore >= 60) return 'results_worthy';
  return 'omit';
}

export function scoreSkills(responses = []) {
  const outRaw = [];
  const outNormalized = [];
  const fullAssessment = [];
  const filtered = [];

  for (let i = 0; i < skillPositionMap.length; i += 1) {
    const entry = skillPositionMap[i];
    const response = clamp(toNumber(responses[i], 0), 0, 10);
    const normalizedScore = normalizeLikert(response);
    const status = thresholdStatus(normalizedScore);
    const include = status === 'results_worthy';

    const skill = {
      name: entry.name,
      index: i + 1,
      category: entry.category,
      raw_score: response,
      normalized_score: normalizedScore,
      threshold_status: status,
      listed_status: include ? (status === 'results_worthy' ? 'confirmed' : 'conditional') : 'excluded'
    };

    outRaw.push(response);
    outNormalized.push(normalizedScore);
    fullAssessment.push(skill);
    if (include) filtered.push(skill);
  }

  return {
    raw: outRaw,
    normalized: outNormalized,
    filtered,
    fullAssessment
  };
}

export default {
  scoreSkills
};
