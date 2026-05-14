<script>
  export let answered = 0;
  export let total = 50;
  $: pct = Math.round((answered/total) * 100);
</script>
<div class="progress" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
  <div class="bar" style="width:{pct}%"></div>
  <div class="label">{answered} / {total} ({pct}%)</div>
</div>

<style>
  .progress { background:#f3f4f6; border-radius:6px; padding:6px; position:relative }
  .bar { height:10px; background:#10b981; border-radius:4px }
  .label { font-size:0.8rem; margin-top:6px }
</style>