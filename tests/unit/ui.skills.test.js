// @vitest-environment jsdom
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Skills from '../../src/ui/components/Skills.svelte';
import { scoreSkills } from '../../src/lib/scorer/skillsScorer.js';
import { toContextFile } from '../../src/ui/services/profileService.js';

beforeEach(() => {
  global.localStorage = (function () {
    let store = {};
    return {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; }
    };
  })();
});

afterEach(() => {
  cleanup();
});

describe('Skills UI integration', () => {
  it('renders skills module and accepts 0-5 Likert input', async () => {
    const { getByText, queryByText } = render(Skills);
    expect(getByText('Skill 1 of 35')).toBeTruthy();
    await fireEvent.click(getByText('4'));
    expect(getByText((content, element) => element.getAttribute("aria-valuetext") === "1 of 35 answered")).toBeTruthy();
    expect(queryByText(/35\s*\/\s*35 answered/i)).toBeNull();
  });

  it('allows moving to next skill even if review confirmations are unchecked', async () => {
    const { getByText, getByLabelText } = render(Skills);

    expect(getByText('Skill 1 of 35')).toBeTruthy();
    await fireEvent.click(getByText('3'));

    expect(getByText('Skill 1 of 35')).toBeTruthy();
    const nextButton = getByText('Next');
    expect(nextButton.hasAttribute('disabled')).toBe(false);
    await fireEvent.click(nextButton);
    expect(getByText('Skill 2 of 35')).toBeTruthy();

    // Users can still choose to provide optional review confirmations.
    await fireEvent.click(getByText('Prev'));
    await fireEvent.click(getByLabelText('Interview Defense'));
    await fireEvent.click(getByLabelText('Day One Autonomy'));
    await fireEvent.click(getByLabelText('Relevance & Recency'));
  });

  it('emits updated testAnswers when review confirmations change', async () => {
    let latest = null;
    const onProgress = (detail) => {
      latest = detail;
    };

    const { getByText, getByLabelText } = render(Skills, { onProgress });
    await fireEvent.click(getByText('3'));
    await fireEvent.click(getByLabelText('Interview Defense'));

    expect(latest).toBeTruthy();
    expect(latest.module).toBe('skills');
    expect(latest.testAnswers).toBeTruthy();
    expect(latest.testAnswers['1']).toBeTruthy();
    expect(latest.testAnswers['1'].interview_defense).toBe(true);
  });

  it('resumes at last answered skill regardless of review state', async () => {
    const initialResponses = [2, 3, null, null, null];
    const initialConfirmations = {
      2: {
        interview_defense: false,
        day_one_autonomy: false,
        relevance_recency: false
      }
    };

    const { getByText } = render(Skills, {
      initialResponses,
      initialCurrent: 0,
      initialConfirmations
    });

    expect(getByText('Skill 2 of 35')).toBeTruthy();
  });

  it('filters out skills below threshold and excludes unconfirmed >= 50 scores', () => {
    const responses = [4.5, 2.25, 1, 3.75, 2.75, ...Array(30).fill(0)];
    const tests = {
      1: { interview_defense: true, day_one_autonomy: true, relevance_recency: true },
      4: { interview_defense: true, day_one_autonomy: true, relevance_recency: false },
      5: { interview_defense: true, day_one_autonomy: true, relevance_recency: true }
    };

    const scored = scoreSkills(responses, tests);
    const names = scored.filtered.map((s) => s.name);
    expect(names).toContain('Reading Comprehension');
    expect(names).toContain('Mathematics');
    expect(names).not.toContain('Writing');
    expect(names).not.toContain('Speaking');
  });

  it('exports filtered skills into ContextFile payload', () => {
    const confirmations = Object.fromEntries(
      Array.from({ length: 35 }, (_, index) => [index + 1, {
        interview_defense: true,
        day_one_autonomy: true,
        relevance_recency: true
      }])
    );
    const skills = scoreSkills(Array(35).fill(3), confirmations);
    const scored = { raw: { O: 30, C: 30, E: 30, A: 30, N: 30 }, normalized: { O: 50, C: 50, E: 50, A: 50, N: 50 } };
    const ctx = toContextFile(scored, {
      ipip: Array(50).fill(3),
      base: { onet: { soc_code: '15-1252', title: 'Software Developers' } },
      skills: { responses: Array(35).fill(3), result: skills }
    });

    expect(ctx.profile.modules.skills).toBeTruthy();
    expect(Array.isArray(ctx.profile.modules.skills.filtered)).toBe(true);
    expect(ctx.profile.modules.skills.filtered.length).toBeGreaterThan(0);
  });
});
