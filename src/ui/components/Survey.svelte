<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import ProgressBar from './ProgressBar.svelte';
  import { loadQuestions, scoreResponses, toContextFile } from '../services/profileService.js';

  const dispatch = createEventDispatcher();
  import sessionService from '../services/sessionService.js';

  let questions = [];
  export let initialResponses = null;
  export let initialCurrent = 0;
  let responses = Array(50).fill(null);
  let current = 0;
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      questions = await loadQuestions();
      // ensure exactly 50 questions
      questions = questions.slice(0,50);
      // if initial responses provided (resume), apply them
      if (initialResponses && Array.isArray(initialResponses)) {
        for (let i=0;i<Math.min(initialResponses.length, responses.length);i++) responses[i] = initialResponses[i];
        current = initialCurrent || 0;
      }
      loading = false;
    } catch (err) {
      error = err.message || String(err);
      loading = false;
    }
  });

  function setResponse(value) {
    responses[current] = value;
    // autosave every 5 answers
    const answered = responses.filter(r => typeof r === 'number').length;
    if (answered % 5 === 0) {
      // save progress for ipip module
      try { sessionService.saveProgress('ipip', { responses: responses.slice(0), current, expectedLength: questions.length }); } catch(e) {}
    }
  }

  // Handle an answer selection: record it and advance automatically
  function handleAnswer(value) {
    setResponse(value);
    // small visual pause so user sees selection, then advance
    setTimeout(() => {
      if (current < questions.length - 1) {
        current += 1;
      }
    }, 120);
  }

  function next() {
    if (current < questions.length - 1) current += 1;
  }
  function prev() {
    if (current > 0) current -= 1;
  }

  function isComplete() {
    return responses.every(r => typeof r === 'number');
  }

  async function submit() {
    if (!isComplete()) return alert('Please answer all questions (50).');
    const scored = scoreResponses(responses);
    const context = toContextFile(scored);
    // save final completed progress
    try { sessionService.saveProgress('ipip', { responses: responses.slice(0), current: responses.length, expectedLength: questions.length, completed: true }); } catch(e) {}
    // emit result with module metadata (module name, raw responses, and scored result)
    dispatch('complete', { module: 'ipip', responses: responses.slice(0), result: scored, context });
  }
</script>

{#if loading}
  <div>Loading questions…</div>
{:else if error}
  <div class="error">Error loading questions: {error}</div>
{:else}
  <ProgressBar answered={responses.filter(x=>x).length} total={questions.length} />
  <div class="question">
    <div class="q-index">Question {current+1} / {questions.length}</div>
    <div class="q-text">{questions[current]}</div>
    <div class="answers">
      {#each [1,2,3,4,5] as n}
        <button class:sel={responses[current]===n} on:click={() => handleAnswer(n)} aria-label={"Answer "+n}>{n}</button>
      {/each}
    </div>

    <div class="nav">
      <button on:click={prev} disabled={current===0}>Prev</button>
      {#if current < questions.length - 1}
        <button on:click={next}>Next</button>
      {:else}
        <button on:click={submit} disabled={!isComplete()}>Finish & Score</button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .question { border: 1px solid #eee; padding: 12px; border-radius: 6px }
  .q-text { margin: 12px 0 }
  .answers button { margin-right: 8px; padding: 8px 12px }
  .answers button.sel { background: #0366d6; color: white }
  .nav { margin-top: 12px }
  .error { color: red }
</style>
