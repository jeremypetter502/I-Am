import onetIndex from './onet-index.json' with { type: 'json' };

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateBaseContext(base) {
  if (!base || typeof base !== 'object') return { valid: true, errors: [] };
  const errors = [];

  if (base.onet && typeof base.onet === 'object') {
    if (base.onet.soc_code && !/^\d{2}-\d{4}$/.test(String(base.onet.soc_code))) {
      errors.push('onet.soc_code must match NN-NNNN format');
    }
    if (base.onet.title && String(base.onet.title).trim().length === 0) {
      errors.push('onet.title cannot be empty');
    }
  }

  if (base.years_experience != null) {
    const years = Number(base.years_experience);
    if (!Number.isFinite(years) || years < 0 || years > 80) {
      errors.push('years_experience must be between 0 and 80');
    }
  }

  if (base.short_bio && String(base.short_bio).length > 280) {
    errors.push('short_bio must be <= 280 chars');
  }

  if (base.name && String(base.name).length > 120) {
    errors.push('name must be <= 120 chars');
  }

  if (base.skills && String(base.skills).length > 400) {
    errors.push('skills must be <= 400 chars');
  }

  return { valid: errors.length === 0, errors };
}

export function searchOnetJobs(query, limit = 10, source = onetIndex) {
  const q = normalizeText(query);
  if (!q) return [];

  const records = Array.isArray(source) ? source : [];
  const scored = [];

  for (const item of records) {
    const title = normalizeText(item.title);
    const aliases = Array.isArray(item.aliases) ? item.aliases.map(normalizeText) : [];
    const soc = normalizeText(item.soc_code);

    let score = 0;
    if (title === q) score += 200;
    if (title.startsWith(q)) score += 120;
    if (title.includes(q)) score += 80;
    if (soc.startsWith(q)) score += 100;

    for (const alias of aliases) {
      if (alias === q) score += 180;
      else if (alias.startsWith(q)) score += 100;
      else if (alias.includes(q)) score += 60;
    }

    if (score > 0) {
      scored.push({
        soc_code: item.soc_code,
        title: item.title,
        aliases: item.aliases || [],
        score
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(({ score, ...rest }) => rest);
}

export function normalizeBaseContext(base) {
  if (!base || typeof base !== 'object') return {};
  const out = { ...base };

  if (out.job_title != null) out.job_title = String(out.job_title).trim();
  if (out.company != null) out.company = String(out.company).trim();
  if (out.name != null) out.name = String(out.name).trim().slice(0, 120);
  if (out.skills != null) out.skills = String(out.skills).trim().slice(0, 400);
  if (out.timezone != null) out.timezone = String(out.timezone).trim();
  if (out.locale != null) out.locale = String(out.locale).trim();
  if (out.communication_style != null) out.communication_style = String(out.communication_style).trim();
  if (out.short_bio != null) out.short_bio = String(out.short_bio).trim().slice(0, 280);

  if (out.years_experience != null) {
    const num = Number(out.years_experience);
    out.years_experience = Number.isFinite(num) ? Math.max(0, Math.min(80, num)) : undefined;
  }

  if (out.onet && typeof out.onet === 'object') {
    out.onet = {
      soc_code: String(out.onet.soc_code || '').trim(),
      title: String(out.onet.title || '').trim(),
      version: out.onet.version ? String(out.onet.version).trim() : undefined
    };
    if (!out.onet.soc_code || !out.onet.title) delete out.onet;
  }

  return out;
}

export function getOnetIndex() {
  return Array.isArray(onetIndex) ? onetIndex : [];
}
