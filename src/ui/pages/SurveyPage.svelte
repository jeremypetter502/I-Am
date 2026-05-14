<script>
  import Survey from '../components/Survey.svelte';
  // store profile to localStorage and navigate to review
  function handleComplete(e) {
    const ctx = e.detail;
    try { localStorage.setItem('pctx_profile', JSON.stringify(ctx)); } catch(e) { /* ignore */ }
    location.hash = '#/review';
  }
</script>

<Survey on:complete={handleComplete} />
