<script>
  import { onMount } from 'svelte';
  import SurveyPage from './pages/SurveyPage.svelte';
  import DocPage from './pages/DocPage.svelte';
  import readmeMd from '../../README.md?raw';
  import iamMd from '../../docs/iam.md?raw';
  import iamUsecaseMd from '../../docs/iam-usecase.md?raw';

  const docRoutes = {
    '/readme': { title: 'README', markdown: readmeMd, sourcePath: 'README.md', routePath: '/readme' },
    '/iam': { title: 'I-AM String Format Overview', markdown: iamMd, sourcePath: 'docs/iam.md', routePath: '/iam' },
    '/iam-usecase': { title: 'I-AM Use Cases', markdown: iamUsecaseMd, sourcePath: 'docs/iam-usecase.md', routePath: '/iam-usecase' }
  };

  function normalizePath(value) {
    const raw = String(value || '/').split('#')[0].split('?')[0] || '/';
    let out = raw;
    if (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
    if (out.toLowerCase().endsWith('.html')) out = out.slice(0, -5);
    return out || '/';
  }

  let currentPath = normalizePath(typeof window !== 'undefined' ? window.location.pathname : '/');

  onMount(() => {
    const onPopState = () => {
      currentPath = normalizePath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  });

  $: activeDoc = docRoutes[currentPath] || null;
</script>

<div class="app-shell">
  {#if activeDoc}
    <DocPage
      title={activeDoc.title}
      markdown={activeDoc.markdown}
      sourcePath={activeDoc.sourcePath}
      routePath={activeDoc.routePath}
    />
  {:else}
    <SurveyPage />
  {/if}
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
    /* Prefer dark rendering on platforms that may auto-switch themes */
    color-scheme: dark;
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
  :global(.summary-head h2),
  :global(.module .label) {
    color: var(--iam-text-primary) !important;
    font-size: clamp(1.2rem, 1.8vw, 1.6rem);
  }

  :global(.question-meta h3) {
    color: var(--iam-text-primary) !important;
    font-size: clamp(1.2rem, 1.8vw, 1.6rem);
    font-weight: 600;
  }

  :global(.question-meta .question-num) {
    color: #64748b !important;
    font-weight: 700;
    margin-right: 0.25rem;
  }

  :global(.question-meta .question-text) {
    color: var(--iam-text-primary, #F8FAFC) !important;
    /* Subtle shadow to improve legibility on devices with unexpected background/theme behavior */
    text-shadow: 0 1px 0 rgba(0,0,0,0.35);
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

  /* 3D Console Physical Buttons */
  :global(.answers button:nth-child(1)) { --btn-color: var(--iam-red); --btn-shade: #7f1d1d; }
  :global(.answers button:nth-child(2)) { --btn-color: var(--iam-orange); --btn-shade: #9a3412; }
  :global(.answers button:nth-child(3)) { --btn-color: var(--iam-purple); --btn-shade: #581c87; }
  :global(.answers button:nth-child(4)) { --btn-color: var(--iam-blue); --btn-shade: #1e3a8a; }
  :global(.answers button:nth-child(5)) { --btn-color: var(--iam-green); --btn-shade: #3f6212; }
  :global(.answers button:nth-child(6)) { --btn-color: var(--iam-teal); --btn-shade: #164e63; }
  :global(.answers button:nth-child(7)) { --btn-color: var(--iam-indigo); --btn-shade: #312e81; }

  :global(.answer-chip) {
    box-sizing: border-box !important;
    width: 3.2rem !important;
    height: 3.2rem !important;
    min-width: 3.2rem !important;
    min-height: 3.2rem !important;
    max-width: 3.2rem !important;
    max-height: 3.2rem !important;
    flex-shrink: 0 !important;
    flex-grow: 0 !important;
    aspect-ratio: 1 / 1 !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50% !important;

    /* Base state: lightly translucent blueish plastic with a white center glow */
    background: radial-gradient(
      circle at 45% 35%,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(150, 180, 240, 0.85) 45%,
      rgba(90, 130, 220, 0.75) 100%
    ) !important;
    
    border: none !important;
    backdrop-filter: blur(4px) !important;
    
    /* Shorter 3D edge, with translucent dark side collar */
    box-shadow: 
      inset 0 2px 0px rgba(255, 255, 255, 0.9),    /* sharp top highlight */
      inset 0 -3px 0px rgba(0, 0, 0, 0.15),        /* sharp bottom shadow inside button */
      0 0 0 1px rgba(100, 130, 220, 0.4),          /* very thin inner defining rim */
      0 4px 0 1px rgba(60, 90, 160, 0.45),         /* shorter, translucent side collar */
      0 4px 0 6px #f1f5f9,                         /* white base ring adjusted height */
      0 8px 10px 3px rgba(0, 0, 0, 0.3) !important; /* closer drop shadow */
    
    position: relative;
    overflow: visible !important;
    isolation: isolate;
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease !important;
    cursor: pointer;
    margin: 1rem 1rem !important;
  }

  /* LED Glow overlay that fades in smoothly and grows from the center */
  :global(.answer-chip::before) {
    content: '' !important;
    display: block !important;
    position: absolute;
    inset: 0;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(
      circle at 50% 50%,
      color-mix(in srgb, var(--btn-color) 40%, white 60%) 0%,
      color-mix(in srgb, var(--btn-color) 85%, white 15%) 60%,
      color-mix(in srgb, var(--btn-shade) 100%, black 0%) 100%
    );
    box-shadow: 
      inset 0 2px 0px rgba(255, 255, 255, 0.8),    /* preserve the sharp edge when lit */
      inset 0 -3px 0px rgba(0, 0, 0, 0.2),
      inset 0 0 20px var(--btn-color),             /* Soft inner LED glow */
      0 0 20px 4px var(--btn-color);               /* Outer emit light */
    opacity: 0;
    transform: scale(0.3) !important;
    transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    z-index: 0;
  }

  :global(.answer-chip::after) {
    display: none !important;
  }

  :global(.answer-chip .value) {
    color: #1e3a8a !important; /* readable against pale blue */
    opacity: 1;
    position: relative;
    z-index: 1;
    font-size: 2rem !important;
    font-weight: 900 !important;
    text-shadow: 0 0 0 transparent !important;
    transition: color 0.3s ease, text-shadow 0.3s ease !important;
  }

  :global(.answer-chip:hover),
  :global(.answer-chip:focus-visible) {
    transform: translateY(1px) !important;
    box-shadow: 
      inset 0 2px 0px rgba(255, 255, 255, 1),
      inset 0 -3px 0px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(100, 130, 220, 0.4),
      0 3px 0 1px rgba(60, 90, 160, 0.45),         /* somewhat pressed */
      0 3px 0 6px #f1f5f9,
      0 6px 8px 3px rgba(0, 0, 0, 0.35) !important;
  }

  :global(.answer-chip:active),
  :global(.answer-chip.sel) {
    transform: translateY(4px) !important;
    box-shadow: 
      inset 0 1px 0px rgba(255, 255, 255, 0.4),    /* flatten top highlight */
      inset 0 -1px 0px rgba(0, 0, 0, 0.3),         /* flatten bottom shadow */
      0 0 0 1px rgba(100, 130, 220, 0.4),                           
      0 0px 0 1px rgba(60, 90, 160, 0.45),         /* collar depth gone (pressed flush) */
      0 0px 0 6px #f1f5f9,                         
      0 2px 4px 2px rgba(0, 0, 0, 0.2) !important; /* tight shadow */
  }

  :global(.answer-chip.sel::before),
  :global(.answer-chip:active::before) {
    opacity: 1 !important;
    transform: scale(1) !important;
  }

  :global(.answer-chip.sel .value),
  :global(.answer-chip:active .value) {
    color: #fff !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8), 0 0 12px rgba(255,255,255,0.7) !important;
  }

  @keyframes -global-answer-recorded {
    0% {
      transform: scale(0.96);
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.45);
    }
    45% {
      transform: scale(1.04);
      box-shadow: 0 0 0 10px rgba(99, 102, 241, 0.14);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 14px 26px rgba(99, 102, 241, 0.25);
    }
  }

  @keyframes -global-answer-recorded-flare {
    0% {
      transform: scale(0.95) rotate(0deg);
      box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.45);
    }
    40% {
      transform: scale(1.05) rotate(-1deg);
      box-shadow: 0 0 0 12px rgba(6, 182, 212, 0.16);
    }
    100% {
      transform: scale(1) rotate(0deg);
      box-shadow: 0 14px 26px rgba(99, 102, 241, 0.25);
    }
  }

  @keyframes -global-answer-recorded-wobble {
    0% {
      transform: scale(0.96) translateY(0);
    }
    30% {
      transform: scale(1.03) translateY(-2px) rotate(-1deg);
    }
    60% {
      transform: scale(1.01) translateY(1px) rotate(1deg);
    }
    100% {
      transform: scale(1) translateY(0) rotate(0deg);
    }
  }

  @keyframes -global-answer-recorded-pop {
    0% {
      transform: scale(0.92);
      filter: saturate(1);
    }
    45% {
      transform: scale(1.06);
      filter: saturate(1.35);
    }
    100% {
      transform: scale(1);
      filter: saturate(1);
    }
  }

  @keyframes -global-answer-recorded-ripple {
    0% {
      transform: scale(0.96);
      background-size: 0% 0%, auto;
      background-position: center center, center center;
      filter: saturate(1);
    }
    35% {
      transform: scale(1.03);
      background-size: 2200% 2200%, auto;
      background-position: center center, center center;
      filter: saturate(1.18);
    }
    100% {
      transform: scale(1);
      background-size: 16000% 16000%, auto;
      background-position: center center, center center;
      filter: saturate(1);
    }
  }

  @keyframes -global-answer-bg-rise {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    35% {
      opacity: 0.95;
    }
    78% {
      transform: translateY(0%);
      opacity: 0.9;
    }
    100% {
      transform: translateY(0%);
      opacity: 0.22;
    }
  }

  @keyframes -global-answer-bg-fall {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    35% {
      opacity: 0.95;
    }
    78% {
      transform: translateY(0%);
      opacity: 0.9;
    }
    100% {
      transform: translateY(0%);
      opacity: 0.22;
    }
  }

  @keyframes -global-answer-bg-center {
    0% {
      transform: scaleY(0);
      transform-origin: 50% 50%;
      opacity: 0;
    }
    45% {
      transform: scaleY(1.08);
      opacity: 0.95;
    }
    100% {
      transform: scaleY(1);
      opacity: 0.22;
    }
  }

  @keyframes -global-answer-bg-diagonal {
    0% {
      transform: translate(-70%, 70%) rotate(-8deg);
      opacity: 0;
    }
    45% {
      opacity: 0.95;
    }
    100% {
      transform: translate(0%, 0%) rotate(-8deg);
      opacity: 0.22;
    }
  }

  @keyframes -global-answer-accent-ripple-center {
    0% {
      transform: translate(-50%, -50%) scale(0.15);
      opacity: 0;
    }
    25% {
      opacity: 0.9;
    }
    100% {
      transform: translate(-50%, -50%) scale(18);
      opacity: 0;
    }
  }

  @keyframes -global-answer-accent-ripple-top {
    0% {
      transform: translate(-50%, -50%) scale(0.15);
      opacity: 0;
    }
    22% {
      opacity: 0.95;
    }
    100% {
      transform: translate(-50%, -58%) scale(18);
      opacity: 0;
    }
  }

  @keyframes -global-answer-accent-ripple-bottom {
    0% {
      transform: translate(-50%, -50%) scale(0.15);
      opacity: 0;
    }
    22% {
      opacity: 0.95;
    }
    100% {
      transform: translate(-50%, -42%) scale(18);
      opacity: 0;
    }
  }

  @keyframes -global-answer-accent-ripple-left {
    0% {
      transform: translate(-50%, -50%) scale(0.15);
      opacity: 0;
    }
    24% {
      opacity: 0.9;
    }
    100% {
      transform: translate(-58%, -50%) scale(18);
      opacity: 0;
    }
  }

  @keyframes -global-answer-accent-ripple-right {
    0% {
      transform: translate(-50%, -50%) scale(0.15);
      opacity: 0;
    }
    24% {
      opacity: 0.9;
    }
    100% {
      transform: translate(-42%, -50%) scale(18);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.answer-chip.sel) {
      animation: none;
    }

    :global(.answer-chip.sel::before) {
      animation: none;
      opacity: 0;
    }

    :global(.answer-chip.sel::after) {
      animation: none;
      opacity: 0;
    }
  }

  /* Center up all module answer buttons */
  :global(.answers) {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 1.5rem !important;
    margin: 1rem 0 !important;
  }

  /* Group Prev/Next into a nearly flat grey rounded rectangle */
  :global(.nav),
  :global(.group-box) {
    background-color: #475569 !important; /* solid visible grey */
    padding: 10px 16px !important;
    border-radius: 16px !important;
    display: flex !important;
    justify-content: center !important;
    gap: 16px !important;
    width: max-content !important;
    margin: 2rem auto !important;
    border: 1px solid rgba(0, 0, 0, 0.3) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  }

  :global(.group-box) {
    margin: 0.5rem 0 1rem 0 !important;
    width: max-content !important;
    justify-content: flex-start !important;
    flex-wrap: wrap !important;
  }

  /* --- nav and group buttons (smaller inside the dark rect) --- */
  :global(.nav button) {
    background: radial-gradient(
      ellipse at 50% 30%,
      color-mix(in srgb, var(--iam-button-bg) 40%, white 60%) 0%,
      var(--iam-button-bg) 50%,
      color-mix(in srgb, var(--iam-button-bg) 80%, black 20%) 100%
    ) !important;
    color: #fff !important;
  }

  /* group box unselected buttons appear off/dimmed */
  :global(.group-box button:not(.active)) {
    background: radial-gradient(
      ellipse at 50% 30%,
      #64748b 0%,
      #475569 50%,
      #334155 100%
    ) !important;
    color: #cbd5e1 !important;
  }

  :global(.nav button),
  :global(.group-box button) {
    border: none !important;
    border-radius: 12px !important; /* tighter rounded radius */
    padding: 8px 18px !important; /* slightly smaller */
    font-size: 0.95rem !important;
    font-weight: 800 !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.4) !important;
    box-shadow: 
      inset 0 2px 0px rgba(255, 255, 255, 0.6),    /* sharp top highlight */
      inset 0 -3px 0px rgba(0, 0, 0, 0.2),         /* sharp bottom shadow inside button */
      0 0 0 1px rgba(0, 0, 0, 0.2),                /* very thin inner defining rim */
      0 4px 0 1px rgba(0, 0, 0, 0.5),              /* side collar */
      0 4px 0 4px #475569,                         /* flat grey base ring to match nav housing */
      0 6px 10px 2px rgba(0, 0, 0, 0.4) !important; /* drop shadow */
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important;
    cursor: pointer;
  }

  :global(.nav button:hover),
  :global(.group-box button:hover) {
    transform: translateY(1px) !important;
    box-shadow: 
      inset 0 2px 0px rgba(255, 255, 255, 0.8),
      inset 0 -3px 0px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(0, 0, 0, 0.2),
      0 3px 0 1px rgba(0, 0, 0, 0.5),
      0 3px 0 4px #475569,
      0 5px 8px 2px rgba(0, 0, 0, 0.45) !important;
  }

  :global(.nav button:active:not(:disabled)),
  :global(.group-box button:active:not(:disabled)),
  :global(.group-box button.active) {
    transform: translateY(4px) !important;
    box-shadow: 
      inset 0 1px 0px rgba(255, 255, 255, 0.4),
      inset 0 -1px 0px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.2),
      0 0px 0 1px rgba(0, 0, 0, 0.5),               /* pushed flush */
      0 0px 0 4px #475569,
      0 2px 4px 1px rgba(0, 0, 0, 0.3) !important;
  }

  /* Specific color for selected group-box buttons depending on feature, here we light up as active */
  :global(.group-box button.active) {
    background: radial-gradient(
      ellipse at 50% 30%,
      color-mix(in srgb, var(--iam-teal) 40%, white 60%) 0%,
      var(--iam-teal) 50%,
      color-mix(in srgb, var(--iam-teal) 80%, black 20%) 100%
    ) !important;
    color: #fff !important;
  }

  :global(.nav button:disabled),
  :global(.group-box button:disabled) {
    background: radial-gradient(
      ellipse at 50% 30%,
      #64748b 0%,
      #475569 50%,
      #334155 100%
    ) !important;
    color: #94a3b8 !important;
    cursor: not-allowed !important;
    box-shadow: 
      inset 0 2px 0px rgba(255, 255, 255, 0.1),
      inset 0 -3px 0px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(0, 0, 0, 0.2),
      0 4px 0 1px rgba(0, 0, 0, 0.3),
      0 4px 0 4px #475569,
      0 6px 10px 2px rgba(0, 0, 0, 0.2) !important;
    text-shadow: none !important;
    transform: none !important;
  }

  /* --- primary buttons (larger, pill shape, white base ring) --- */
  :global(button.primary) {
    background: radial-gradient(
      ellipse at 50% 30%,
      color-mix(in srgb, var(--iam-button-bg) 40%, white 60%) 0%,
      var(--iam-button-bg) 50%,
      color-mix(in srgb, var(--iam-button-bg) 80%, black 20%) 100%
    ) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 999px !important; /* perfectly rounded pill ends */
    padding: 12px 24px !important;
    font-size: 1.1rem !important;
    font-weight: 800 !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.4) !important;
    box-shadow: 
      inset 0 2px 0px rgba(255, 255, 255, 0.6),    /* sharp top highlight */
      inset 0 -3px 0px rgba(0, 0, 0, 0.2),         /* sharp bottom shadow inside button */
      0 0 0 1px rgba(0, 0, 0, 0.2),                /* very thin inner defining rim */
      0 4px 0 1px rgba(0, 0, 0, 0.5),              /* side collar */
      0 4px 0 5px #f1f5f9,                         /* white base ring */
      0 8px 10px 2px rgba(0, 0, 0, 0.3) !important; /* drop shadow */
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important;
    cursor: pointer;
  }

  :global(button.primary:hover) {
    transform: translateY(1px) !important;
    box-shadow: 
      inset 0 2px 0px rgba(255, 255, 255, 0.8),
      inset 0 -3px 0px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(0, 0, 0, 0.2),
      0 3px 0 1px rgba(0, 0, 0, 0.5),
      0 3px 0 5px #f1f5f9,
      0 6px 8px 2px rgba(0, 0, 0, 0.35) !important;
  }

  :global(button.primary:active:not(:disabled)) {
    transform: translateY(4px) !important;
    box-shadow: 
      inset 0 1px 0px rgba(255, 255, 255, 0.4),
      inset 0 -1px 0px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.2),
      0 0px 0 1px rgba(0, 0, 0, 0.5),               /* pushed flush */
      0 0px 0 5px #f1f5f9,
      0 2px 4px 1px rgba(0, 0, 0, 0.2) !important;
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
    padding: 16px;
  }

  @media (max-width: 1024px) {
    .app-shell {
      padding: 12px;
    }
  }

  @media (max-width: 768px) {
    .app-shell {
      padding: 6px;
    }
  }

  @media (max-width: 480px) {
    .app-shell {
      padding: 0;
    }
  }
</style>
