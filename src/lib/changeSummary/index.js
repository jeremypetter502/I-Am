function diffProfiles(oldP = {}, newP = {}) {
  const added = [];
  const removed = [];
  const updated = [];
  const inferred = [];

  // compare top-level keys in profile
  const oldKeys = new Set(Object.keys(oldP));
  const newKeys = new Set(Object.keys(newP));
  for (const k of newKeys) if (!oldKeys.has(k)) added.push(k);
  for (const k of oldKeys) if (!newKeys.has(k)) removed.push(k);
  // check modules diff
  const oldMods = (oldP.modules) || {};
  const newMods = (newP.modules) || {};
  for (const m of Object.keys(newMods)) {
    if (!oldMods[m]) added.push('module:' + m);
    else if (JSON.stringify(oldMods[m]) !== JSON.stringify(newMods[m])) updated.push('module:' + m);
  }
  for (const m of Object.keys(oldMods)) if (!newMods[m]) removed.push('module:' + m);

  // inferred fields placeholder: find keys explicitly set to null in newP
  for (const [k,v] of Object.entries(newP)) if (v === null) inferred.push(k);

  return { added, removed, updated, inferred };
}

function summaryText(diff) {
  const parts = [];
  if (diff.added.length) parts.push(`Added: ${diff.added.join(', ')}`);
  if (diff.removed.length) parts.push(`Removed: ${diff.removed.join(', ')}`);
  if (diff.updated.length) parts.push(`Updated: ${diff.updated.join(', ')}`);
  if (diff.inferred.length) parts.push(`Inferred: ${diff.inferred.join(', ')}`);
  return parts.join('\n') || 'No changes';
}

module.exports = { diffProfiles, summaryText };
