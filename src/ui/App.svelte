<script>
  import { onMount } from 'svelte';
  import Survey from './components/Survey.svelte';
  import Summary from './components/Summary.svelte';
  import { scoreResponses, toContextFile } from './services/profileService.js';

  let phase = 'survey';
  let profile = null;

  function handleComplete(result) {
    profile = result;
    phase = 'summary';
  }
</script>

<main>
  <h1>Personality Context Generator</h1>
  {#if phase === 'survey'}
    <Survey on:complete={(e) => handleComplete(e.detail)} />
  {:else}
    <Summary {profile} />
  {/if}
</main>

<style>
  main { max-width: 760px; margin: 24px auto; font-family: system-ui, Arial, sans-serif; padding: 0 16px }
  h1 { font-size: 1.4rem; margin-bottom: 12px }
</style>
