<script>
  export let answered = 0;
  export let total = 50;
  $: pct = total > 0 ? Math.round((answered / total) * 100) : 0;
</script>

<div class="progress" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-valuetext={`${answered} of ${total} answered`}>
  <div class="track">
    <div class="bar" style={`width:${pct}%`}></div>
  </div>
  <div class="label">
    <strong>{answered}</strong>
    <span>/ {total} answered</span>
    <em>{pct}%</em>
  </div>
</div>

<style>
  .progress {
    display: grid;
    gap: 10px;
    padding: 12px;
    border-radius: 18px;
    background: var(--iam-card-bg, rgba(30, 41, 59, 0.7));
    border: 1px solid var(--iam-card-border, rgba(148, 163, 184, 0.1));
    box-shadow: var(--iam-card-shadow, 0 10px 24px rgba(0, 0, 0, 0.3));
    backdrop-filter: blur(12px);
  }

  .track {
    height: 12px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
  }

  .bar {
    height: 100%;
    border-radius: inherit;
    background: var(--iam-gradient, linear-gradient(135deg, #A855F7, #06B6D4));
    box-shadow: 0 6px 14px rgba(168, 85, 247, 0.3);
    transition: width 180ms ease;
  }

  .label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: var(--iam-text-primary, #F8FAFC);
  }

  .label em {
    color: var(--iam-teal, #06B6D4);
    font-weight: bold;
    font-style: normal;
  }

  .label span {
    color: var(--iam-text-secondary, #94A3B8);
  }

  @media (max-width: 768px) {
    .progress {
      padding: 8px;
      gap: 8px;
    }

    .label {
      font-size: 0.8rem;
    }
  }
</style>
