<script>
  import { onMount } from 'svelte';
  import Survey from '../components/Survey.svelte';
  import sessionService from '../services/sessionService.js';

  let resumePrompt = false;
  let resumeData = null;

  onMount(() => {
    try {
      // parse query param from hash like #/survey?resume=1
      const raw = (typeof window !== 'undefined' && window.location && window.location.hash) ? window.location.hash : '';
      const m = raw.match(/\?(.+)$/);
      const qs = m ? new URLSearchParams(m[1]) : new URLSearchParams();
      if (qs.get('resume') === '1' || sessionService.hasSaved()) {
        resumePrompt = true;
        resumeData = sessionService.loadProgress();
      }
    } catch(e) { resumePrompt = false }
  });

  function handleComplete(e) {
    const ctx = e.detail;
    try { localStorage.setItem('pctx_profile', JSON.stringify(ctx)); } catch(e) { /* ignore */ }
    // clear saved progress on full completion
    try { sessionService.clearProgress(); } catch(e) {}
    if (typeof window !== 'undefined' && window.location) window.location.hash = '#/review';
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
  <Survey on:complete={handleComplete} initialResponses={resumeData?.modules?.ipip?.responses} initialCurrent={resumeData?.modules?.ipip?.current} />
{/if}

<style>
  .resume { background:#fff3cd; padding:12px; border-radius:6px; margin-bottom:12px }
  .resume button { margin-right:8px }
</style>