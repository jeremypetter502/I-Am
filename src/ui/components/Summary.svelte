<script>
  import ExportButtons from './ExportButtons.svelte';
  export let profile;

  $: scoreEntries = Object.entries((profile && profile.normalized) || {});
</script>

{#if profile}
  <section class="summary-card">
    <div class="summary-head">
      <div>
        <p class="eyebrow">Profile Summary</p>
        <h2>{profile.summary || 'Your current personality snapshot'}</h2>
      </div>
      {#if profile.iam && profile.iam.code}
        <div class="iam-pill">
          <span>I-AM</span>
          <strong>{profile.iam.version || 'latest'}</strong>
        </div>
      {/if}
    </div>

    {#if scoreEntries.length}
      <div class="scores">
        {#each scoreEntries as [t, v]}
          <div class="score-item">
            <div class="score-row">
              <strong>{t}</strong>
              <span>{v}</span>
            </div>
            <div class="meter" aria-hidden="true">
              <span style={`width:${Math.max(0, Math.min(100, Number(v) || 0))}%`}></span>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <ExportButtons profile={profile} />
  </section>
{:else}
  <div class="empty-summary">No profile available</div>
{/if}

<style>
  .summary-card {
    padding: 24px;
    border-radius: 20px;
    background: var(--iam-card-bg, rgba(30, 41, 59, 0.7));
    border: 1px solid var(--iam-card-border, rgba(148, 163, 184, 0.1));
    box-shadow: var(--iam-card-shadow, 0 10px 24px rgba(0, 0, 0, 0.3));
    margin-bottom: 24px;
    backdrop-filter: blur(12px);
  }

  .summary-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .summary-head .eyebrow {
    font-size: 0.9rem;
    color: var(--iam-teal);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 800;
  }

  .summary-head h2 {
    font-size: 1.5rem;
    color: var(--iam-text-primary);
  }

  .iam-pill {
    display: grid;
    gap: 2px;
    padding: 10px 14px;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(168, 85, 247, 0.3);
    min-width: 120px;
  }

  .iam-pill span {
    font-size: 0.75rem;
    color: var(--iam-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .iam-pill strong {
    font-size: 0.98rem;
    color: #0f172a;
  }

  .scores {
    display: grid;
    gap: 12px;
  }

  .score-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .score-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .score-row strong {
    font-size: 0.9rem;
    color: #334155;
  }

  .score-row span {
    font-weight: 800;
    color: #0f172a;
  }

  .meter {
    height: 9px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .meter span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--iam-gradient);
    box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
    transition: width 0.3s ease-out;
  }

  .empty-summary {
    padding: 24px;
    border-radius: 18px;
    background: var(--iam-card-bg);
    border: 1px dashed var(--iam-card-border);
    color: var(--iam-text-secondary);
    text-align: center;
  }

  @media (max-width: 768px) {
    .summary-card {
      padding: 12px;
    }

    .summary-head h2 {
      font-size: 1.2rem;
    }

    .scores {
      gap: 8px;
    }
  }
</style>
