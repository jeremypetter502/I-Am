<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { canonicalizeState, DEFAULT_STATE } from '../../lib/state/stateManager.js';

  const dispatch = createEventDispatcher();

  export let initialState = null;
  export let onProgress = null;

  const presets = [10, 30, 50, 70, 90];
  let state = canonicalizeState(initialState || DEFAULT_STATE);

  function emitProgress() {
    const detail = {
      module: 'state',
      responses: [],
      current: 0,
      expectedLength: 0,
      state: { ...state }
    };
    dispatch('moduleprogress', detail);
    if (typeof onProgress === 'function') onProgress(detail);
  }

  function updateState(partial) {
    state = canonicalizeState({ ...state, ...partial });
    emitProgress();
  }

  onMount(() => {
    state = canonicalizeState(initialState || DEFAULT_STATE);
    emitProgress();
  });
</script>

<section class="state-shell">
  <div class="state-card">
    <div class="field">
      <div class="field-head">
        <label for="state-bandwidth">Bandwidth</label>
        <strong>{state.bandwidth}</strong>
      </div>
      <input
        id="state-bandwidth"
        type="range"
        min="0"
        max="100"
        step="1"
        value={state.bandwidth}
        on:input={(event) => updateState({ bandwidth: Number(event.currentTarget.value) })}
      />
      <div class="preset-row group-box">
        {#each presets as value}
          <button class:active={state.bandwidth === value} on:click={() => updateState({ bandwidth: value })}>{value}</button>
        {/each}
      </div>
    </div>

    <div class="field">
      <p>Mode</p>
      <div class="choice-row group-box">
        <button class:active={state.mode === 'convergent'} on:click={() => updateState({ mode: 'convergent' })}>Convergent</button>
        <button class:active={state.mode === 'divergent'} on:click={() => updateState({ mode: 'divergent' })}>Divergent</button>
      </div>
    </div>

    <div class="field">
      <p>Horizon</p>
      <div class="choice-row group-box">
        <button class:active={state.horizon === 'now'} on:click={() => updateState({ horizon: 'now' })}>Now</button>
        <button class:active={state.horizon === 'long'} on:click={() => updateState({ horizon: 'long' })}>Long</button>
      </div>
    </div>

    <div class="field">
      <p>Stakes</p>
      <div class="choice-row group-box">
        <button class:active={state.stakes === 'critical'} on:click={() => updateState({ stakes: 'critical' })}>Critical</button>
        <button class:active={state.stakes === 'casual'} on:click={() => updateState({ stakes: 'casual' })}>Casual</button>
      </div>
    </div>
  </div>
</section>

<style>
  .state-shell { display: grid; gap: 12px; }
  .state-card {
    border-radius: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
    display: grid;
    gap: 14px;
  }
  .field { display: grid; gap: 8px; }
  .field-head { display: flex; justify-content: space-between; align-items: center; }
  label, p { margin: 0; color: #334155; font-weight: 700; }
  input[type='range'] { width: 100%; }
  .preset-row, .choice-row { display: flex; flex-wrap: wrap; gap: 8px; }
  button {
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(30, 41, 59, 0.5);
    padding: 10px 14px;
    font-weight: 800;
    color: var(--iam-text-primary);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  }
  button:hover,
  button:focus-visible {
    border-color: rgba(13, 148, 136, 0.35);
    box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
    outline: none;
  }
  button.active {
    background: var(--iam-button-bg);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 14px 26px rgba(99, 102, 241, 0.25);
  }

  :global(.state-card .group-box button.active) {
    background: radial-gradient(
      ellipse at 50% 30%,
      color-mix(in srgb, var(--iam-button-bg) 40%, white 60%) 0%,
      var(--iam-button-bg) 50%,
      color-mix(in srgb, var(--iam-button-bg) 80%, black 20%) 100%
    ) !important;
    color: #fff !important;
  }
  @media (max-width: 768px) {
    .state-shell { gap: 12px; }
    .state-card { padding: 16px; }
  }

  @media (max-width: 480px) {
    .state-card { padding: 12px; gap: 12px; }
    input, select, textarea { font-size: 0.9rem; padding: 8px 10px; }
  }
</style>
