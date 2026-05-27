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
  // seed a saved in-progress payload
  const saved = { modules: { ipip: { responses: Array(10).fill(3), current: 5 } } };
  localStorage.setItem('iam_inprogress_v1', JSON.stringify(saved));
});

describe('SurveyPage resume UI', () => {
  it('automatically resumes saved progress without a prompt', async () => {
    const { getByText, queryByText, getAllByText } = render(SurveyPage);

    expect(queryByText('Saved in-progress responses found. Resume where you left off?')).toBeNull();

    // module tabs should be present
    expect(getAllByText((content, element) => element.classList?.contains('module-chip__label') && content === 'Personality').length).toBeGreaterThan(0);
    expect(getAllByText('Aesthetics').length).toBeGreaterThan(0);
    expect(getAllByText('Music').length).toBeGreaterThan(0);
    expect(getAllByText('Delivery').length).toBeGreaterThan(0);
    expect(getAllByText('10/50').length).toBeGreaterThan(0);
  });
});
