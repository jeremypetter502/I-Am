<script>
  import MarkdownContent from '../components/MarkdownContent.svelte';
  import { answerCombinations, findResponse } from '../services/usageResults.js';

  export let session = null;

  let selectedQuestionIndex = 0;
  let leftSelection = null;
  let rightSelection = null;
  let previousSession = null;

  function resolveSelection(selection, question, fallbackIndex) {
    const combinations = answerCombinations(question);
    if (findResponse(question, selection)) return selection;
    return combinations[fallbackIndex] || combinations[0] || null;
  }

  function selectModel(side, modelName) {
    const model = selectedQuestion?.models.find((item) => item.name === modelName);
    const next = model?.profiles[0] ? { modelName, personalityName: model.profiles[0].name } : null;
    if (side === 'left') leftSelection = next;
    else rightSelection = next;
  }

  function selectProfile(side, personalityName) {
    const previous = side === 'left' ? leftSelection : rightSelection;
    const next = previous ? { ...previous, personalityName } : null;
    if (side === 'left') leftSelection = next;
    else rightSelection = next;
  }

  $: if (session !== previousSession) {
    previousSession = session;
    selectedQuestionIndex = 0;
    leftSelection = null;
    rightSelection = null;
  }
  $: selectedQuestion = session?.questions?.[selectedQuestionIndex] || null;
  $: leftSelection = resolveSelection(leftSelection, selectedQuestion, 0);
  $: rightSelection = resolveSelection(rightSelection, selectedQuestion, 1);
  $: leftResponse = findResponse(selectedQuestion, leftSelection);
  $: rightResponse = findResponse(selectedQuestion, rightSelection);
</script>

<svelte:head>
  <title>{session ? `${session.metadata.title} | I-AM Usage Results` : 'Usage results not found | I-AM'}</title>
</svelte:head>

{#if !session}
  <main class="usage-shell"><section class="notice-card"><h1>Usage results not found</h1><p>This results page does not have a matching usage Markdown source.</p></section></main>
{:else if session.errors.length}
  <main class="usage-shell"><section class="notice-card"><h1>Usage results unavailable</h1><p>This source file has content errors and cannot be compared.</p></section></main>
{:else}
  <main class="usage-shell">
    <header class="usage-header">
      <p class="eyebrow">Usage results</p>
      <h1>{session.metadata.title}</h1>
      <dl class="metadata"><div><dt>Category</dt><dd>{session.metadata.category}</dd></div><div><dt>Participants</dt><dd>{session.metadata.participants}</dd></div><div><dt>Date</dt><dd>{session.metadata.date}</dd></div></dl>
    </header>

    {#if selectedQuestion}
      <section class="control-card" aria-label="Question selection">
        <label for="usage-question">Question title</label>
        <select id="usage-question" bind:value={selectedQuestionIndex}>
          {#each session.questions as question, index}<option value={index}>{question.title}</option>{/each}
        </select>
      </section>

      {#if selectedQuestion.questionMarkdown.trim()}
        <section class="question-card" aria-labelledby="actual-question-title">
          <h2 id="actual-question-title">Question</h2>
          <MarkdownContent markdown={selectedQuestion.questionMarkdown} />
        </section>
      {/if}

      <section class="comparison-grid" aria-label="Answer comparison">
        {#each [{ label: 'Left answer', selection: leftSelection, response: leftResponse, side: 'left' }, { label: 'Right answer', selection: rightSelection, response: rightResponse, side: 'right' }] as panel}
          <article class="answer-panel" aria-label={panel.label}>
            <label for={`${panel.side}-model`}>Model</label>
            <select id={`${panel.side}-model`} value={panel.selection?.modelName || ''} on:change={(event) => selectModel(panel.side, event.currentTarget.value)}>
              {#each selectedQuestion.models as model}<option value={model.name}>{model.name}</option>{/each}
            </select>
            <label for={`${panel.side}-profile`}>Personality</label>
            <select id={`${panel.side}-profile`} value={panel.selection?.personalityName || ''} on:change={(event) => selectProfile(panel.side, event.currentTarget.value)}>
              {#each selectedQuestion.models.find((model) => model.name === panel.selection?.modelName)?.profiles || [] as profile}<option value={profile.name}>{profile.name}</option>{/each}
            </select>
            {#if panel.response}
              <div class="answer-content" aria-live="polite"><MarkdownContent markdown={panel.response.answerMarkdown} /></div>
              {#each panel.response.followUps as followUp}
                <section class="follow-up"><h3>{followUp.question}</h3><MarkdownContent markdown={followUp.answerMarkdown} /></section>
              {/each}
            {:else}
              <p class="unavailable">This answer combination is unavailable.</p>
            {/if}
          </article>
        {/each}
      </section>
    {:else}
      <section class="notice-card"><h1>No questions available</h1><p>This usage result has no question data to compare.</p></section>
    {/if}
  </main>
{/if}

<style>
  .usage-shell { max-width: 1240px; margin: 0 auto; display: grid; gap: 18px; padding: 18px 8px 32px; }
  .usage-header, .control-card, .question-card, .answer-panel, .notice-card { background: var(--iam-card-bg); border: 1px solid var(--iam-card-border); border-radius: 18px; box-shadow: var(--iam-card-shadow); backdrop-filter: blur(12px); }
  .usage-header, .question-card, .answer-panel, .notice-card { padding: clamp(18px, 3vw, 30px); }
  .eyebrow { margin: 0; color: var(--iam-teal); text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; font-weight: 800; }
  h1, h2, h3 { margin-top: 0; } h1 { margin-bottom: 10px; } h2 { font-size: 1.2rem; } h3 { font-size: 1rem; }
  .metadata { margin: 18px 0 0; display: flex; flex-wrap: wrap; gap: 10px; } .metadata div { min-width: 130px; padding: 9px 12px; border-radius: 10px; background: rgba(15, 23, 42, .45); } dt { color: var(--iam-text-secondary); font-size: .75rem; } dd { margin: 2px 0 0; font-weight: 700; }
  .control-card { padding: 16px; display: grid; gap: 7px; } label { font-weight: 700; color: var(--iam-text-primary); } select { width: 100%; box-sizing: border-box; border: 1px solid rgba(148, 163, 184, .45); border-radius: 9px; padding: 10px; background: #1e293b; color: var(--iam-text-primary); font: inherit; } select:focus-visible { outline: 3px solid var(--iam-teal); outline-offset: 2px; }
  .question-card { border-color: rgba(6, 182, 212, .38); } .question-card h2 { color: var(--iam-teal); }
  .comparison-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; } .answer-panel { min-width: 0; display: grid; align-content: start; gap: 8px; } .answer-panel > h2 { color: var(--iam-purple); margin-bottom: 5px; } .answer-content { margin-top: 14px; }
  .follow-up { border-top: 1px solid rgba(148, 163, 184, .28); margin-top: 18px; padding-top: 16px; } .follow-up h3 { color: var(--iam-teal); } .unavailable { color: var(--iam-text-secondary); }
  @media (max-width: 767px) { .comparison-grid { grid-template-columns: 1fr; } .usage-shell { padding-inline: 0; } }
</style>
