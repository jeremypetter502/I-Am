// @vitest-environment jsdom
import { render, fireEvent, waitFor, cleanup } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
});

afterEach(() => {
  cleanup();
});

describe('Delivery v2 module list behavior', () => {
  it('persists a disabled flag for the separate Delivery v2 module', async () => {
    localStorage.setItem('iam_inprogress_v1', JSON.stringify({
      modules: {
        music: { responses: Array(20).fill(3), current: 20, expectedLength: 20, answered: 20, completed: true }
      }
    }));

    const { getByText, getByRole } = render(SurveyPage);
    await fireEvent.click(getByText('Generate'));
    await fireEvent.click(getByRole('checkbox', { name: /Delivery v2/ }));
    await fireEvent.click(getByText('Regenerate'));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('iam_profile'));
      expect(saved.profile.modules.delivery2.disabled).toBe(true);
      expect(saved.profile.modules.delivery).toBeUndefined();
    });
  });
});