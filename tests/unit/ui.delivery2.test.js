// @vitest-environment jsdom
import { render, fireEvent, waitFor, within, cleanup } from '@testing-library/svelte';
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

describe('Delivery v2 UI', () => {
  it('shows resumed Delivery v2 progress in the module chips', () => {
    localStorage.setItem('iam_inprogress_v1', JSON.stringify({
      modules: { delivery2: { responses: Array(12).fill(3), current: 4, expectedLength: 24 } }
    }));

    const { getAllByText, getByText } = render(SurveyPage);
    expect(getByText('12/24')).toBeTruthy();
    expect(getAllByText('Delivery v2').length).toBeGreaterThan(0);
  });

  it('updates Delivery v2 progress after answering a question', async () => {
    const { container, getByText } = render(SurveyPage);
    await fireEvent.click(getByText('Delivery v2'));

    await waitFor(() => {
      expect(within(container).getByText('0/24')).toBeTruthy();
    });

    const answer = await within(container).findByLabelText('Answer 1');
    await fireEvent.click(answer);

    await waitFor(() => {
      expect(within(container).getByText('1/24')).toBeTruthy();
    });
  });
});