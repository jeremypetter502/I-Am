<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { skillPositionMap } from '../../lib/iam/skillPositionMap.js';
  import { scoreSkillsIfAvailable } from '../services/profileService.js';
  import sessionService from '../services/sessionService.js';
  import ProgressBar from './ProgressBar.svelte';

  const dispatch = createEventDispatcher();

  export let initialResponses = null;
  export let initialCurrent = 0;
  export let initialConfirmations = null;
  export let onProgress = null;

  const scaleChoices = [0, 1, 2, 3, 4, 5];

  let responses = Array(35).fill(null);
  let confirmations = {};
  let current = 0;
  let answeredCount = 0;
  let showFullAssessment = false;
  let lastResult = null;

  const normalizeAnswer = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    if (numeric < 0 || numeric > 5) return null;
    return numeric;
  };

  const countAnswered = (arr) => arr.filter((item) => normalizeAnswer(item) !== null).length;
  const lastAnsweredIndex = (arr) => {
    if (!Array.isArray(arr)) return -1;
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      if (normalizeAnswer(arr[i]) !== null) return i;
    }
    return -1;
  };

  function ensureConfirmation(index) {
    if (!confirmations[index]) {
      confirmations = {
        ...confirmations,
        [index]: {
          interview_defense: false,
          day_one_autonomy: false,
          relevance_recency: false
        }
      };
    }
  }

  onMount(() => {
    if (initialConfirmations && typeof initialConfirmations === 'object') {
      const restored = {};
      for (const [indexKey, value] of Object.entries(initialConfirmations)) {
        if (!value || typeof value !== 'object') continue;
        restored[indexKey] = {
          interview_defense: Boolean(value.interview_defense),
          day_one_autonomy: Boolean(value.day_one_autonomy),
          relevance_recency: Boolean(value.relevance_recency)
        };
      }
      confirmations = restored;
    }

    if (Array.isArray(initialResponses)) {
      const next = Array(35).fill(null);
      for (let i = 0; i < Math.min(initialResponses.length, next.length); i += 1) {
        next[i] = normalizeAnswer(initialResponses[i]);
      }
      responses = next;
      answeredCount = countAnswered(next);
      const lastAnswered = lastAnsweredIndex(next);
      if (lastAnswered !== -1) {
        current = lastAnswered;
      } else {
        current = typeof initialCurrent === 'number' ? Math.min(Math.max(initialCurrent, 0), 34) : 0;
      }
    }

    // Rebuild assessment panel immediately when returning to this module.
    recomputeAndMaybeComplete();
  });

  $: currentSkill = skillPositionMap[current];
  $: currentResponse = responses[current];
  $: normalizedCurrent = normalizeAnswer(currentResponse);
  $: requiresConfirmation = normalizedCurrent !== null && normalizedCurrent * 20 >= 50;

  function emitProgress() {
    const detail = {
      module: 'skills',
      responses: responses.slice(0),
      testAnswers: { ...confirmations },
      current,
      expectedLength: 35
    };
    dispatch('moduleprogress', detail);
    if (typeof onProgress === 'function') onProgress(detail);
  }

  function persistProgress() {
    try {
      sessionService.saveProgress('skills', {
        responses,
        testAnswers: confirmations,
        current,
        expectedLength: 35,
        completed: answeredCount >= 35
      });
    } catch (err) {
      // ignore storage failures
    }
  }

  function recomputeAndMaybeComplete() {
    const result = scoreSkillsIfAvailable(responses, confirmations);
    lastResult = result;
    if (answeredCount >= 35 && result) {
      dispatch('complete', {
        module: 'skills',
        responses: responses.slice(0),
        testAnswers: { ...confirmations },
        result
      });
    }
  }

  function selectValue(value) {
    const next = responses.slice(0);
    next[current] = value;
    responses = next;
    answeredCount = countAnswered(next);

    if (value >= 2.5) ensureConfirmation(current + 1);

    const needsFollowUp = normalizeAnswer(value) !== null && Number(value) * 20 >= 50;
    if (!needsFollowUp) {
      const firstUnanswered = next.findIndex((item) => normalizeAnswer(item) === null);
      if (firstUnanswered !== -1 && current < 34) {
        current = Math.min(current + 1, 34);
      }
    }

    persistProgress();
    emitProgress();
    recomputeAndMaybeComplete();
  }

  function updateConfirmation(key, checked) {
    const idx = current + 1;
    ensureConfirmation(idx);
    confirmations = {
      ...confirmations,
      [idx]: {
        ...confirmations[idx],
        [key]: Boolean(checked)
      }
    };
    persistProgress();
    emitProgress();
    recomputeAndMaybeComplete();
  }

  function next() {
    const firstUnanswered = responses.findIndex((item) => normalizeAnswer(item) === null);
    if (firstUnanswered !== -1) {
      current = firstUnanswered;
      return;
    }
    if (current < 34) current += 1;
  }

  function prev() {
    if (current > 0) current -= 1;
  }

  $: filteredSkills = lastResult?.filtered || [];
  $: assessmentSkills = showFullAssessment ? (lastResult?.fullAssessment || []) : filteredSkills;
</script>

<section class="skills-shell">
  <ProgressBar answered={answeredCount} total={35} />

  <div class="question-card">
    <p class="eyebrow">Skill {current + 1} of 35</p>
    <h3>{currentSkill?.name}</h3>
    <p class="category">{currentSkill?.category}</p>

    <div class="scale" role="group" aria-label="Skill score">
      {#each scaleChoices as choice}
        <button class="chip" class:sel={responses[current] === choice} on:click={() => selectValue(choice)}>{choice}</button>
      {/each}
    </div>

    {#if requiresConfirmation}
      <div class="confirmations">
        <p class="confirm-note">This skill is marked for review. These review checks are optional and can be completed now or later.</p>
        <label><input type="checkbox" checked={confirmations[current + 1]?.interview_defense || false} on:change={(e) => updateConfirmation('interview_defense', e.currentTarget.checked)} /> Interview Defense</label>
        <label><input type="checkbox" checked={confirmations[current + 1]?.day_one_autonomy || false} on:change={(e) => updateConfirmation('day_one_autonomy', e.currentTarget.checked)} /> Day One Autonomy</label>
        <label><input type="checkbox" checked={confirmations[current + 1]?.relevance_recency || false} on:change={(e) => updateConfirmation('relevance_recency', e.currentTarget.checked)} /> Relevance &amp; Recency</label>
      </div>
    {/if}

    <div class="actions">
      <button on:click={prev} disabled={current === 0}>Prev</button>
      {#if answeredCount < 35}
        <button on:click={next}>{current === 34 ? 'Review unanswered' : 'Next'}</button>
      {/if}
    </div>
  </div>

  <div class="results-card">
    <div class="results-head">
      <h4>Assessment results</h4>
      <div class="toggles">
        <label><input type="checkbox" bind:checked={showFullAssessment} /> View Full Assessment</label>
      </div>
    </div>

    {#if assessmentSkills.length === 0}
      <p class="muted">Complete more skills to see filtered results.</p>
    {:else}
      <ul>
        {#each assessmentSkills as skill}
          <li>
            <strong>{skill.name}</strong>
            <span>{Math.round(skill.normalized_score)} · {skill.listed_status}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<style>
  .skills-shell { display: grid; gap: 14px; }
  .question-card, .results-card { border-radius: 20px; padding: 16px; background: rgba(255,255,255,.95); border: 1px solid rgba(148,163,184,.25); }
  .eyebrow { margin: 0; font-size: .75rem; text-transform: uppercase; letter-spacing: .12em; color: #475569; }
  .category { margin-top: 4px; color: #0f766e; font-weight: 700; }
  .scale { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 8px; margin-top: 10px; }
  .chip { border-radius: 12px; border: 1px solid rgba(148,163,184,.28); padding: 10px 0; background: #f8fafc; }
  .chip.sel { background: #dbeafe; border-color: rgba(59,130,246,.4); }
  .confirmations { margin-top: 12px; display: grid; gap: 8px; color: #334155; }
  .confirm-note { margin: 0; font-size: .85rem; color: #b45309; font-weight: 700; }
  .actions { margin-top: 14px; display: flex; gap: 8px; }
  .results-head { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .toggles { display: flex; gap: 10px; flex-wrap: wrap; color: #334155; }
  ul { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 8px; }
  li { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between; border: 1px solid rgba(148,163,184,.2); border-radius: 12px; padding: 10px; }
  .muted { color: #64748b; }
</style>
