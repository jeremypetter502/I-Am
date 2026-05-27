<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { skillPositionMap } from '../../lib/iam/skillPositionMap.js';
  import { scoreSkillsIfAvailable } from '../services/profileService.js';
  import sessionService from '../services/sessionService.js';
  import ProgressBar from './ProgressBar.svelte';

  const dispatch = createEventDispatcher();

  export let initialResponses = null;
  export let initialCurrent = 0;
  export let onProgress = null;

  const scaleChoices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const ANSWER_ADVANCE_DELAY_MS = 820;
  const ANSWER_ANIMATIONS = ['answer-recorded', 'answer-recorded-flare', 'answer-recorded-wobble', 'answer-recorded-pop', 'answer-recorded-ripple'];
  const ANSWER_BG_ANIMATIONS = ['answer-bg-rise', 'answer-bg-fall', 'answer-bg-center', 'answer-bg-diagonal'];
  const ANSWER_ACCENT_ANIMATIONS = ['answer-accent-ripple-center', 'answer-accent-ripple-top', 'answer-accent-ripple-bottom', 'answer-accent-ripple-left', 'answer-accent-ripple-right'];
  const ANSWER_RIPPLE_ORIGINS = [
    ['50%', '50%'],
    ['50%', '28%'],
    ['50%', '72%'],
    ['32%', '50%'],
    ['68%', '50%']
  ];

  let responses = Array(35).fill(null);
  let current = 0;
  let answeredCount = 0;
  let advanceTimer = null;

  const normalizeAnswer = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    if (numeric < 1 || numeric > 10) return null;
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

  onMount(() => {
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

    maybeComplete();
  });

  onDestroy(() => {
    if (advanceTimer) clearTimeout(advanceTimer);
  });

  $: currentSkill = skillPositionMap[current];

  function emitProgress() {
    const detail = {
      module: 'skills',
      responses: responses.slice(0),
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
        current,
        expectedLength: 35,
        completed: answeredCount >= 35
      });
    } catch (err) {
      // ignore storage failures
    }
  }

  function maybeComplete() {
    if (answeredCount >= 35) {
      const result = scoreSkillsIfAvailable(responses);
      if (result) {
        dispatch('complete', { module: 'skills', responses: responses.slice(0), result });
      }
    }
  }

  function queueAutoAdvance(fromIndex) {
    if (advanceTimer) clearTimeout(advanceTimer);
    if (fromIndex >= 34) return;
    advanceTimer = setTimeout(() => {
      if (current === fromIndex) current = fromIndex + 1;
    }, ANSWER_ADVANCE_DELAY_MS);
  }

  function applyRandomAnswerAnimation(event) {
    const target = event?.currentTarget;
    if (!target) return;
    const animation = ANSWER_ANIMATIONS[Math.floor(Math.random() * ANSWER_ANIMATIONS.length)];
    const bgAnimation = ANSWER_BG_ANIMATIONS[Math.floor(Math.random() * ANSWER_BG_ANIMATIONS.length)];
    const accentAnimation = ANSWER_ACCENT_ANIMATIONS[Math.floor(Math.random() * ANSWER_ACCENT_ANIMATIONS.length)];
    const [rippleX, rippleY] = ANSWER_RIPPLE_ORIGINS[Math.floor(Math.random() * ANSWER_RIPPLE_ORIGINS.length)];
    target.style.setProperty('--answer-recorded-animation', animation);
    target.style.setProperty(
      '--answer-selected-background',
      animation === 'answer-recorded-ripple'
        ? 'radial-gradient(circle, transparent 1%, #4338ca 1%) center/15000% 15000% no-repeat, linear-gradient(180deg, #3730a3 0%, #4f46e5 100%)'
        : 'linear-gradient(180deg, #3730a3 0%, #4f46e5 100%)'
    );
    target.style.setProperty('--answer-recorded-bg-animation', bgAnimation);
    target.style.setProperty('--answer-recorded-accent-animation', accentAnimation);
    target.style.setProperty('--answer-ripple-x', rippleX);
    target.style.setProperty('--answer-ripple-y', rippleY);
  }

  function selectValue(value, event) {
    applyRandomAnswerAnimation(event);
    const fromIndex = current;
    const next = responses.slice(0);
    next[current] = value;
    responses = next;
    answeredCount = countAnswered(next);

    persistProgress();
    emitProgress();
    maybeComplete();

    queueAutoAdvance(fromIndex);
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
</script>

<section class="question-shell">

  <ProgressBar answered={answeredCount} total={35} />

  <div class="question-card">
    <div class="question-meta">
      <div>
        <h3><span class="question-num">{current + 1}.</span> <span class="question-text">{currentSkill?.name}</span></h3>
        <p class="category">{currentSkill?.category}</p>
      </div>
    </div>

    <div class="answers" role="group" aria-label="Skill score">
      {#each scaleChoices as choice}
        <button
          class="answer-chip"
          class:sel={responses[current] === choice}
          on:click={(event) => selectValue(choice, event)}
          aria-pressed={responses[current] === choice}
          aria-label={`Score ${choice}`}
        ><span class="value">{choice}</span></button>
      {/each}
    </div>

    <div class="nav">
      <button on:click={prev} disabled={current === 0}>Prev</button>
      {#if current < 34}
        <button on:click={next}>Next</button>
      {/if}
    </div>
  </div>
</section>

<style>
  .question-shell {
    display: grid;
    gap: 14px;
  }

  .question-card {
    border-radius: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
    display: grid;
    gap: 16px;
  }

  .question-meta h3 {
    margin: 0;
    font-size: clamp(1.2rem, 1.8vw, 1.6rem);
  }

  .state-eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 0.74rem;
    font-weight: 800;
    color: #0f766e;
  }

  .category {
    margin: 4px 0 0;
    color: var(--iam-teal, #0d9488);
    font-weight: 700;
    font-size: 0.9rem;
  }

  .answers {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }

  .answer-chip {
    min-height: 88px;
    padding: 12px;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    display: grid;
    gap: 6px;
    align-content: center;
    text-align: center;
    transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
  }

  .answer-chip:hover,
  .answer-chip:focus-visible {
    transform: translateY(-2px);
    outline: none;
    border-color: rgba(13, 148, 136, 0.35);
    box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
  }

  .answer-chip.sel {
    border-color: rgba(13, 148, 136, 0.5);
    box-shadow: 0 14px 26px rgba(13, 148, 136, 0.14);
    background: linear-gradient(180deg, #ecfeff 0%, #ffffff 100%);
  }

  .value {
    font-size: 1.3rem;
    font-weight: 900;
    color: #0f172a;
  }

  .nav {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .nav button {
    padding: 10px 14px;
    border-radius: 999px;
    background: #e2e8f0;
    color: #0f172a;
    font-weight: 800;
  }

  .nav button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 900px) {
    .answers {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .answers {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }
    .answer-chip {
      min-height: 70px;
      padding: 10px;
    }
    .value {
      font-size: 1.1rem;
    }
    .nav {
      justify-content: stretch;
    }
    .nav button {
      flex: 1;
      font-size: 0.9rem;
      padding: 12px;
    }
  }

  @media (max-width: 480px) {
    .question-card {
      gap: 12px;
    }
    .state-eyebrow {
      font-size: 0.7rem;
    }
  }
</style>

