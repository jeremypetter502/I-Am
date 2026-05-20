// @vitest-environment jsdom
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import State from '../../src/ui/components/State.svelte';

afterEach(() => {
  cleanup();
});

describe('State module UI', () => {
  it('emits canonical state on mount and updates', async () => {
    let latest = null;
    const onProgress = (detail) => {
      latest = detail;
    };

    const { getByText, container } = render(State, {
      initialState: { bandwidth: 30, mode: 'convergent', horizon: 'long', stakes: 'casual' },
      onProgress
    });

    expect(latest).toBeTruthy();
    expect(latest.module).toBe('state');
    expect(latest.state.bandwidth).toBe(30);

    const slider = container.querySelector('#state-bandwidth');
    slider.value = '70';
    await fireEvent.input(slider);

    await fireEvent.click(getByText('Critical'));

    expect(latest.state.bandwidth).toBe(70);
    expect(latest.state.stakes).toBe('critical');
  });

  it('uses defaults when initial state is missing', () => {
    let latest = null;
    render(State, {
      onProgress: (detail) => {
        latest = detail;
      }
    });

    expect(latest.state).toEqual({
      bandwidth: 50,
      mode: 'convergent',
      horizon: 'long',
      stakes: 'casual'
    });
  });
});
