<script>
  import SurveyPage from './pages/SurveyPage.svelte';
</script>

<div class="app-shell">
  <main class="content">
    <SurveyPage />
  </main>
</div>

<style>
  :global(:root) {
    --iam-purple: #A855F7;
    --iam-red: #EF4444;
    --iam-orange: #F59E0B;
    --iam-green: #84CC16;
    --iam-teal: #06B6D4;
    --iam-blue: #3B82F6;
    --iam-indigo: #6366f1;
    --iam-dark: #111827;
    --iam-card-bg: rgba(30, 41, 59, 0.7);
    --iam-card-border: rgba(148, 163, 184, 0.1);
    --iam-card-shadow: 0 16px 34px rgba(0, 0, 0, 0.3);
    --iam-button-bg: var(--iam-indigo);
    --iam-text-primary: #F8FAFC;
    --iam-text-secondary: #94A3B8;
    --iam-button-hover: rgba(255, 255, 255, 0.1);
    --iam-button-active: scale(0.95);
  }

  :global(body) {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--iam-dark);
    color: var(--iam-text-primary);
    overflow-x: hidden;
  }

  /* Global UI Consistency Overrides - Dark Mode & Squeezy UI */
  :global(.state-card),
  :global(.question-card),
  :global(.summary-card),
  :global(.module) {
    background: var(--iam-card-bg) !important;
    border: 1px solid var(--iam-card-border) !important;
    box-shadow: var(--iam-card-shadow) !important;
    color: var(--iam-text-primary) !important;
    backdrop-filter: blur(12px);
  }

  :global(.state-card h3),
  :global(.question-meta h3),
  :global(.summary-head h2),
  :global(.module .label) {
    color: var(--iam-text-primary) !important;
    font-size: clamp(1.2rem, 1.8vw, 1.6rem);
  }

  :global(.state-card p),
  :global(.scale-note),
  :global(.hint),
  :global(.module-desc) {
    color: var(--iam-text-secondary) !important;
  }
  
  :global(.scale-note) {
    background: rgba(0, 0, 0, 0.2) !important;
    border: 1px solid var(--iam-card-border) !important;
  }

  :global(button),
  :global(.answer-chip) {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease !important;
  }

  :global(button:active),
  :global(.answer-chip:active) {
    transform: scale(0.95) !important;
  }

  :global(.answer-chip) {
    background: rgba(30, 41, 59, 0.5) !important;
    border: 1px solid rgba(148, 163, 184, 0.2) !important;
    backdrop-filter: blur(4px);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease !important;
  }

  :global(.answer-chip .value) {
    color: var(--iam-text-primary) !important;
    opacity: 0.9;
  }

  :global(.answer-chip:hover),
  :global(.answer-chip:focus-visible) {
    transform: translateY(-4px) scale(1.02) !important;
    border-color: var(--iam-button-bg) !important;
    box-shadow: 0 14px 24px rgba(99, 102, 241, 0.15) !important;
  }

  :global(.answer-chip.sel) {
    background: var(--iam-button-bg) !important;
    border-color: transparent !important;
    box-shadow: 0 14px 26px rgba(99, 102, 241, 0.25) !important;
  }
  
  :global(.answer-chip.sel .value) {
    color: #fff !important;
    opacity: 1;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  :global(.nav button),
  :global(button.primary) {
    background: var(--iam-button-bg) !important;
    color: #fff !important;
    border: none;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
    border-radius: 999px !important;
    padding: 12px 20px !important;
    font-size: 1rem !important;
  }
  
  :global(.nav button:disabled) {
    background: rgba(148, 163, 184, 0.2) !important;
    color: rgba(148, 163, 184, 0.5) !important;
    box-shadow: none !important;
  }

  :global(body::before) {
    content: "";
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 30%);
    z-index: -1;
    pointer-events: none;
  }

  :global(a) {
    color: inherit;
    text-decoration: none;
  }

  .app-shell {
    min-height: 100vh;
    padding: 12px;
    display: flex;
    justify-content: center;
  }

  .content {
    width: 100%;
    max-width: 1000px;
  }

  @media (max-width: 768px) {
    .app-shell {
      padding: 8px;
    }
  }

  @media (max-width: 480px) {
    .app-shell {
      padding: 4px;
    }
  }
</style>
