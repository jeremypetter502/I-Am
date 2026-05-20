import { skillPositionMap } from '../iam/skillPositionMap.js';

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeLikert(value) {
  return clamp(Math.round(toNumber(value, 0) * 20), 0, 100);
}

function resolveTestResults(index, normalizedScore, testAnswers) {
  const fromInput = testAnswers && typeof testAnswers === 'object' ? testAnswers[index] : null;
  const defaults = {
    interview_defense: false,
    day_one_autonomy: false,
    relevance_recency: false
  };

  if (!fromInput || typeof fromInput !== 'object') {
    return normalizedScore < 50
      ? { interview_defense: true, day_one_autonomy: true, relevance_recency: true }
      : defaults;
  }

  return {
    interview_defense: Boolean(fromInput.interview_defense),
    day_one_autonomy: Boolean(fromInput.day_one_autonomy),
    relevance_recency: Boolean(fromInput.relevance_recency)
  };
}

function thresholdStatus(normalizedScore) {
  if (normalizedScore >= 60) return 'results_worthy';
  if (normalizedScore >= 35) return 'conditional';
  return 'omit';
}

function canListSkill(normalizedScore, status, tests) {
  if (status === 'omit') return false;
  if (normalizedScore >= 50) {
    return Boolean(tests.interview_defense && tests.day_one_autonomy && tests.relevance_recency);
  }
  return true;
}

export function scoreSkills(responses = [], testAnswers = {}) {
  const outRaw = [];
  const outNormalized = [];
  const fullAssessment = [];
  const filtered = [];

  for (let i = 0; i < skillPositionMap.length; i += 1) {
    const entry = skillPositionMap[i];
    const response = clamp(toNumber(responses[i], 0), 0, 5);
    const normalizedScore = normalizeLikert(response);
    const status = thresholdStatus(normalizedScore);
    const tests = resolveTestResults(i + 1, normalizedScore, testAnswers);
    const include = canListSkill(normalizedScore, status, tests);

    const skill = {
      name: entry.name,
      index: i + 1,
      category: entry.category,
      raw_score: response,
      normalized_score: normalizedScore,
      threshold_status: status,
      test_results: tests,
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
