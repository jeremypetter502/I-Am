// import.meta.glob is a build-time macro: Vite replaces this call expression with a
// generated object literal at build time. It must be invoked directly (not behind a
// typeof/feature-detection check) or the replacement never happens and this always
// evaluates to an empty object at runtime.
let QUESTION_TEXT_BY_FILE = {};
try {
  QUESTION_TEXT_BY_FILE = Object.fromEntries(
    Object.entries(
      import.meta.glob('../../../specs/questions/*.txt', { query: '?raw', import: 'default', eager: true })
    ).map(([filePath, text]) => [filePath.split('/').pop(), text])
  );
} catch (_err) {
  QUESTION_TEXT_BY_FILE = {};
}

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
