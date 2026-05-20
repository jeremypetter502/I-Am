<script>
  import SurveyPage from './pages/SurveyPage.svelte';
</script>

<div class="iam-header">
  <img src="/iam-logo.png" alt="IAM Logo" class="iam-logo" />
  <div class="iam-title">
    <h1>I-Am Context Generator</h1>
    <p class="subtitle">Compact, portable personality & skills profile for LLMs</p>
  </div>
</div>

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
    --iam-dark: #111827;
    --iam-card-bg: rgba(30, 41, 59, 0.7);
    --iam-card-border: rgba(148, 163, 184, 0.1);
    --iam-card-shadow: 0 16px 34px rgba(0, 0, 0, 0.3);
    --iam-gradient: linear-gradient(135deg, var(--iam-purple) 0%, var(--iam-red) 20%, var(--iam-orange) 40%, var(--iam-green) 60%, var(--iam-teal) 80%, var(--iam-blue) 100%);
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
    border-color: var(--iam-teal) !important;
    box-shadow: 0 14px 24px rgba(6, 182, 212, 0.15) !important;
  }

  :global(.answer-chip.sel) {
    background: var(--iam-gradient) !important;
    border-color: transparent !important;
    box-shadow: 0 14px 26px rgba(168, 85, 247, 0.25) !important;
  }
  
  :global(.answer-chip.sel .value) {
    color: #fff !important;
    opacity: 1;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  :global(.nav button),
  :global(button.primary) {
    background: var(--iam-gradient) !important;
    color: #fff !important;
    border: none;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3) !important;
    border-radius: 999px !important;
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
    background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 30%),
                radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 30%);
    z-index: -1;
    pointer-events: none;
  }

  :global(a) {
    color: inherit;
    text-decoration: none;
  }

  .iam-header {
    display: flex;
    align-items: center;
    gap: 24px;
    justify-content: center;
    margin-bottom: 24px;
    margin-top: 32px;
    padding: 0 16px;
  }

  .iam-logo {
    width: 96px;
    height: 96px;
    flex-shrink: 0;
    border-radius: 50%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .iam-logo:hover {
    transform: scale(1.05) rotate(5deg);
  }

  .iam-title h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 8px 0;
    background: var(--iam-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
  }

  .iam-title .subtitle {
    font-size: 1.15rem;
    color: #94A3B8;
    margin: 0;
    font-weight: 500;
    max-width: 480px;
    line-height: 1.4;
  }

  .app-shell {
    min-height: 100vh;
    padding: 16px 16px 64px;
  }

  .content {
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 12px;
  }

  @media (max-width: 768px) {
    .iam-header {
      flex-direction: column;
      text-align: center;
      gap: 16px;
      margin-top: 24px;
    }
    .iam-logo {
      width: 72px;
      height: 72px;
    }
    .iam-title h1 {
      font-size: 1.8rem;
    }
    .iam-title .subtitle {
      font-size: 1rem;
    }
    .app-shell {
      padding: 12px 12px 40px;
    }
  }
</style>
