<script>
  import Summary from '../components/Summary.svelte';
  let profile = null;
  try {
    const raw = localStorage.getItem('pctx_profile');
    profile = raw ? JSON.parse(raw) : null;
  } catch(e) { profile = null }
</script>

<div>
  <a href="#/survey">← Back to survey</a>
  <Summary {profile} />
</div>
