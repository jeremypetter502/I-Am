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

  const skillsSummary = buildSkillsSummary(oldMods, newMods);

  return { added, removed, updated, inferred, skillsSummary };
}

function buildSkillsSummary(oldMods = {}, newMods = {}) {
  const oldSkills = oldMods.skills;
  const newSkills = newMods.skills;
  if (!newSkills) return '';
  const changed = !oldSkills || JSON.stringify(oldSkills) !== JSON.stringify(newSkills);
  if (!changed) return '';

  const list = Array.isArray(newSkills.filtered)
    ? newSkills.filtered
    : Array.isArray(newSkills.responses)
      ? newSkills.responses
      : [];

  const confirmed = list.filter((item) => item && item.listed_status === 'confirmed').length;
  const conditional = list.filter((item) => item && item.listed_status === 'conditional').length;
  return `Added Skills Assessment module: ${confirmed} confirmed skills, ${conditional} conditional skills`;
}

function summaryText(diff) {
  const parts = [];
  if (diff.skillsSummary) parts.push(diff.skillsSummary);
  if (diff.added.length) parts.push(`Added: ${diff.added.join(', ')}`);
  if (diff.removed.length) parts.push(`Removed: ${diff.removed.join(', ')}`);
  if (diff.updated.length) parts.push(`Updated: ${diff.updated.join(', ')}`);
  if (diff.inferred.length) parts.push(`Inferred: ${diff.inferred.join(', ')}`);
  return parts.join('\n') || 'No changes';
}

export { diffProfiles, summaryText };
