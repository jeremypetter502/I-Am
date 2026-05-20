function retakeModule(profile, name, newData) {
  profile = profile || {};
  profile.modules = profile.modules || {};
  profile.modules[name] = newData;
  // update modules_meta array if present
  if (profile.modules_meta && Array.isArray(profile.modules_meta)) {
    const idx = profile.modules_meta.findIndex(m => m.name === name);
    const meta = { name, updated_at: new Date().toISOString() };
    if (idx >= 0) profile.modules_meta[idx] = Object.assign(profile.modules_meta[idx], meta);
    else profile.modules_meta.push(meta);
  }
  return profile;
}

const MODULE_DEFINITIONS = [
  { key: 'base', label: 'Base Context', expectedLength: 1 },
  { key: 'ipip', label: 'IPIP', expectedLength: 50 },
  { key: 'aesthetics', label: 'Aesthetics', expectedLength: 32 },
  { key: 'music', label: 'Music', expectedLength: 20 },
  { key: 'communication', label: 'Communication', expectedLength: 20 }
];

export { retakeModule, MODULE_DEFINITIONS };
