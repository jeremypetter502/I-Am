function appendMarkdown(target, key, line) {
  if (!target) return;
  target[key] = target[key] ? `${target[key]}\n${line}` : line;
}

function metadataFromLine(line) {
  const match = String(line || '').match(/^(Title|Category|Participants|Date):\s*(.*)$/i);
  if (!match) return null;
  return { key: match[1].toLowerCase(), value: match[2].trim() };
}

/**
 * Convert a usage-results Markdown document into the hierarchy consumed by the
 * comparison UI. Heading text is deliberately preserved exactly: profile names
 * such as "Sloan" and "Sloane" are separate values.
 */
export function parseUsageMarkdown(markdown, sourceId = '') {
  const session = {
    sourceId,
    metadata: { title: '', category: '', participants: '', date: '' },
    questions: [],
    errors: []
  };
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  let question = null;
  let model = null;
  let response = null;
  let followUp = null;

  const invalidate = (message) => session.errors.push(`${sourceId || 'usage result'}: ${message}`);

  for (const line of lines) {
    const heading = line.match(/^(#{1,4})\s+(.+?)\s*$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      followUp = null;

      if (level === 1) {
        question = { title: text, questionMarkdown: '', models: [] };
        session.questions.push(question);
        model = null;
        response = null;
      } else if (level === 2) {
        if (!question) {
          invalidate(`model "${text}" appears before a question title`);
          model = null;
          response = null;
          continue;
        }
        model = { name: text, profiles: [] };
        question.models.push(model);
        response = null;
      } else if (level === 3) {
        if (!question || !model) {
          invalidate(`profile "${text}" appears before a question and model`);
          response = null;
          continue;
        }
        response = { name: text, answerMarkdown: '', followUps: [] };
        model.profiles.push(response);
      } else if (level === 4) {
        if (!response) {
          invalidate(`follow-up "${text}" appears before a profile response`);
          continue;
        }
        followUp = { question: text, answerMarkdown: '' };
        response.followUps.push(followUp);
      }
      continue;
    }

    if (!question) {
      const metadata = metadataFromLine(line);
      if (metadata) session.metadata[metadata.key] = metadata.value;
      continue;
    }

    if (followUp) appendMarkdown(followUp, 'answerMarkdown', line);
    else if (response) appendMarkdown(response, 'answerMarkdown', line);
    else if (model) {
      // Text directly under a model has no profile owner and cannot be shown.
      if (line.trim()) invalidate(`answer text under model "${model.name}" has no profile`);
    } else appendMarkdown(question, 'questionMarkdown', line);
  }

  for (const field of ['title', 'category', 'participants', 'date']) {
    if (!session.metadata[field]) invalidate(`missing ${field} metadata`);
  }
  if (!session.questions.length) invalidate('contains no question titles');

  return session;
}

export function answerCombinations(question) {
  if (!question) return [];
  return question.models.flatMap((model) =>
    model.profiles.map((profile) => ({ modelName: model.name, personalityName: profile.name }))
  );
}

export function findResponse(question, selection) {
  const model = question?.models.find((item) => item.name === selection?.modelName);
  return model?.profiles.find((item) => item.name === selection?.personalityName) || null;
}
