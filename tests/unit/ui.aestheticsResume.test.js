// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { describe, it, expect, beforeEach } from 'vitest';

import SurveyPage from '../../src/ui/pages/SurveyPage.svelte';

beforeEach(() => {
  // provide localStorage mock for vitest
  global.localStorage = (function(){
    let store = {};
    return {
      getItem: (k) => (k in store) ? store[k] : null,
      setItem: (k,v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; }
    };
  })();
});

describe('Aesthetics resume population', () => {
  it('loads saved answers into the Aesthetics component automatically', async () => {
    // seed a saved in-progress payload for aesthetics: first question answered with 4
    const saved = { modules: { aesthetics: { responses: [4], current: 0, completed: false } } };
    localStorage.setItem('iam_inprogress_v1', JSON.stringify(saved));

    const { findByLabelText, container } = render(SurveyPage);

    // wait for the Aesthetics question UI to appear (answers group has aria-label)
    await findByLabelText(/Question 1/);

    // the selected answer button should have .sel class and show '4'
    const sel = container.querySelector('.answers button.sel');
    expect(sel).not.toBeNull();
    expect(sel.textContent.trim()).toBe('4');
  });
});
