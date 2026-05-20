<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import ProgressBar from './ProgressBar.svelte';
  import { loadQuestions, scoreResponses, toContextFile } from '../services/profileService.js';
  import sessionService from '../services/sessionService.js';

  const dispatch = createEventDispatcher();

  const scaleChoices = [
    { value: 1, note: '1 · Not like me' },
    { value: 2, note: '2 · Slightly unlike me' },
    { value: 3, note: '3 · Neutral' },
    { value: 4, note: '4 · Fairly like me' },
    { value: 5, note: '5 · Very like me' }
  ];

  let questions = [];
  export let initialResponses = null;
  export let initialCurrent = 0;
  export let onProgress = null;
  let responses = [];
  let current = 0;
  let loading = true;
  let error = null;
  let answeredCount = 0;
  const toAnswerNumber = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    if (numeric < 1 || numeric > 5) return null;
    return numeric;
  };
  const isAnswered = (value) => toAnswerNumber(value) !== null;
  const countAnswered = (values) => values.filter((value) => isAnswered(value)).length;

  onMount(async () => {
    try {
      questions = await loadQuestions();
      questions = questions.slice(0, 50);
      responses = Array(questions.length).fill(null);
      if (initialResponses && Array.isArray(initialResponses)) {
        const nextResponses = responses.slice(0);
        for (let i = 0; i < Math.min(initialResponses.length, nextResponses.length); i++) {
          nextResponses[i] = toAnswerNumber(initialResponses[i]);
        }
        responses = nextResponses;
        answeredCount = countAnswered(nextResponses);
        const firstUnanswered = responses.findIndex((r) => !isAnswered(r));
        if (typeof initialCurrent === 'number' && initialCurrent >= 0) {
          current = Math.min(initialCurrent, Math.max(questions.length - 1, 0));
        } else {
          current = firstUnanswered === -1 ? Math.max(questions.length - 1, 0) : firstUnanswered;
        }
      } else {
        answeredCount = 0;
      }
      loading = false;
    } catch (err) {
      error = err.message || String(err);
      loading = false;
    }
  });

  function setResponse(value) {
    if (current < 0 || current >= responses.length) return;
    const wasComplete = questions.length > 0 && countAnswered(responses) >= questions.length;
    const nextResponses = responses.slice(0);
    nextResponses[current] = value;
    responses = nextResponses;
    answeredCount = countAnswered(nextResponses);
    const nowComplete = questions.length > 0 && countAnswered(nextResponses) >= questions.length;
    const firstUnanswered = nextResponses.findIndex((entry) => !isAnswered(entry));
    const nextCurrent = firstUnanswered === -1
      ? Math.max(questions.length - 1, 0)
      : firstUnanswered;
    try {
      sessionService.saveProgress('ipip', { responses: nextResponses, current: nextCurrent, expectedLength: questions.length });
      const progressDetail = { module: 'ipip', responses: nextResponses.slice(0), current: nextCurrent, expectedLength: questions.length };
      dispatch('moduleprogress', progressDetail);
      if (typeof onProgress === 'function') onProgress(progressDetail);
      if (!wasComplete && nowComplete && questions.length === 50) {
        const scored = scoreResponses(nextResponses);
        const context = toContextFile(scored);
        sessionService.saveProgress('ipip', { responses: nextResponses.slice(0), current: nextResponses.length, expectedLength: questions.length, completed: true });
        dispatch('complete', { module: 'ipip', responses: nextResponses.slice(0), result: scored, context });
      }
    } catch (e) {
      console.error('Failed to autosave IPIP progress', e);
    }
    if (current < questions.length - 1) {
      current += 1;
    }
  }

  function handleAnswer(value) {
    setResponse(value);
  }

  function next() {
    const firstUnanswered = responses.findIndex((entry) => !isAnswered(entry));
    if (firstUnanswered !== -1) {
      current = firstUnanswered;
      return;
    }
    if (current < questions.length - 1) current += 1;
  }

  function prev() {
    if (current > 0) current -= 1;
  }

  function isComplete() {
    return questions.length > 0 && countAnswered(responses) >= questions.length;
  }
  function atLastQuestion() {
    return questions.length > 0 && current >= questions.length - 1;
  }

</script>

{#if loading}
  <div class="state-card">
    <p class="state-eyebrow">Loading</p>
    <h3>Fetching the Personality questions…</h3>
    <p>Hang tight while the survey gets its question bank ready.</p>
  </div>
{:else if error}
  <div class="state-card error">
    <p class="state-eyebrow">Error</p>
    <h3>Unable to load the question bank</h3>
    <p>{error}</p>
  </div>
{:else}
  <section class="question-shell">
    <ProgressBar answered={answeredCount} total={questions.length} />

    <div class="question-card">
      <div class="question-meta">
        <div>
          <p class="state-eyebrow">Question {current + 1} of {questions.length}</p>
          <h3>{questions[current]}</h3>
        </div>
        <span class="hint">Tip: use the arrow buttons or click a response chip.</span>
      </div>

      <div class="scale-note">Use the 1–5 scale to show how much the statement fits you.</div>

      <div class="answers" role="group" aria-label={`Question ${current + 1} response options`}>
        {#each scaleChoices as choice}
          <button
            class:sel={responses[current] === choice.value}
            class="answer-chip"
            on:click={() => handleAnswer(choice.value)}
            aria-pressed={responses[current] === choice.value}
            aria-label={`Answer ${choice.value}`}
          >
            <span class="value">{choice.value}</span>
          </button>
        {/each}
      </div>

      <div class="nav">
        <button on:click={prev} disabled={current === 0}>Prev</button>
        {#if !isComplete()}
          <button on:click={next}>{atLastQuestion() ? 'Review unanswered' : 'Next'}</button>
        {/if}
      </div>
    </div>
  </section>
{/if}

<style>
  .state-card,
  .question-card {
    border-radius: 24px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
  }

  .state-card {
    display: grid;
    gap: 6px;
  }

  .state-card h3,
  .question-meta h3 {
    margin: 0;
    font-size: clamp(1.2rem, 1.8vw, 1.6rem);
  }

  .state-card p,
  .scale-note,
  .hint {
    color: #475569;
  }

  .state-eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 0.74rem;
    font-weight: 800;
    color: #6366f1;
  }

  .state-card.error {
    border-color: rgba(239, 68, 68, 0.22);
  }

  .question-shell {
    display: grid;
    gap: 14px;
  }

  .question-card {
    display: grid;
    gap: 16px;
  }

  .question-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: start;
    flex-wrap: wrap;
  }

  .hint {
    font-size: 0.88rem;
    margin-top: 2px;
  }

  .scale-note {
    padding: 10px 12px;
    border-radius: 14px;
    background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
    border: 1px solid rgba(99, 102, 241, 0.12);
    font-size: 0.92rem;
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
    border-color: rgba(99, 102, 241, 0.35);
    box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
  }

  .answer-chip.sel {
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 14px 26px rgba(99, 102, 241, 0.14);
    background: linear-gradient(180deg, #eef2ff 0%, #ffffff 100%);
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
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .answers {
      grid-template-columns: 1fr;
    }
  }

</style>
