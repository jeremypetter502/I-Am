// @vitest-environment jsdom
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, beforeEach } from 'vitest';

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

  const seededProfile = {
    profile: {
      modules: {
        ipip: { responses: Array(50).fill(3) },
        aesthetics: {
          responses: Array(32).fill(3),
          normalized: {
            minimalism: 80,
            colorfulness: 35,
            warmth: 60,
            texture: 70,
            motion: 45
          }
        },
        state: {
          bandwidth: 50,
          mode: 'convergent',
          horizon: 'long',
          stakes: 'casual'
        }
      }
    }
  };
  localStorage.setItem('iam_profile', JSON.stringify(seededProfile));
});

describe('State updates retain existing module exports', () => {
  it('keeps aesthetics module when state changes are made', async () => {
    const { getAllByRole, container } = render(SurveyPage);

    const stateChip = getAllByRole('button').find((btn) => btn.textContent?.includes('State'));
    expect(stateChip).toBeTruthy();
    await fireEvent.click(stateChip);

    const slider = container.querySelector('#state-bandwidth');
    expect(slider).toBeTruthy();
    slider.value = '30';
    await fireEvent.input(slider);
    await fireEvent.click(getAllByRole('button').find((btn) => btn.textContent?.trim() === 'High'));

    await waitFor(() => {
      const profile = JSON.parse(localStorage.getItem('iam_profile'));
      expect(profile.profile.modules.aesthetics).toBeTruthy();
      expect(profile.profile.modules.state.bandwidth).toBe(30);
      expect(profile.profile.modules.state.humor).toBe('high');
    });
  });
});
