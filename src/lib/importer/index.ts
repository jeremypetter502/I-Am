import fs from 'fs';

export async function importJson(path: string) {
  // Placeholder: validate with AJV and return parsed content
  const content = JSON.parse(fs.readFileSync(path, 'utf8'));
  return { profile: content, inferredFields: [] };
}
