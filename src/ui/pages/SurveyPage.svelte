<script>
  import { onMount } from 'svelte';
  import Survey from '../components/Survey.svelte';
  import Aesthetics from '../components/Aesthetics.svelte';
  import Music from '../components/Music.svelte';
  import sessionService from '../services/sessionService.js';
  import { scoreResponses, toContextFile } from '../services/profileService.js';

  let resumePrompt = false;
  let resumeData = null;
  let active = 'ipip'; // 'ipip' | 'aesthetics' | 'music'
  let completedModules = { ipip: false, aesthetics: false, music: false };
  let moduleResults = { ipip: null, aesthetics: null, music: null };

  onMount(() => {
    try {
      const raw = (typeof window !== 'undefined' && window.location && window.location.hash) ? window.location.hash : '';
      const m = raw.match(/\?(.+)$/);
      const qs = m ? new URLSearchParams(m[1]) : new URLSearchParams();
      if (qs.get('resume') === '1' || sessionService.hasSaved()) {
        resumePrompt = true;
        resumeData = sessionService.loadProgress();
      }
    } catch(e) { resumePrompt = false }
  });

  function handleModuleComplete(e){
    const { module, responses, result } = e.detail;
    try { sessionService.saveProgress(module, { responses, current: responses.length, expectedLength: responses.length }); } catch(e) {}
    completedModules[module] = true;
    moduleResults[module] = { responses, result };

    if (module === 'ipip') active = 'aesthetics';
    else if (module === 'aesthetics') active = 'music';
    else if (module === 'music') {
      try {
        const ipipResponses = resumeData?.modules?.ipip?.responses || moduleResults.ipip?.responses || [];
        const scored = scoreResponses(ipipResponses);
        const ctx = toContextFile(scored, { aesthetics: resumeData?.modules?.aesthetics?.responses || moduleResults.aesthetics?.responses, music: resumeData?.modules?.music?.responses || moduleResults.music?.responses });
        try { localStorage.setItem('pctx_profile', JSON.stringify(ctx)); } catch(e) {}
      } catch (err) {
        console.error('Failed to export context', err);
      }
      try { sessionService.clearProgress(); } catch(e) {}
      if (typeof window !== 'undefined' && window.location) window.location.hash = '#/review';
    }
  }

  function doResume(){
    resumePrompt = false;
  }
  function doStartOver(){
    try { sessionService.clearProgress(); } catch(e) {}
    resumeData = null;
    resumePrompt = false;
  }
</script>

{#if resumePrompt}
  <div class="resume">
    <div>Saved in-progress responses found. Resume where you left off?</div>
    <button on:click={doResume}>Resume</button>
    <button on:click={doStartOver}>Start over</button>
  </div>
{:else}
  <div class="module-tabs">
    <button class:active={active==='ipip'} on:click={()=>active='ipip'}>IPIP</button>
    <button class:active={active==='aesthetics'} on:click={()=>active='aesthetics'}>Aesthetics</button>
    <button class:active={active==='music'} on:click={()=>active='music'}>Music</button>
  </div>

  {#if active === 'ipip'}
    <Survey on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.ipip?.responses} initialCurrent={resumeData?.modules?.ipip?.current} />
  {:else if active === 'aesthetics'}
    <Aesthetics on:complete={handleModuleComplete} />
  {:else}
    <Music on:complete={handleModuleComplete} />
  {/if}
{/if}

<style>
  .resume { background:#fff3cd; padding:12px; border-radius:6px; margin-bottom:12px }
  .resume button { margin-right:8px }
  .module-tabs { margin-bottom:12px }
  .module-tabs button { margin-right:8px }
  .module-tabs button.active { background:#0366d6; color:white }
</style>
