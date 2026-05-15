<script>
  import Summary from '../components/Summary.svelte';
  import ModuleList from '../components/ModuleList.svelte';
  import { onMount } from 'svelte';
  let profile = null;
  let saved = null;
  onMount(() => {
    try {
      const raw = localStorage.getItem('pctx_profile');
      profile = raw ? JSON.parse(raw) : null;
      const s = localStorage.getItem('pctx_inprogress_v1');
      saved = s ? JSON.parse(s) : null;
    } catch(e) { profile = null; saved = null }
  });

  function retake(moduleName){
    window.location.hash = '#/survey';
  }
</script>

<div>
  <a href="#/survey">← Back to survey</a>
  {#if profile}
    <Summary {profile} />
    <h3>Modules</h3>
    <ModuleList modules={profile.modules} />
  {:else if saved}
    <div>No exported profile yet, but saved in-progress modules exist.</div>
    <ModuleList modules={saved.modules} />
  {:else}
    <div>No profile available. Take the survey to generate a profile.</div>
  {/if}
</div>
