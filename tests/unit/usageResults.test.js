import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseUsageMarkdown, answerCombinations, findResponse } from '../../src/ui/services/usageResults.js';

describe('usage results parser', () => {
  const source = readFileSync(new URL('../../docs/usage/usage-basic.md', import.meta.url), 'utf8');
  const session = parseUsageMarkdown(source, 'usage-basic');

  it('parses metadata, question titles, and the actual question text', () => {
    expect(session.errors).toEqual([]);
    expect(session.metadata).toEqual({ title: 'Basic Individual Questions', category: 'Basic', participants: '1', date: '9/21/2006' });
    expect(session.questions.map((question) => question.title)).toEqual(['Setting Prompt', 'Entanglement Question']);
    expect(session.questions[1].questionMarkdown.trim()).toBe('Explain quantum entanglement in terms I would understand.');
  });

  it('attaches follow-ups to the selected profile response', () => {
    const question = session.questions[1];
    expect(answerCombinations(question)).toEqual([
      { modelName: 'Gemini 3.6 (Thinking)', personalityName: 'None' },
      { modelName: 'Gemini 3.6 (Thinking)', personalityName: 'Sam' },
      { modelName: 'Gemini 3.6 (Thinking)', personalityName: 'Sloane' }
    ]);
    const sam = findResponse(question, { modelName: 'Gemini 3.6 (Thinking)', personalityName: 'Sam' });
    expect(sam.followUps).toHaveLength(1);
    expect(sam.followUps[0].question).toBe('How was the personality string applied in the above response.');
  });

  it('keeps similarly spelled personality names as separate source labels', () => {
    const parsed = parseUsageMarkdown(`Title: Test\nCategory: Test\nParticipants: 1\nDate: Today\n\n# Question\nPrompt\n## Model\n### Sloan\nFirst\n### Sloane\nSecond`, 'names');
    expect(answerCombinations(parsed.questions[0])).toEqual([
      { modelName: 'Model', personalityName: 'Sloan' },
      { modelName: 'Model', personalityName: 'Sloane' }
    ]);
  });
});
