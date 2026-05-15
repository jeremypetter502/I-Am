// @vitest-environment jsdom
import { render, fireEvent } from '@testing-library/svelte';
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
  localStorage.setItem('pctx_inprogress_v1', JSON.stringify(saved));
});

describe('SurveyPage resume UI', () => {
  it('shows resume prompt when saved progress exists and resumes to module tabs', async () => {
    const { getByText, queryByText } = render(SurveyPage);

    // resume prompt should be visible
    expect(getByText('Saved in-progress responses found. Resume where you left off?')).toBeTruthy();

    const resumeBtn = getByText('Resume');
    await fireEvent.click(resumeBtn);

    // resume prompt should disappear
    expect(queryByText('Saved in-progress responses found. Resume where you left off?')).toBeNull();

    // module tabs should be present
    expect(getByText('IPIP')).toBeTruthy();
    expect(getByText('Aesthetics')).toBeTruthy();
    expect(getByText('Music')).toBeTruthy();
  });
});