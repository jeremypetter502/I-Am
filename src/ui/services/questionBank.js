const QUESTION_TEXT_BY_FILE = typeof import.meta !== 'undefined' && typeof import.meta.glob === 'function'
  ? Object.fromEntries(
      Object.entries(
        import.meta.glob('../../../specs/questions/*.txt', { query: '?raw', import: 'default', eager: true })
      ).map(([filePath, text]) => [filePath.split('/').pop(), text])
    )
  : {};

function parseQuestions(txt) {
  return String(txt ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line))
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .map((line) => line.replace(/\s*\[[^\]]+\]/g, '').replace(/\s{2,}/g, ' ').trim())
    .filter(Boolean);
}

export async function loadQuestionBank(fileName) {
  const key = String(fileName || '').trim();
  const bundled = QUESTION_TEXT_BY_FILE[key];
  if (bundled !== undefined) {
    return parseQuestions(bundled);
  }

  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const p = path.resolve(process.cwd(), 'specs', 'questions', key);
      const txt = await fs.promises.readFile(p, 'utf8');
      return parseQuestions(txt);
    } catch (_err) {
      // fall through to a clear error below
    }
  }

  throw new Error(`Question bank not bundled: ${key}`);
}
