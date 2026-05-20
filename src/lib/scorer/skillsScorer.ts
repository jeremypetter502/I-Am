import { skillPositionMap } from '../iam/skillPositionMap.js';

export type SkillTestResults = {
  interview_defense: boolean;
  day_one_autonomy: boolean;
  relevance_recency: boolean;
};

export type SkillAssessment = {
  name: string;
  index: number;
  category: string;
  raw_score: number;
  normalized_score: number;
  threshold_status: 'results_worthy' | 'conditional' | 'omit';
  test_results: SkillTestResults;
  listed_status: 'confirmed' | 'conditional' | 'excluded';
};

export type SkillsScoreResult = {
  raw: number[];
  normalized: number[];
  filtered: SkillAssessment[];
  fullAssessment: SkillAssessment[];
};

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeLikert(value: number): number {
  return clamp(Math.round(toNumber(value, 0) * 20), 0, 100);
}

function resolveTestResults(index: number, normalizedScore: number, testAnswers: Record<number, Partial<SkillTestResults>>): SkillTestResults {
  const fromInput = testAnswers && typeof testAnswers === 'object' ? testAnswers[index] : null;

  if (!fromInput || typeof fromInput !== 'object') {
    if (normalizedScore < 50) {
      return { interview_defense: true, day_one_autonomy: true, relevance_recency: true };
    }
    return { interview_defense: false, day_one_autonomy: false, relevance_recency: false };
  }

  return {
    interview_defense: Boolean(fromInput.interview_defense),
    day_one_autonomy: Boolean(fromInput.day_one_autonomy),
    relevance_recency: Boolean(fromInput.relevance_recency)
  };
}

function thresholdStatus(normalizedScore: number): 'results_worthy' | 'conditional' | 'omit' {
  if (normalizedScore >= 60) return 'results_worthy';
  if (normalizedScore >= 35) return 'conditional';
  return 'omit';
}

function canListSkill(normalizedScore: number, status: 'results_worthy' | 'conditional' | 'omit', tests: SkillTestResults): boolean {
  if (status === 'omit') return false;
  if (normalizedScore >= 50) {
    return Boolean(tests.interview_defense && tests.day_one_autonomy && tests.relevance_recency);
  }
  return true;
}

export function scoreSkills(responses: number[] = [], testAnswers: Record<number, Partial<SkillTestResults>> = {}): SkillsScoreResult {
  const outRaw: number[] = [];
  const outNormalized: number[] = [];
  const fullAssessment: SkillAssessment[] = [];
  const filtered: SkillAssessment[] = [];

  for (let i = 0; i < skillPositionMap.length; i += 1) {
    const entry = skillPositionMap[i];
    const response = clamp(toNumber(responses[i], 0), 0, 5);
    const normalizedScore = normalizeLikert(response);
    const status = thresholdStatus(normalizedScore);
    const tests = resolveTestResults(i + 1, normalizedScore, testAnswers);
    const include = canListSkill(normalizedScore, status, tests);

    const skill: SkillAssessment = {
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
