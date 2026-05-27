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

describe('SurveyPage module chip progress', () => {
  it('shows answered counts from resumed progress', () => {
    const saved = { modules: { ipip: { responses: Array(10).fill(3), current: 4 } } };
    localStorage.setItem('iam_inprogress_v1', JSON.stringify(saved));

    const { getByText } = render(SurveyPage);
    expect(getByText('10/50')).toBeTruthy();
  });

  it('updates ipip chip count immediately after answering', async () => {
    const { container } = render(SurveyPage);
    const ipipChip = within(container).getByText('Personality');
    await fireEvent.click(ipipChip);

    const resetButton = container.querySelector('.module-action-row button');
    expect(resetButton).not.toBeNull();
    await fireEvent.click(resetButton);
    await fireEvent.click(within(container).getByText('Reset module'));

    await waitFor(() => {
      expect(within(container).getByText('0/50')).toBeTruthy();
    });

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
      expect(container.querySelector('.status-pill')).toBeNull();
    });

    expect(queryByText('0/0')).toBeNull();
    expect(queryByText('Completed')).toBeNull();
  });

  it('toggles current module disabled state in saved profile without clearing answers', async () => {
    localStorage.setItem('iam_inprogress_v1', JSON.stringify({
      modules: {
        ipip: { responses: Array(10).fill(3), current: 4, expectedLength: 50, answered: 10, completed: false }
      }
    }));

    const { container } = render(SurveyPage);
    const disableButton = container.querySelector('.workspace .module-action-row .disable-toggle');
    expect(disableButton).not.toBeNull();
    await fireEvent.click(disableButton);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('iam_profile'));
      expect(saved.profile.modules.ipip.disabled).toBe(true);
      expect(saved.profile.modules.ipip.responses).toHaveLength(10);
    });

    const disableToggleAgain = container.querySelector('.workspace .module-action-row .disable-toggle');
    expect(disableToggleAgain).not.toBeNull();
    await fireEvent.click(disableToggleAgain);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('iam_profile'));
      expect(saved.profile.modules.ipip.disabled).toBeFalsy();
    });
  });

  it('persists disabled flag for an unstarted module', async () => {
    const { getByText } = render(SurveyPage);

    await fireEvent.click(getByText('Music'));
    await fireEvent.click(getByText('Disable'));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('iam_profile'));
      expect(saved.profile.modules.music.disabled).toBe(true);
      expect(saved.profile.modules.music.responses).toEqual([]);
    });
  });

  it('keeps checkbox state correct when switching modules', async () => {
    localStorage.setItem('iam_inprogress_v1', JSON.stringify({
      modules: {
        ipip: { responses: Array(10).fill(3), current: 4, expectedLength: 50, answered: 10, completed: false }
      }
    }));

    const { container, getByText } = render(SurveyPage);

    const ipipCheckbox = container.querySelector('.workspace .module-action-row .disable-checkbox-input');
    expect(ipipCheckbox).not.toBeNull();
    await fireEvent.click(ipipCheckbox);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('iam_profile'));
      expect(saved.profile.modules.ipip.disabled).toBe(true);
    });

    await fireEvent.click(getByText('Music'));
    await waitFor(() => {
      const checkbox = container.querySelector('.workspace .module-action-row .disable-checkbox-input');
      expect(checkbox?.checked).toBe(false);
    });

    const musicCheckbox = container.querySelector('.workspace .module-action-row .disable-checkbox-input');
    expect(musicCheckbox).not.toBeNull();
    await fireEvent.click(musicCheckbox);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('iam_profile'));
      expect(saved.profile.modules.music.disabled).toBe(true);
    });

    await fireEvent.click(getByText('Personality'));
    await waitFor(() => {
      const checkbox = container.querySelector('.workspace .module-action-row .disable-checkbox-input');
      expect(checkbox?.checked).toBe(true);
    });
  });
});
