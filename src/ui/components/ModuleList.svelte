<script>
  export let modules = {};
</script>

<div class="module-list">
  {#each Object.keys(modules) as name}
    <div class="module">
      <div class="module-name">{name}</div>
      <div class="module-meta">
        {#if modules[name].completed}
          <span class="badge done">Completed</span>
        {:else}
          <span class="badge pending">In progress</span>
        {/if}
        {#if modules[name].last_updated}
          <span class="ts">{new Date(modules[name].last_updated).toLocaleString()}</span>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .module { display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #eee }
  .module-name { font-weight:600 }
  .badge { padding:4px 8px; border-radius:12px; font-size:0.8rem }
  .badge.done { background: #2ea44f; color: white }
  .badge.pending { background: #f6c; color: white }
  .ts { margin-left:8px; color:#666; font-size:0.8rem }
</style>