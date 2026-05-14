<script>
  import ExportButtons from './ExportButtons.svelte';
  export let profile;
</script>

{#if profile}
  <h2>Profile Summary</h2>
  <div class="scores">
    {#each Object.entries(profile.normalized || {}) as [t, v]}
      <div class="score-item"><strong>{t}</strong>: {v}</div>
    {/each}
  </div>
  <ExportButtons profile={profile} />
{:else}
  <div>No profile available</div>
{/if}

<style>
  .scores { display:flex; gap:12px; flex-wrap:wrap }
  .score-item { padding:8px; border:1px solid #eee; border-radius:6px }
</style>