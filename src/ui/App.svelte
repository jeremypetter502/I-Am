<script>
  import { onMount } from 'svelte';
  import SurveyPage from './pages/SurveyPage.svelte';
  import ReviewPage from './pages/ReviewPage.svelte';

  let route = 'survey';

  function updateRoute() {
    const h = (location.hash || '#/survey').replace('#/','');
    route = h || 'survey';
  }

  onMount(() => {
    updateRoute();
    window.addEventListener('hashchange', updateRoute);
  });
</script>

<nav>
  <a href="#/survey">Survey</a> |
  <a href="#/review">Review</a>
</nav>

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
