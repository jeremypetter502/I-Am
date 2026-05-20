<script>
  import Summary from '../components/Summary.svelte';
  import ModuleList from '../components/ModuleList.svelte';
  import { onMount } from 'svelte';
  import sessionService from '../services/sessionService.js';

  let profile = null;
  let saved = null;

  function loadState() {
    try {
      const raw = localStorage.getItem('iam_profile');
      const parsed = raw ? JSON.parse(raw) : null;
      const savedBase = sessionService.loadBaseContext();
      if (parsed && savedBase && typeof savedBase === 'object') {
        parsed.profile = parsed.profile || {};
        if (!parsed.profile.base || Object.keys(parsed.profile.base).length === 0) {
          parsed.profile.base = { ...savedBase };
        }
      }
      profile = parsed;
      const s = localStorage.getItem('iam_inprogress_v1');
      saved = s ? JSON.parse(s) : null;
    } catch (e) {
      profile = null;
      saved = null;
    }
  }

  onMount(() => {
    loadState();
    window.addEventListener('storage', loadState);
    window.addEventListener('hashchange', loadState);
    return () => {
      window.removeEventListener('storage', loadState);
      window.removeEventListener('hashchange', loadState);
    };
  });

  $: modulesToShow = (profile && profile.modules) ? profile.modules : (saved && saved.modules) ? saved.modules : {};
  $: moduleCount = Object.keys(modulesToShow || {}).length;
  $: completedCount = Object.values(modulesToShow || {}).filter((mod) => mod && mod.completed).length;
  $: hasModules = moduleCount > 0;
</script>

<section class="review-shell">
  <div class="review-topbar">
    <a class="back-link" href="#/survey">← Back to survey</a>
    <div class="review-kicker">
      <span class="pill">Review mode</span>
      <span class="pill soft">{completedCount}/{moduleCount || 0} modules complete</span>
    </div>
  </div>

  <div class="review-hero">
    <div>
      <p class="eyebrow">What you have so far</p>
      <h2>See the completed modules, their timestamps, and the current profile snapshot.</h2>
      <p>This view mirrors the exported ContextFile so users can confirm exactly what will be downloaded or reused later.</p>
    </div>
    <div class="review-summary">
      <div class="summary-stat">
        <span>Modules found</span>
        <strong>{moduleCount}</strong>
      </div>
      <div class="summary-stat">
        <span>Completed</span>
        <strong>{completedCount}</strong>
      </div>
      <div class="summary-stat">
        <span>Next step</span>
        <strong>{hasModules ? 'Retake or export' : 'Start survey'}</strong>
      </div>
    </div>
  </div>

  {#if hasModules}
    {#if profile}
      <Summary {profile} />
    {/if}

    <div class="section-head">
      <h3>Modules</h3>
      <span>Completed modules show up here immediately after export or resume.</span>
    </div>
    <ModuleList modules={modulesToShow} />
  {:else}
    <div class="empty-card">
      <p>No profile or saved progress yet.</p>
      <span>Take the survey to generate a profile, then come back here to review the modules.</span>
      <a href="#/survey">Start the survey</a>
    </div>
  {/if}
</section>

<style>
  .review-shell {
    display: grid;
    gap: 18px;
  }

  .review-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .back-link {
    color: #4338ca;
    font-weight: 800;
  }

  .review-kicker {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pill {
    padding: 8px 12px;
    border-radius: 999px;
    background: #4338ca;
    color: #f8fafc;
    font-size: 0.82rem;
    font-weight: 800;
  }

  .pill.soft {
    background: rgba(255, 255, 255, 0.8);
    color: #0f172a;
    border: 1px solid rgba(148, 163, 184, 0.28);
  }

  .review-hero,
  .empty-card {
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.22);
    box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08);
  }

  .review-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.8fr);
    gap: 20px;
    padding: 22px;
  }

  .review-hero h2 {
    margin: 6px 0 10px;
    font-size: clamp(1.6rem, 3vw, 2.5rem);
    line-height: 1.08;
  }

  .review-hero p {
    margin: 0;
    color: #475569;
    max-width: 60ch;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 0.75rem;
    font-weight: 800;
    color: #6366f1;
  }

  .review-summary {
    display: grid;
    gap: 12px;
  }

  .summary-stat {
    padding: 16px;
    border-radius: 18px;
    background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%);
    border: 1px solid rgba(99, 102, 241, 0.12);
  }

  .summary-stat span {
    display: block;
    font-size: 0.82rem;
    color: #64748b;
  }

  .summary-stat strong {
    display: block;
    margin-top: 4px;
    color: #0f172a;
    font-size: 1.15rem;
  }

  .section-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: end;
    flex-wrap: wrap;
  }

  .section-head h3,
  .section-head span {
    margin: 0;
  }

  .section-head span {
    color: #64748b;
  }

  .empty-card {
    padding: 24px;
    text-align: center;
    display: grid;
    gap: 10px;
    place-items: center;
  }

  .empty-card p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .empty-card span {
    color: #475569;
    max-width: 54ch;
  }

  .empty-card a {
    margin-top: 4px;
    padding: 10px 14px;
    border-radius: 999px;
    background: #0f172a;
    color: #f8fafc;
    font-weight: 800;
  }

  @media (max-width: 900px) {
    .review-hero {
      grid-template-columns: 1fr;
    }
  }
</style>
