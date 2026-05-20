<script>
  export let modules = {};

  const moduleMeta = {
    ipip: { emoji: '🧠', label: 'Personality', accent: 'violet' },
    aesthetics: { emoji: '🎨', label: 'Aesthetics', accent: 'teal' },
    music: { emoji: '🎵', label: 'Music', accent: 'amber' },
    skills: { emoji: '🛠️', label: 'Skills Assessment', accent: 'teal' },
    state: { emoji: '⚡', label: 'State', accent: 'amber' },
    extended: { emoji: '✨', label: 'Extended', accent: 'slate' }
  };

  function humanize(label) {
    return String(label)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function pickMetrics(mod) {
    const sources = [
      mod && mod.normalized,
      mod && mod.normalized_trait_scores,
      mod && mod.factors,
      mod && mod.raw_trait_scores,
      mod && mod.scores
    ].filter(Boolean);
    const source = sources.find((obj) => obj && typeof obj === 'object') || {};
    return Object.entries(source)
      .filter(([, value]) => typeof value === 'number')
      .slice(0, 4);
  }

  function responseCount(mod) {
    if (Array.isArray(mod && mod.responses)) return mod.responses.length;
    return 0;
  }

  function progressPercent(mod) {
    const responses = responseCount(mod);
    const expected = typeof (mod && mod.expectedLength) === 'number' && mod.expectedLength > 0
      ? mod.expectedLength
      : (mod && mod.completed ? Math.max(responses, 1) : responses || 1);
    if (!responses && !mod.completed) return 0;
    return Math.min(100, Math.round((responses / expected) * 100));
  }
</script>

{#if Object.keys(modules || {}).length > 0}
  <div class="module-grid">
    {#each Object.keys(modules) as name}
      {@const meta = moduleMeta[name] || { emoji: '🧩', label: humanize(name), accent: 'slate' }}
      {@const mod = modules[name] || {}}
      {@const metrics = pickMetrics(mod)}
      <article class={`module-card accent-${meta.accent}`}>
        <div class="module-head">
          <div>
            <p class="eyebrow">{meta.emoji} {meta.label}</p>
            <h4>{humanize(name)}</h4>
          </div>
          <span class:done={mod.completed} class:pending={!mod.completed} class="badge">
            {mod.completed ? 'Completed' : 'In progress'}
          </span>
        </div>

        <div class="module-meta">
          <span>{responseCount(mod)} response{responseCount(mod) === 1 ? '' : 's'}</span>
          {#if mod.last_updated}
            <span>{new Date(mod.last_updated).toLocaleString()}</span>
          {/if}
        </div>

        <div class="meter" aria-hidden="true">
          <span style={`width:${progressPercent(mod)}%`}></span>
        </div>

        {#if metrics.length}
          <div class="chips" aria-label="Module metrics">
            {#each metrics as [metric, value]}
              <span class="chip">{humanize(metric)} · {Math.round(value)}</span>
            {/each}
          </div>
        {/if}
      </article>
    {/each}
  </div>
{:else}
  <div class="empty-state">
    <p>No modules available yet.</p>
    <span>Complete a module or import a ContextFile to populate the review dashboard.</span>
  </div>
{/if}

<style>
  .module-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }

  .module-card {
    padding: 18px;
    border-radius: 20px;
    background: var(--iam-card-bg, rgba(30, 41, 59, 0.7));
    border: 1px solid var(--iam-card-border, rgba(148, 163, 184, 0.1));
    box-shadow: var(--iam-card-shadow, 0 14px 30px rgba(0, 0, 0, 0.3));
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(12px);
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .module-card:hover {
    transform: translateY(-4px);
  }

  .module-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--iam-gradient);
    opacity: 0.05;
    pointer-events: none;
  }

  .module-card.accent-violet { box-shadow: inset 0 0 0 1px var(--iam-purple), var(--iam-card-shadow); }
  .module-card.accent-teal { box-shadow: inset 0 0 0 1px var(--iam-teal), var(--iam-card-shadow); }
  .module-card.accent-amber { box-shadow: inset 0 0 0 1px var(--iam-orange), var(--iam-card-shadow); }
  .module-card.accent-slate { box-shadow: inset 0 0 0 1px rgba(71, 85, 105, 0.08), 0 14px 30px rgba(15, 23, 42, 0.06); }

  .module-head {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 10px;
    position: relative;
    z-index: 1;
  }

  .eyebrow,
  .module-head h4,
  .module-meta span,
  .chips,
  .empty-state p,
  .empty-state span {
    margin: 0;
  }

  .eyebrow {
    color: #6366f1;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
    font-weight: 800;
  }

  .module-head h4 {
    margin-top: 6px;
    font-size: 1.1rem;
  }

  .badge {
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 800;
    white-space: nowrap;
  }

  .badge.done {
    background: rgba(16, 185, 129, 0.16);
    color: #047857;
  }

  .badge.pending {
    background: rgba(99, 102, 241, 0.12);
    color: #4338ca;
  }

  .module-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
    color: #475569;
    font-size: 0.86rem;
    position: relative;
    z-index: 1;
  }

  .module-meta span {
    padding: 6px 10px;
    background: rgba(248, 250, 252, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 999px;
  }

  .meter {
    height: 10px;
    margin-top: 16px;
    border-radius: 999px;
    background: rgba(226, 232, 240, 0.9);
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .meter span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #6366f1, #14b8a6);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
    position: relative;
    z-index: 1;
  }

  .chip {
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.05);
    border: 1px solid rgba(148, 163, 184, 0.18);
    font-size: 0.78rem;
    color: #334155;
  }

  .empty-state {
    padding: 24px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px dashed rgba(99, 102, 241, 0.24);
    display: grid;
    gap: 8px;
    justify-items: start;
  }

  .empty-state p {
    font-weight: 800;
  }

  .empty-state span {
    color: #475569;
  }

  .module {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .module:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
  }

  .module .emoji {
    font-size: 1.5rem;
    margin-right: 12px;
  }

  .module .label {
    font-size: 1rem;
    font-weight: bold;
    color: #333;
  }

  @media (max-width: 768px) {
    .module {
      padding: 8px;
      margin-bottom: 6px;
    }

    .module .emoji {
      font-size: 1.2rem;
    }

    .module .label {
      font-size: 0.9rem;
    }
  }
</style>
