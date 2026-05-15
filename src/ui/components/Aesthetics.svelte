<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import ProgressBar from './ProgressBar.svelte';
  import { scoreAestheticsIfAvailable } from '../services/profileService.js';
  const dispatch = createEventDispatcher();

  let questions = [];
  let responses = [];
  let current = 0;
  let loading = true;
  let error = null;

  async function loadModuleQuestions(fileName) {
    const parse = (txt) => txt.split(/\r?\n/).map(l=>l.trim()).filter(l=>/^\d+\./.test(l)).map(l=>l.replace(/^\d+\.\s*/, '').trim());
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
      // try node fs
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

  onMount(async()=>{
    try {
      questions = await loadModuleQuestions('aesthetic_module.txt');
      responses = Array(questions.length).fill(null);
      loading = false;
    } catch (e) {
      error = e.message || String(e);
      loading = false;
    }
  });

  function setResponse(value) {
    responses[current] = value;
    const answered = responses.filter(r=>typeof r === 'number').length;
    if (answered % 5 === 0) {
      // optional: persist via sessionService if available
    }
  }

  function handleAnswer(value){
    setResponse(value);
    setTimeout(()=>{ if (current < questions.length-1) current += 1; }, 120);
  }

  function isComplete(){ return responses.every(r=>typeof r === 'number'); }

  function prev(){ if (current>0) current -=1; }
  function next(){ if (current < questions.length-1) current +=1; }

  async function submit(){
    if (!isComplete()) return alert('Please complete the module.');
    const result = scoreAestheticsIfAvailable(responses) || { raw: { total: responses.reduce((a,b)=>a+(Number(b)||0),0) }, normalized: { total: Math.round((responses.reduce((a,b)=>a+(Number(b)||0),0)/(responses.length*5||1))*10000)/100 } };
    dispatch('complete', { module: 'aesthetics', responses: responses.slice(0), result });
  }
</script>

{#if loading}
  <div>Loading aesthetics questions…</div>
{:else if error}
  <div class="error">Error loading questions: {error}</div>
{:else}
  <ProgressBar answered={responses.filter(x=>x).length} total={questions.length} />
  <div class="question">
    <div class="q-index">Question {current+1} / {questions.length}</div>
    <div class="q-text">{questions[current]}</div>
    <div class="answers">
      {#each [1,2,3,4,5] as n}
        <button class:sel={responses[current]===n} on:click={()=>handleAnswer(n)} aria-label={"Answer "+n}>{n}</button>
      {/each}
    </div>

    <div class="nav">
      <button on:click={prev} disabled={current===0}>Prev</button>
      {#if current < questions.length - 1}
        <button on:click={next}>Next</button>
      {:else}
        <button on:click={submit} disabled={!isComplete()}>Finish Module</button>
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