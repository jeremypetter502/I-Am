<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import ProgressBar from './ProgressBar.svelte';
  import { scoreMusicIfAvailable } from '../services/profileService.js';
  import sessionService from '../services/sessionService.js';

  export let initialResponses = null;
  export let initialCurrent = 0;
  export let onProgress = null;
  const dispatch = createEventDispatcher();

  const scaleChoices = [
    { value: 1, note: '1 · Barely' },
    { value: 2, note: '2 · A little' },
    { value: 3, note: '3 · Mixed' },
    { value: 4, note: '4 · Quite a bit' },
    { value: 5, note: '5 · Strongly' }
  ];

  let questions = [];
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

  async function loadModuleQuestions(fileName) {
    const parse = (txt) => txt.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^\d+\./.test(l)).map((l) => l.replace(/^\d+\.\s*/, '').trim());
    try {
      if (typeof fetch === 'function') {
        const res = await fetch('/specs/questions/' + fileName);
        if (res.ok) {
          return parse(await res.text());
        }
      }
    } catch (e) {}

    try {
      const mod = await import('../../../specs/questions/' + fileName + '?raw');
      const txt = mod?.default ?? mod;
      return parse(txt);
    } catch (e) {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const fs = await import('fs');
        const path = await import('path');
        const p = path.resolve(process.cwd(), 'specs', 'questions', fileName);
        const txt = await fs.promises.readFile(p, 'utf8');
        return parse(txt);
      }
      throw e;
    }
  }

  onMount(async () => {
    try {
      questions = await loadModuleQuestions('music_module.txt');
      const nextResponses = Array(questions.length).fill(null);
      if (Array.isArray(initialResponses)) {
        for (let i = 0; i < Math.min(questions.length, initialResponses.length); i++) {
          nextResponses[i] = toAnswerNumber(initialResponses[i]);
        }
        if (typeof initialCurrent === 'number' && initialCurrent >= 0) {
          current = Math.min(initialCurrent, questions.length - 1);
        } else {
          const firstUnanswered = nextResponses.findIndex((r) => !isAnswered(r));
          current = firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;
        }
      }
      responses = nextResponses;
      answeredCount = countAnswered(nextResponses);
      loading = false;
    } catch (e) {
      error = e.message || String(e);
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
      sessionService.saveProgress('music', { responses: nextResponses, current: nextCurrent, expectedLength: questions.length });
      const progressDetail = { module: 'music', responses: nextResponses.slice(0), current: nextCurrent, expectedLength: questions.length };
      dispatch('moduleprogress', progressDetail);
      if (typeof onProgress === 'function') onProgress(progressDetail);
      if (!wasComplete && nowComplete) {
        const result = scoreMusicIfAvailable(nextResponses) || {
          raw: { total: nextResponses.reduce((a, b) => a + (Number(b) || 0), 0) },
          normalized: { total: Math.round((nextResponses.reduce((a, b) => a + (Number(b) || 0), 0) / (nextResponses.length * 5 || 1)) * 10000) / 100 }
        };
        sessionService.saveProgress('music', { responses: nextResponses.slice(0), current: nextResponses.length, expectedLength: questions.length, completed: true });
        dispatch('complete', { module: 'music', responses: nextResponses.slice(0), result });
      }
    } catch (err) {
      console.error('Failed to autosave music progress', err);
    }
    if (current < questions.length - 1) {
      current += 1;
    }
  }

  function handleAnswer(value) {
    setResponse(value);
  }

  function isComplete() { return questions.length > 0 && countAnswered(responses) >= questions.length; }
  function atLastQuestion() { return questions.length > 0 && current >= questions.length - 1; }
  function prev() { if (current > 0) current -= 1; }
  function next() {
    const firstUnanswered = responses.findIndex((entry) => !isAnswered(entry));
    if (firstUnanswered !== -1) {
      current = firstUnanswered;
      return;
    }
    if (current < questions.length - 1) current += 1;
  }

</script>

{#if loading}
  <div class="state-card">
    <p class="state-eyebrow">Loading</p>
    <h3>Fetching the music questions…</h3>
    <p>Getting the music preference module ready.</p>
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
        <span class="hint">Tip: move through the module with the buttons or the response chips.</span>
      </div>

      <div class="scale-note">Use the 1–5 scale to describe how strongly this feels true for you.</div>

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
    color: #f59e0b;
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
    background: linear-gradient(180deg, #fffbeb 0%, #f8fafc 100%);
    border: 1px solid rgba(245, 158, 11, 0.12);
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
    border-color: rgba(245, 158, 11, 0.35);
    box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
  }

  .answer-chip.sel {
    border-color: rgba(245, 158, 11, 0.5);
    box-shadow: 0 14px 26px rgba(245, 158, 11, 0.14);
    background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
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
