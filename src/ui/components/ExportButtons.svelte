<script>
  export let profile;
  import { toPbtxt } from '../services/profileService.js';

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile.context.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  function downloadPbtxt() {
    const text = toPbtxt(profile);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile.context.pbtxt';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>
<div class="exports">
  <button on:click={downloadJSON}>Download JSON</button>
  <button on:click={downloadPbtxt}>Download pbtxt</button>
</div>
<style>
  .exports button { margin-right:8px }
</style>