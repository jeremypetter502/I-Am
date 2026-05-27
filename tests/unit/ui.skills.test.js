// @vitest-environment jsdom
import { render, fireEvent, cleanup, waitFor } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Skills from '../../src/ui/components/Skills.svelte';
import { skillPositionMap } from '../../src/lib/iam/skillPositionMap.js';
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
  it('renders skills module and accepts 1-10 input', async () => {
    const { getByText, queryByText } = render(Skills);
    expect(getByText(skillPositionMap[0].name)).toBeTruthy();
    await fireEvent.click(getByText('4'));
    expect(getByText((content, element) => element.getAttribute("aria-valuetext") === "1 of 35 answered")).toBeTruthy();
    expect(queryByText(/35\s*\/\s*35 answered/i)).toBeNull();
  });

  it('advances to next skill after answering', async () => {
    const { getByText } = render(Skills);

    expect(getByText(skillPositionMap[0].name)).toBeTruthy();
    await fireEvent.click(getByText('3'));

    // Clicking an answer auto-advances to the next skill
    await waitFor(() => {
      expect(getByText(skillPositionMap[1].name)).toBeTruthy();
    }, { timeout: 1200 });
  });

  it('emits progress without testAnswers', async () => {
    let latest = null;
    const onProgress = (detail) => { latest = detail; };

    const { getByText } = render(Skills, { onProgress });
    await fireEvent.click(getByText('3'));

    expect(latest).toBeTruthy();
    expect(latest.module).toBe('skills');
    expect(latest.testAnswers).toBeUndefined();
  });

  it('resumes at last answered skill on mount', async () => {
    const initialResponses = [2, 3, null, null, null];

    const { getByText } = render(Skills, {
      initialResponses,
      initialCurrent: 0
    });

    expect(getByText(skillPositionMap[1].name)).toBeTruthy();
  });

  it('filters out skills below threshold (omit < 60)', () => {
    const responses = [9, 6, 5, 10, 7, ...Array(30).fill(1)];
    const scored = scoreSkills(responses);
    const names = scored.filtered.map((s) => s.name);
    // s1=90, s2=60, s3=50, s4=100, s5=70
    expect(names).toContain(scored.fullAssessment[0].name);
    expect(names).toContain(scored.fullAssessment[1].name);
    expect(names).toContain(scored.fullAssessment[3].name);
    expect(names).toContain(scored.fullAssessment[4].name);
    expect(names).not.toContain(scored.fullAssessment[2].name);
  });

  it('exports filtered skills into ContextFile payload', () => {
    const skills = scoreSkills(Array(35).fill(6));
    const scored = { raw: { O: 30, C: 30, E: 30, A: 30, N: 30 }, normalized: { O: 50, C: 50, E: 50, A: 50, N: 50 } };
    const ctx = toContextFile(scored, {
      ipip: Array(50).fill(3),
      base: { onet: { soc_code: '15-1252', title: 'Software Developers' } },
      skills: { responses: Array(35).fill(6), result: skills }
    });

    expect(ctx.profile.modules.skills).toBeTruthy();
    expect(Array.isArray(ctx.profile.modules.skills.filtered)).toBe(true);
    expect(ctx.profile.modules.skills.filtered.length).toBeGreaterThan(0);
  });
});


