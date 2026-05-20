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
    <p class="eyebrow">Dynamic runtime state</p>
    <h3>Session behavior tuning</h3>
    <p class="copy">Set your current runtime context. This module is lightweight and updates immediately.</p>

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
      <div class="preset-row">
        {#each presets as value}
          <button class:active={state.bandwidth === value} on:click={() => updateState({ bandwidth: value })}>{value}</button>
        {/each}
      </div>
    </div>

    <div class="field">
      <p>Mode</p>
      <div class="choice-row">
        <button class:active={state.mode === 'convergent'} on:click={() => updateState({ mode: 'convergent' })}>Convergent</button>
        <button class:active={state.mode === 'divergent'} on:click={() => updateState({ mode: 'divergent' })}>Divergent</button>
      </div>
    </div>

    <div class="field">
      <p>Horizon</p>
      <div class="choice-row">
        <button class:active={state.horizon === 'now'} on:click={() => updateState({ horizon: 'now' })}>Now</button>
        <button class:active={state.horizon === 'long'} on:click={() => updateState({ horizon: 'long' })}>Long</button>
      </div>
    </div>

    <div class="field">
      <p>Stakes</p>
      <div class="choice-row">
        <button class:active={state.stakes === 'critical'} on:click={() => updateState({ stakes: 'critical' })}>Critical</button>
        <button class:active={state.stakes === 'casual'} on:click={() => updateState({ stakes: 'casual' })}>Casual</button>
      </div>
    </div>
  </div>
</section>

<style>
  .state-shell { display: grid; gap: 12px; }
  .state-card {
    border-radius: 20px;
    padding: 16px;
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(148,163,184,.25);
    display: grid;
    gap: 14px;
  }
  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: .12em;
    font-size: .75rem;
    color: #0f766e;
    font-weight: 800;
  }
  h3 { margin: 0; }
  .copy { margin: 0; color: #475569; }
  .field { display: grid; gap: 8px; }
  .field-head { display: flex; justify-content: space-between; align-items: center; }
  label, p { margin: 0; color: #334155; font-weight: 700; }
  input[type='range'] { width: 100%; }
  .preset-row, .choice-row { display: flex; flex-wrap: wrap; gap: 8px; }
  button {
    border-radius: 10px;
    border: 1px solid rgba(148,163,184,.35);
    background: #f8fafc;
    padding: 7px 10px;
    font-weight: 700;
  }
  button.active {
    background: #d1fae5;
    border-color: rgba(5,150,105,.35);
    color: #065f46;
  }
</style>
