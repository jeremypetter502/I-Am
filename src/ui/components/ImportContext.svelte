<script>
  import { createEventDispatcher } from 'svelte';
  import sessionService from '../services/sessionService.js';
  const dispatch = createEventDispatcher();

  let message = '';
  let error = '';

  async function handleFile(e) {
    error = '';
    message = '';
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const txt = await f.text();
      const obj = JSON.parse(txt);
      const profile = obj.profile || obj;
      if (!profile || !profile.modules) {
        error = 'Invalid ContextFile: missing profile.modules';
        return;
      }

      const modules = profile.modules || {};
      const save = (name, mod) => {
        if (!mod) return;
        const responses = mod.responses || (mod.raw_scores ? [] : null);
        const expected = name === 'ipip' ? 50 : (Array.isArray(responses) ? responses.length : undefined);
        try {
          sessionService.saveProgress(name, { responses, current: (responses ? responses.length : 0), expectedLength: expected });
        } catch (err) {
          console.error('Failed to save imported module', err);
        }
      };

      save('ipip', modules.ipip);
      save('aesthetics', modules.aesthetics);
      save('music', modules.music);

      message = 'ContextFile imported into local progress. You can resume the survey.';
      dispatch('imported', { profile });
    } catch (e) {
      error = e && e.message ? e.message : String(e);
    }
  }
</script>

<div class="import-context">
  <div class="header">
    <div>
      <p class="eyebrow">Import</p>
      <label for="ctxfile">Upload a ContextFile (JSON)</label>
    </div>
    <span>Resume saved modules from a previous export.</span>
  </div>
  <input id="ctxfile" type="file" accept="application/json" on:change={handleFile} />
  {#if message}
    <div class="message">{message}</div>
  {/if}
  {#if error}
    <div class="error">Error: {error}</div>
  {/if}
</div>

<style>
  .import-context {
    padding: 24px;
    border-radius: 20px;
    background: var(--iam-card-bg, rgba(30, 41, 59, 0.7));
    border: 1px solid var(--iam-card-border, rgba(148, 163, 184, 0.1));
    box-shadow: var(--iam-card-shadow, 0 10px 24px rgba(0, 0, 0, 0.3));
    margin-bottom: 24px;
    backdrop-filter: blur(12px);
  }

  .header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .eyebrow {
    font-size: 0.9rem;
    color: var(--iam-teal);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 800;
    margin: 0 0 4px 0;
  }

  label {
    display: block;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--iam-text-primary);
  }

  .header span {
    font-size: 0.95rem;
    color: var(--iam-text-secondary);
  }

  .import-context input[type="file"] {
    display: block;
    width: 100%;
    margin-top: 12px;
    padding: 12px;
    border: 1px dashed rgba(148, 163, 184, 0.4);
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.15);
    color: var(--iam-text-primary);
    cursor: pointer;
  }

  .message {
    margin-top: 16px;
    font-size: 0.95rem;
    padding: 10px 14px;
    background: rgba(132, 204, 22, 0.2);
    border: 1px solid rgba(132, 204, 22, 0.5);
    border-radius: 8px;
    color: #A3E635;
  }

  .error {
    margin-top: 16px;
    font-size: 0.95rem;
    padding: 10px 14px;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 8px;
    color: #FCA5A5;
  }

  @media (max-width: 768px) {
    .import-context {
      padding: 16px;
    }
  }
</style>
