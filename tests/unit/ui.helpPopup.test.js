// @vitest-environment jsdom
import { render, fireEvent, cleanup } from '@testing-library/svelte';
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
});

afterEach(() => {
  cleanup();
});

describe('SurveyPage help popup', () => {
  it('shows onboarding help automatically once per session', () => {
    const { getByText } = render(SurveyPage);
    expect(getByText('What this site does')).toBeTruthy();
    expect(window.sessionStorage.getItem('iam_help_seen_v1')).toBe('1');
  });

  it('does not auto-show again in the same session', () => {
    window.sessionStorage.setItem('iam_help_seen_v1', '1');
    const { queryByText } = render(SurveyPage);
    expect(queryByText('What this site does')).toBeNull();
  });

  it('opens from Help button after initial session onboarding', async () => {
    window.sessionStorage.setItem('iam_help_seen_v1', '1');
    const { getByText } = render(SurveyPage);
    await fireEvent.click(getByText('Help'));
    expect(getByText('What this site does')).toBeTruthy();
  });
});
