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
  it('opens IAM popup and copies IAM text with instructions', async () => {
    localStorage.setItem('iam_profile', JSON.stringify({
      profile: {
        iam: { code: 'IAM/0.6:MIN/O70C60E50A40N30' },
        base: { name: 'Jeremy Petter' },
        modules: {}
      }
    }));

    const { getByText, getByLabelText } = render(SurveyPage);

    await fireEvent.click(getByText('View IAM'));
    expect(getByText('Current IAM String')).toBeTruthy();

    const textArea = getByLabelText('Current IAM text');
    expect(textArea.value.includes('IAM: IAM/0.6:MIN/O70C60E50A40N30')).toBe(true);
    expect(textArea.value.includes('Instructions for the LLM:')).toBe(true);
    expect(textArea.value.includes('Treat the IAM string above as authoritative structured profile context for the user.')).toBe(true);

    await fireEvent.click(getByText('Copy'));
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(window.navigator.clipboard.writeText.mock.calls[0][0].includes('IAM: IAM/0.6:MIN/O70C60E50A40N30')).toBe(true);
  });
});
