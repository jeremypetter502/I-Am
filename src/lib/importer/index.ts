import fs from 'fs';

export async function importJson(path: string) {
  const content = JSON.parse(fs.readFileSync(path, 'utf8'));
  const root = content?.profile && typeof content.profile === 'object' ? content.profile : content;
  const modules = root?.modules && typeof root.modules === 'object' ? root.modules : {};

  if (modules.skills && typeof modules.skills === 'object') {
    if (Array.isArray(modules.skills.responses)) {
      modules.skills.responses = modules.skills.responses.map((item: unknown) => (
        item && typeof item === 'object' ? { ...(item as Record<string, unknown>) } : item
      ));
    }
    if (Array.isArray(modules.skills.filtered)) {
      modules.skills.filtered = modules.skills.filtered.map((item: Record<string, unknown>) => ({ ...item }));
    }
    if (modules.skills.testAnswers && typeof modules.skills.testAnswers === 'object') {
      modules.skills.testAnswers = Object.fromEntries(
        Object.entries(modules.skills.testAnswers as Record<string, Record<string, unknown>>).map(([indexKey, value]) => [indexKey, {
          interview_defense: Boolean(value?.interview_defense),
          day_one_autonomy: Boolean(value?.day_one_autonomy),
          relevance_recency: Boolean(value?.relevance_recency)
        }])
      );
    }
    if ((modules.skills as Record<string, unknown>).disabled === true) {
      (modules.skills as Record<string, unknown>).disabled = true;
    }
  }

  if (modules.state && typeof modules.state === 'object') {
    const state = modules.state as Record<string, unknown>;
    modules.state = {
      bandwidth: Number.isFinite(Number(state.bandwidth)) ? Math.max(0, Math.min(100, Math.round(Number(state.bandwidth)))) : 50,
      mode: state.mode === 'divergent' ? 'divergent' : 'convergent',
      horizon: state.horizon === 'now' ? 'now' : 'long',
      stakes: state.stakes === 'critical' ? 'critical' : 'casual',
      completed: state.completed === undefined ? true : Boolean(state.completed),
      disabled: state.disabled === true,
      last_updated: state.last_updated
    };
  }

  for (const [moduleKey, moduleValue] of Object.entries(modules)) {
    if (!moduleValue || typeof moduleValue !== 'object' || Array.isArray(moduleValue)) continue;
    modules[moduleKey] = {
      ...(moduleValue as Record<string, unknown>),
      disabled: (moduleValue as Record<string, unknown>).disabled === true
    };
  }

  return { profile: content, inferredFields: [] };
}
