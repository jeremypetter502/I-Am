<script>
  import { onMount } from 'svelte';
  import SurveyPage from './pages/SurveyPage.svelte';
  import ReviewPage from './pages/ReviewPage.svelte';
  import sessionService from './services/sessionService.js';

  let route = 'survey';
  let hasSaved = false;

  function updateRoute() {
    const raw = (typeof window !== 'undefined' && window.location && window.location.hash) ? window.location.hash : '#/survey';
    const h = raw.replace(/^#\//, '');
    route = h || 'survey';
  }

  onMount(() => {
    try {
      updateRoute();
      window.addEventListener('hashchange', updateRoute);
      hasSaved = sessionService.hasSaved();
    } catch (err) {
      console.error('App init error', err);
    }
  });
</script>

<nav>
  <a href="#/survey">Survey</a> |
  <a href="#/review">Review</a>
</nav>

{#if hasSaved}
  <div class="resume-banner">
    A saved session was found. <a href="#/survey?resume=1">Resume survey</a>
  </div>
{/if}

<main>
  <h1>Personality Context Generator</h1>
  {#if route === 'survey'}
    <SurveyPage />
  {:else if route === 'review'}
    <ReviewPage />
  {:else}
    <div>Not found</div>
  {/if}
</main>

<style>
  main { max-width: 760px; margin: 24px auto; font-family: system-ui, Arial, sans-serif; padding: 0 16px }
  h1 { font-size: 1.4rem; margin-bottom: 12px }
  nav { margin: 8px 0 }
  nav a { color: #0366d6; text-decoration: none }
</style>
