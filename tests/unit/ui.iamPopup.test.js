// @vitest-environment jsdom
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import SurveyPage from '../../src/ui/pages/SurveyPage.svelte';

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
  window.sessionStorage.clear();
  window.sessionStorage.setItem('iam_help_seen_v1', '1');
  Object.defineProperty(window.navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined)
    },
    configurable: true
  });
});

afterEach(() => {
  cleanup();
});

describe('SurveyPage IAM popup', () => {
  it('opens I-AM popup and copies I-AM text with instructions', async () => {
    localStorage.setItem('iam_profile', JSON.stringify({
      profile: {
        iam: { code: 'IAM/0.6:AES:MIN50/O70C60E50A40N30' },
        base: { name: 'Jeremy Petter' },
        modules: {}
      }
    }));

    // simulate a completed module so Generate becomes available
    localStorage.setItem('iam_inprogress_v1', JSON.stringify({ modules: { music: { responses: [1,1,1], current: 3, expectedLength: 3, answered: 3, completed: true } } }));
    const { getByText, getByLabelText } = render(SurveyPage);

  await fireEvent.click(getByText('Generate'));
    expect(getByText('Current I-AM String')).toBeTruthy();

    const textArea = getByLabelText('Current I-AM text');
    expect(textArea.value.includes('I-AM string: IAM/0.6:AES:MIN50/O70C60E50A40N30')).toBe(true);
    expect(textArea.value.includes('Instructions for the LLM:')).toBe(true);
    expect(textArea.value.includes('Treat the I-AM string above as authoritative structured profile context for the user.')).toBe(true);
    expect(textArea.value.includes('Use OCEAN trait weights to tune reasoning cadence')).toBe(true);
    expect(textArea.value.includes('Use DELIVERY as a delivery profile')).toBe(false);

    await fireEvent.click(getByText('Copy'));
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(window.navigator.clipboard.writeText.mock.calls[0][0].includes('I-AM string: IAM/0.6:AES:MIN50/O70C60E50A40N30')).toBe(true);
  });

  it('derives the popup I-AM string from uploaded base context when iam code is missing', async () => {
    localStorage.setItem('iam_profile', JSON.stringify({
      profile: {
        scores: {
          openness: 0,
          conscientiousness: 0,
          extraversion: 0,
          agreeableness: 0,
          neuroticism: 0
        },
        base: {
          name: 'Jeremy Petter',
          birth_year: 1975,
          gender: 'male',
          culture: 'en-US',
          timezone: 'America/New_York'
        },
        modules: {}
      }
    }));

    localStorage.setItem('iam_inprogress_v1', JSON.stringify({ modules: { music: { responses: [1,1,1], current: 3, expectedLength: 3, answered: 3, completed: true } } }));
    const { getByText, getByLabelText } = render(SurveyPage);

    await fireEvent.click(getByText('Generate'));

    const textArea = getByLabelText('Current I-AM text');
    expect(textArea.value.includes('IAM/0.6:Jeremy:1975:Male:en-US:EST')).toBe(true);
    expect(textArea.value.includes('O0C0E0A0N0')).toBe(false);
  });

  it('includes music instructions when music I-AM segment is present', async () => {
    localStorage.setItem('iam_profile', JSON.stringify({
      profile: {
        iam: { code: 'IAM/0.6:O0C0E0A0N0/MUS:MEL25SOP25UNP25INT25CON25' },
        base: { name: 'Jeremy Petter' },
        modules: {}
      }
    }));

    localStorage.setItem('iam_inprogress_v1', JSON.stringify({ modules: { music: { responses: [1,1,1], current: 3, expectedLength: 3, answered: 3, completed: true } } }));
    const { getByText, getByLabelText } = render(SurveyPage);

    await fireEvent.click(getByText('Generate'));

    const textArea = getByLabelText('Current I-AM text');
    expect(textArea.value.includes('O0C0E0A0N0')).toBe(false);
    expect(textArea.value.includes('Use music preference factors to align tone and creative framing')).toBe(true);
    expect(textArea.value.includes('MUS: Music Preferences')).toBe(true);
    expect(textArea.value.includes('Use OCEAN trait weights to tune reasoning cadence')).toBe(false);
  });
});

