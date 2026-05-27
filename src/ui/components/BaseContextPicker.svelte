<script>
  import { createEventDispatcher } from 'svelte';
  import { searchOnetJobs, normalizeBaseContext, validateBaseContext } from '../../lib/baseContext/index.js';

  export let value = {};
  const dispatch = createEventDispatcher();

  let query = '';
  let matches = [];
  let errors = [];
  let lastOnetKey = '';

  const timezoneOptions = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Phoenix',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Madrid',
    'Europe/Rome',
    'Europe/Amsterdam',
    'Europe/Stockholm',
    'Europe/Moscow',
    'Africa/Johannesburg',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Hong_Kong',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];

  const localeOptions = [
    'en-US',
    'en-GB',
    'en-CA',
    'en-AU',
    'es-ES',
    'es-MX',
    'fr-FR',
    'fr-CA',
    'de-DE',
    'it-IT',
    'pt-BR',
    'pt-PT',
    'nl-NL',
    'sv-SE',
    'pl-PL',
    'ru-RU',
    'tr-TR',
    'ar-SA',
    'hi-IN',
    'zh-CN',
    'zh-TW',
    'ja-JP',
    'ko-KR'
  ];

  $: form = normalizeBaseContext(value || {});

  // Keep the search box display aligned with the selected O*NET record across remounts/tab switches.
  $: {
    const soc = form?.onet?.soc_code;
    const title = form?.onet?.title;
    const onetKey = soc && title ? `${soc}|${title}` : '';
    if (onetKey && onetKey !== lastOnetKey) {
      query = `${title} (${soc})`;
      lastOnetKey = onetKey;
    } else if (!onetKey) {
      lastOnetKey = '';
    }
  }

  function emit(next) {
    const normalized = normalizeBaseContext(next);
    const check = validateBaseContext(normalized);
    errors = check.errors;
    dispatch('change', { value: normalized, valid: check.valid, errors: check.errors });
  }

  function updateField(field, event) {
    const next = { ...(form || {}), [field]: event.target.value };
    emit(next);
  }

  function runSearch(event) {
    query = event.target.value;
    matches = query.trim() ? searchOnetJobs(query, 8) : [];
  }

  function selectJob(item) {
    const next = {
      ...(form || {}),
      onet: { soc_code: item.soc_code, title: item.title },
      job_title: form.job_title || item.title
    };
    query = `${item.title} (${item.soc_code})`;
    matches = [];
    emit(next);
  }
</script>

<section class="base-context">
  <h4>Basic Context (Optional)</h4>

  <div class="grid">
    <label>Name<input value={form.name || ''} on:input={(e) => updateField('name', e)} /></label>
    <label>Gender<input value={form.gender || ''} on:input={(e) => updateField('gender', e)} /></label>
    <label>
      Birth year
      <input type="number" min="1900" max="2100" step="1" value={form.birth_year ?? ''} on:input={(e) => updateField('birth_year', e)} />
    </label>
    <label>
      Birth month
      <input type="number" min="1" max="12" step="1" value={form.birth_month ?? ''} on:input={(e) => updateField('birth_month', e)} />
    </label>
    <label>
      Birth day
      <input type="number" min="1" max="31" step="1" value={form.birth_day ?? ''} on:input={(e) => updateField('birth_day', e)} />
    </label>
    <label>
      Timezone
      <select value={form.timezone || ''} on:change={(e) => updateField('timezone', e)}>
        <option value="">Select timezone…</option>
        {#each timezoneOptions as timezone}
          <option value={timezone}>{timezone}</option>
        {/each}
      </select>
    </label>
    <label>
      Locale
      <select value={form.locale || ''} on:change={(e) => updateField('locale', e)}>
        <option value="">Select locale…</option>
        {#each localeOptions as locale}
          <option value={locale}>{locale}</option>
        {/each}
      </select>
    </label>
    <label class="full">
      Job search (O*NET)
      <input placeholder="Search job titles (e.g. software engineer)" value={query} on:input={runSearch} />
    </label>
    {#if matches.length}
      <ul class="matches full">
        {#each matches as item}
          <li>
            <button type="button" on:click={() => selectJob(item)}>{item.title} ({item.soc_code})</button>
          </li>
        {/each}
      </ul>
    {/if}
    <label>Job title<input value={form.job_title || ''} on:input={(e) => updateField('job_title', e)} /></label>
    <label>Company<input value={form.company || ''} on:input={(e) => updateField('company', e)} /></label>
    <label>Years experience<input type="number" min="0" max="80" step="0.5" value={form.years_experience ?? ''} on:input={(e) => updateField('years_experience', e)} /></label>
    <label>
      Education level
      <select value={form.education_level || ''} on:change={(e) => updateField('education_level', e)}>
        <option value="">Select…</option>
        <option value="high_school">High School</option>
        <option value="associate">Associate</option>
        <option value="bachelor">Bachelor</option>
        <option value="master">Master</option>
        <option value="doctorate">Doctorate</option>
        <option value="other">Other</option>
      </select>
    </label>
    <label class="full">Skills<textarea rows="2" value={form.skills || ''} placeholder="JavaScript, UX research, data analysis" on:input={(e) => updateField('skills', e)}></textarea></label>
    <label class="full">Communication style<textarea rows="2" value={form.communication_style || ''} placeholder="concise / detailed" on:input={(e) => updateField('communication_style', e)}></textarea></label>
    <label class="full">Favorites<textarea rows="2" value={form.favorites || ''} placeholder="Favorite music, movies, colors, things to do, etc." on:input={(e) => updateField('favorites', e)}></textarea></label>
    <label class="full">Short bio<textarea rows="2" maxlength="280" value={form.short_bio || ''} on:input={(e) => updateField('short_bio', e)}></textarea></label>
  </div>

  {#if errors.length}
    <ul class="errors">
      {#each errors as err}
        <li>{err}</li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .base-context { 
    display: grid; 
    gap: 12px; 
    padding: 20px; 
    border: 1px solid var(--iam-card-border); 
    border-radius: 20px; 
    background: var(--iam-card-bg); 
    backdrop-filter: blur(12px);
    margin-bottom: 24px;
    box-shadow: var(--iam-card-shadow);
  }
  .base-context h4 { margin: 0; font-size: 1.25rem; color: var(--iam-text-primary); }
  .hint { margin: 0; color: var(--iam-text-secondary); font-size: .95rem; }
  label { display: grid; gap: 6px; font-size: .9rem; color: var(--iam-text-primary); font-weight: 500; }
  input, select, textarea { 
    width: 100%; 
    padding: 10px 12px; 
    border-radius: 12px; 
    border: 1px solid rgba(148, 163, 184, 0.12); 
    background: rgba(15, 23, 42, 0.9); 
    color: var(--iam-text-primary); 
    font-size: 0.95rem;
    box-sizing: border-box;
  }
  select option {
    color: var(--iam-text-primary);
    background: rgba(15, 23, 42, 0.95);
  }
  input::placeholder, select::placeholder, textarea::placeholder {
    color: rgba(148, 163, 184, 0.6);
  }
  .grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 12px; }
  .full { grid-column: 1/-1; }
  .matches { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  .matches button { 
    width: 100%; 
    text-align: left; 
    padding: 10px 14px; 
    border-radius: 12px; 
    border: 1px solid rgba(168, 85, 247, 0.4); 
    background: rgba(168, 85, 247, 0.1); 
    color: var(--iam-text-primary);
    transition: background 0.2s;
  }
  .matches button:hover {
    background: rgba(168, 85, 247, 0.25);
  }
  .errors { margin: 0; padding-left: 18px; color: #FCA5A5; font-size: 0.9rem; }

  @media (max-width: 768px) {
    .base-context { padding: 16px; }
    .grid { grid-template-columns: 1fr; }
    label { font-size: 0.85rem; }
    input, select, textarea { font-size: 0.9rem; padding: 8px 10px; }
  }

  @media (max-width: 480px) {
    .base-context { padding: 12px; }
    .base-context h4 { font-size: 1.1rem; }
  }
</style>
