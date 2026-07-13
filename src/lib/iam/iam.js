// Utility: Normalize O*NET SOC code to 8-digit string (e.g., 15-1252 → 15125200)
export function normalizeSoc8(soc_code) {
  if (!soc_code) return '';
  // Accepts XX-XXXX or XX-XXXX.XX, returns 8 digits
  const m = String(soc_code).match(/^(\d{2})-(\d{4})(?:\.(\d{2}))?$/);
  if (!m) return '';
  const main = m[1] + m[2];
  const sub = m[3] || '00';
  return main + sub;
}

const TIMEZONE_ABBREVIATIONS = {
  UTC: 'UTC',
  'Etc/UTC': 'UTC',
  'Etc/GMT': 'GMT',
  'America/New_York': 'EST',
  'America/Detroit': 'EST',
  'America/Toronto': 'EST',
  'America/Chicago': 'CST',
  'America/Winnipeg': 'CST',
  'America/Denver': 'MST',
  'America/Phoenix': 'MST',
  'America/Los_Angeles': 'PST',
  'America/Vancouver': 'PST',
  'America/Anchorage': 'AKST',
  'Pacific/Honolulu': 'HST',
  'Europe/London': 'GMT',
  'Europe/Dublin': 'GMT',
  'Europe/Paris': 'CET',
  'Europe/Berlin': 'CET',
  'Europe/Madrid': 'CET',
  'Europe/Rome': 'CET',
  'Europe/Amsterdam': 'CET',
  'Europe/Stockholm': 'CET',
  'Europe/Moscow': 'MSK',
  'Africa/Johannesburg': 'SAST',
  'Asia/Dubai': 'GST',
  'Asia/Kolkata': 'IST',
  'Asia/Singapore': 'SGT',
  'Asia/Hong_Kong': 'HKT',
  'Asia/Shanghai': 'CST',
  'Asia/Tokyo': 'JST',
  'Asia/Seoul': 'KST',
  'Australia/Sydney': 'AEST',
  'Pacific/Auckland': 'NZST'
};

function titleCase(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text
    .split(/\s+/)
    .map((part) => part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : '')
    .join(' ');
}

function normalizePrefixValue(value) {
  if (value == null) return '';
  const text = String(value).trim();
  return text;
}

function getFirstname(base) {
  const explicit = normalizePrefixValue(base?.first_name || base?.firstname);
  if (explicit) return explicit;
  const name = normalizePrefixValue(base?.name);
  if (!name) return '';
  return name.split(/\s+/)[0] || '';
}

function getTimezoneAbbreviation(timezone) {
  const text = normalizePrefixValue(timezone);
  if (!text) return '';
  if (/^[A-Z]{2,5}$/.test(text)) return text;
  return TIMEZONE_ABBREVIATIONS[text] || '';
}

function buildPrefixSegment(base) {
  const firstName = getFirstname(base);
  const birthYear = Number.isInteger(Number(base?.birth_year))
    ? String(Math.max(1900, Math.min(new Date().getFullYear(), Math.round(Number(base.birth_year)))))
    : '';
  const gender = titleCase(base?.gender);
  const culture = normalizePrefixValue(base?.culture || base?.locale);
  const timezone = getTimezoneAbbreviation(base?.timezone);

  return [firstName, birthYear, gender, culture, timezone].filter(Boolean);
}

function sanitizeNote(n) {
  if (n == null) return '';
  return String(n).trim().replace(/[/:]+/g, '-').replace(/[()]/g, '').replace(/\s+/g, ' ').slice(0, 60);
}

function namedSegment(baseName, moduleObj) {
  const note = moduleObj && (moduleObj.note || (moduleObj.result && moduleObj.result.note));
  if (!note) return baseName;
  const s = sanitizeNote(note);
  return s ? `${baseName}(${s})` : baseName;
}

// --- Career Segment Generator (v0.4) ---
// O*NET 8-digit SOC + S01–S35 skills, sparse encoding
import { skillPositionMap } from './skillPositionMap.js';
import { LfMappings } from './lfMappings.js';

function pad2(n) {
  const v = Math.round(Number(n) || 0);
  return v.toString().padStart(2, '0');
}

function round(n) {
  return Math.round(Number(n) || 0);
}

function skillProficiency(scoreEntry) {
  const normalized = Number(scoreEntry?.normalized_score);
  if (Number.isFinite(normalized)) return Math.round(normalized);

  const raw = Number(scoreEntry?.raw_score);
  if (Number.isFinite(raw)) return Math.round(raw * 10);

  return 0;
}

export function buildCareerSegment(soc8, skills, moduleObj) {
  // skills: array containing either normalized_score (0-100) or raw_score (1-10)
  if (!soc8 || !/^[0-9]{8}$/.test(soc8)) return '';
  const pairs = skills
    .filter((s) => skillProficiency(s) >= 60)
    .sort((a, b) => a.index - b.index)
    .map((s) => `S${pad2(s.index)}${pad2(skillProficiency(s))}`)
    .join('');
  // Use compact prefix `SKL` and include optional module note in parentheses when present
  const prefix = namedSegment('SKL', moduleObj || {});
  return `${prefix}:${soc8}${pairs}`;
}

export function decodeCareerSegment(code) {
  if (!code || typeof code !== 'string') return { soc8: '', skills: [] };
  const m = String(code).match(/(?:CAR|SKL):?(\d{8})(.*)/i);
  if (!m) return { soc8: '', skills: [] };
  const soc8 = m[1];
  const rest = m[2] || '';
  const skills = [];
  const tokenPattern = /S(\d{2})(\d{2,3})/g;
  let tk;
  while ((tk = tokenPattern.exec(rest)) !== null) {
    const idx = Number(tk[1]);
    const score = Number(tk[2]);
    const nameEntry = skillPositionMap.find((e) => Number(e.index.replace(/^S/, '')) === idx);
    skills.push({ index: idx, name: nameEntry ? nameEntry.name : '', score });
  }
  return { soc8, skills };
}

export function buildIam(scored, modules, options) {
  return buildIamLongForm(scored, modules, options);
}

// Helper: compute a simple aggregate score from a normalized metrics object
function computeAggregateFromNormalized(obj) {
  if (!obj || typeof obj !== 'object') return 0;
  const vals = Object.values(obj).filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (!vals.length) return 0;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.round(sum / vals.length);
}

function titleCaseWord(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text[0].toUpperCase() + text.slice(1).toLowerCase();
}

function buildStatePairs(stateObj) {
  if (!stateObj || typeof stateObj !== 'object') return [];
  const pairs = [];

  const bandwidth = Number(stateObj.bandwidth);
  if (Number.isFinite(bandwidth)) {
    pairs.push(`bandwidth${Math.round(bandwidth)}`);
  }

  const mode = String(stateObj.mode || '').toLowerCase();
  if (mode === 'convergent' || mode === 'divergent') {
    pairs.push(`mode:${titleCaseWord(mode)}`);
  }

  const horizon = String(stateObj.horizon || '').toLowerCase();
  if (horizon === 'now' || horizon === 'long') {
    pairs.push(`horizon:${titleCaseWord(horizon)}`);
  }

  const stakes = String(stateObj.stakes || '').toLowerCase();
  if (stakes === 'critical' || stakes === 'casual') {
    pairs.push(`stakes:${titleCaseWord(stakes)}`);
  }

  const domain = String(stateObj.domain || '').toLowerCase();
  if (domain === 'work' || domain === 'home') {
    pairs.push(`domain:${titleCaseWord(domain)}`);
  }

  return pairs;
}

// Long-form IAM builder
function buildIamLongForm(scored, modules, options) {
  const mappings = new LfMappings();
  const segItems = [];

  const pushSegment = (fullName, metricsObj) => {
    if (!metricsObj || typeof metricsObj !== 'object') return;
    const pairs = [];
    const baseFullName = String(fullName || '').replace(/\(.*\)$/, '');
    for (const [k, v] of Object.entries(metricsObj)) {
      if (v == null) continue;
      const num = Math.round(Number(v) || 0);
      const metricName = mappings.mapMetric(baseFullName, k) || String(k).toLowerCase();
      pairs.push(`${metricName}${num}`);
    }
    if (pairs.length) {
      const aggScore = computeAggregateFromNormalized(metricsObj);
      segItems.push({ fullName, pairs, score: aggScore });
    }
  };

  // Personality: prefer scored.normalized
  const s = (scored && scored.normalized) ? scored.normalized : {};
  if (s && Object.keys(s).length) {
    const pPairs = [];
    const map = { O: 'openness', C: 'conscientiousness', E: 'extraversion', A: 'agreeableness', N: 'neuroticism' };
    for (const key of ['O', 'C', 'E', 'A', 'N']) {
      const val = Math.round(Number(s[key] ?? s[key.toLowerCase()] ?? 0) || 0);
      pPairs.push(`${map[key]}${val}`);
    }
    const agg = Math.round((Number(s.O || 0) + Number(s.C || 0) + Number(s.E || 0) + Number(s.A || 0) + Number(s.N || 0)) / 5 || 0);
    segItems.push({ fullName: 'PERSONALITY', pairs: pPairs, score: agg });
  }

  // Aesthetics
  if (modules && modules.aesthetics && modules.aesthetics.normalized) pushSegment(namedSegment('AESTHETIC', modules.aesthetics), modules.aesthetics.normalized);
  // Music
  if (modules && modules.music && modules.music.normalized) pushSegment(namedSegment('MUSIC', modules.music), modules.music.normalized);
  // Communication
  if (modules && modules.communication && (modules.communication.normalized || modules.communication.normalized_trait_scores)) {
    const cn = modules.communication.normalized_trait_scores || modules.communication.normalized;
    pushSegment(namedSegment('COMMUNICATION', modules.communication), cn);
  }
  // Delivery
  if (modules && modules.delivery && modules.delivery.normalized) pushSegment(namedSegment('DELIVERY', modules.delivery), modules.delivery.normalized);
  if (modules && modules.delivery2) {
    const d2 = modules.delivery2.normalized || modules.delivery2.normalized_trait_scores || (modules.delivery2.result && modules.delivery2.result.normalized) || modules.delivery2;
    if (d2 && typeof d2 === 'object' && Object.keys(d2).length) pushSegment(namedSegment('DELIVERY2', modules.delivery2), d2);
  }
  // State
  if (modules && modules.state && typeof modules.state === 'object' && Object.keys(modules.state).length) {
    const statePairs = buildStatePairs(modules.state);
    if (statePairs.length) {
      const stateBandwidth = Number(modules.state.bandwidth);
      const stateScore = Number.isFinite(stateBandwidth) ? Math.round(stateBandwidth) : 0;
      segItems.push({ fullName: namedSegment('STATE', modules.state), pairs: statePairs, score: stateScore });
    }
  }

  // Order by score desc, tie alphabetic
  segItems.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const an = String(a.fullName || '').toUpperCase();
    const bn = String(b.fullName || '').toUpperCase();
    return an.localeCompare(bn);
  });

  const segmentsText = segItems.map((s) => `${s.fullName}:${s.pairs.join(',')}`).join('/');
  // Build BASE segment from modules.base using existing helper `buildPrefixSegment` which returns parts array
  const baseParts = buildPrefixSegment(modules && modules.base ? modules.base : {});
  const prefix = 'IAM-v0.2';
  let code = prefix;
  if (baseParts.length) {
    code += `/BASE:${baseParts.join(',')}`;
  }
  if (segmentsText) {
    code += `${baseParts.length ? '/' : '/'}${segmentsText}`;
  }

  // Include career/skills segment in long-form as `SKILL` (preserve optional module note)
  try {
    const soc8Lf = modules && modules.base && modules.base.onet && modules.base.onet.soc_code ? normalizeSoc8(modules.base.onet.soc_code) : '';
    const skillsSourceLf = modules?.skills;
    const skillsLf = Array.isArray(skillsSourceLf)
      ? skillsSourceLf
      : Array.isArray(skillsSourceLf?.filtered)
        ? skillsSourceLf.filtered
        : Array.isArray(skillsSourceLf?.responses)
          ? skillsSourceLf.responses
          : Array.isArray(skillsSourceLf?.fullAssessment)
            ? skillsSourceLf.fullAssessment
            : [];
    const skillsModuleObjLf = (modules && modules.skills && typeof modules.skills === 'object' && !Array.isArray(modules.skills)) ? modules.skills : {};
    const carCompactLf = (soc8Lf || (skillsLf && skillsLf.length)) ? buildCareerSegment(soc8Lf, skillsLf, skillsModuleObjLf) : '';
    if (carCompactLf) {
      // Convert compact SKL prefix to long-form SKILL (keep any parentheses note)
      const skillPrefix = namedSegment('SKILL', skillsModuleObjLf);
      const carLf = carCompactLf.replace(/^SKL(?:\([^)]+\))?/, skillPrefix);
      code += `/${carLf}`;
      // Also include a SKILLS long-form metrics segment: map each skill title to a single-word label
      try {
        const posNameMap = new Map(skillPositionMap.map((entry) => [Number(entry.index.replace(/^S/, '')), entry.name]));
        const shortSkillWord = (name) => {
          if (!name) return '';
          const stop = new Set(['and', 'of', 'the', '&', 'to', 'for', 'in']);
          const parts = String(name).split(/[^A-Za-z]+/).filter(Boolean).map((p) => p.trim()).filter(Boolean);
          if (!parts.length) return '';
          const lowParts = parts.map((p) => p.toLowerCase());
          // Override ambiguous single-word labels with clearer two-word descriptors
          const overrides = {
            time: 'time_management',
            active: 'active_listening',
            complex: 'problem_solving',
            identify: 'problem_identification'
          };
          for (const p of lowParts) {
            if (overrides[p]) return overrides[p];
          }
          // Prefer the longest meaningful word (avoids duplicate 'active' labels)
          let best = '';
          for (const p of lowParts) {
            if (stop.has(p) || p.length < 3) continue;
            if (p.length > best.length) best = p;
          }
          if (best) return best;
          // Fallback: return first non-stop part
          for (const p of lowParts) {
            if (!stop.has(p)) return p;
          }
          return lowParts[0];
        };

        const skillPairs = skillsLf
          .map((s) => {
            const idx = Number(s.index || s.index?.toString?.().replace?.(/^S/, '') || s);
            const longName = posNameMap.get(idx) || s.name || '';
            const sval = skillProficiency(s);
            const shortName = shortSkillWord(longName);
            return shortName ? `${shortName}${sval}` : null;
          })
          .filter(Boolean);

        if (skillPairs.length) {
          code += `/${namedSegment('SKILLS', modules && modules.skills ? modules.skills : {})}:${skillPairs.join(',')}`;
        }
      } catch (e) {}
    }
  } catch (e) {}
  return { code, version: 'LF.0.2' };
}
