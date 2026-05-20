// @vitest-environment jsdom
import { render, fireEvent, waitFor, within } from '@testing-library/svelte';
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
});

describe('SurveyPage module chip progress', () => {
  it('shows answered counts from resumed progress', () => {
    const saved = { modules: { ipip: { responses: Array(10).fill(3), current: 4 } } };
    localStorage.setItem('iam_inprogress_v1', JSON.stringify(saved));

    const { getByText } = render(SurveyPage);
    expect(getByText('10/50')).toBeTruthy();
  });

  it('updates ipip chip count immediately after answering', async () => {
    const { container } = render(SurveyPage);
    const resetButton = container.querySelector('button.mini-btn.danger');
    expect(resetButton).not.toBeNull();
    await fireEvent.click(resetButton);

    await waitFor(() => {
      expect(within(container).getByText('0/50')).toBeTruthy();
    });

    const ipipChip = within(container).getByText('Personality');
    await fireEvent.click(ipipChip);

    const answer1 = await within(container).findByLabelText('Answer 1');
    await fireEvent.click(answer1);

    await waitFor(() => {
      expect(within(container).getByText('1/50')).toBeTruthy();
    });
  });

  it('treats state module as baseline (no x/x counter, no complete label)', async () => {
    const { container, getByText, getAllByRole, queryByText } = render(SurveyPage);

    const stateChip = getAllByRole('button').find((btn) => btn.textContent?.includes('State'));
    expect(stateChip).toBeTruthy();
    await fireEvent.click(stateChip);

    await waitFor(() => {
      expect(getByText('Baseline')).toBeTruthy();
    });

    expect(queryByText('0/0')).toBeNull();
    expect(queryByText('Completed')).toBeNull();
  });
});
