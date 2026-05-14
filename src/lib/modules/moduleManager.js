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
module.exports = { retakeModule };
