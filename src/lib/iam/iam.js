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

// --- Career Segment Generator (v0.4) ---
// O*NET 8-digit SOC + S01–S35 skills, sparse encoding
import { skillPositionMap } from './skillPositionMap.js';
import { canonicalizeState, formatStateSegment } from '../state/stateManager.js';

function pad2(n) {
  const v = Math.round(Number(n) || 0);
  return v.toString().padStart(2, '0');
}

function skillProficiency(scoreEntry) {
  const normalized = Number(scoreEntry?.normalized_score);
  if (Number.isFinite(normalized)) return Math.round(normalized);

  const raw = Number(scoreEntry?.raw_score);
  if (Number.isFinite(raw)) return Math.round(raw * 10);

  return 0;
}

export function buildCareerSegment(soc8, skills) {
  // skills: array containing either normalized_score (0-100) or raw_score (1-10)
  if (!soc8 || !/^[0-9]{8}$/.test(soc8)) return '';
  const pairs = skills
    .filter((s) => skillProficiency(s) >= 60)
    .sort((a, b) => a.index - b.index)
    .map((s) => `S${pad2(s.index)}${pad2(skillProficiency(s))}`)
    .join('');
  return `CAR:${soc8}${pairs}`;
}

export function decodeCareerSegment(code) {
  if (!code || typeof code !== 'string') return null;
  const match = code.match(/\/CAR:(?<soc8>\d{8})(?<payload>(?:S\d{4})*)/);
  if (!match || !match.groups) return null;

  const byIndex = new Map(skillPositionMap.map((entry, zeroBasedIndex) => [zeroBasedIndex + 1, entry.name]));
  const skills = [];
  const payload = match.groups.payload || '';
  const tokenPattern = /S(\d{2})(\d{2})/g;
  let tokenMatch;
  while ((tokenMatch = tokenPattern.exec(payload)) !== null) {
    const index = Number(tokenMatch[1]);
    const score = Number(tokenMatch[2]);
    skills.push({
      index,
      name: byIndex.get(index) || `S${tokenMatch[1]}`,
      normalized_score: score
    });
  }

  return {
    soc8: match.groups.soc8,
    skills
  };
}

// Main buildIam function
export function buildIam(scored, modules) {
  const base = modules?.base && typeof modules.base === 'object' ? modules.base : {};
  const hasSkills = Boolean(
    Array.isArray(modules?.skills)
      || Array.isArray(modules?.skills?.filtered)
      || Array.isArray(modules?.skills?.responses)
      || Array.isArray(modules?.skills?.fullAssessment)
  );
  const hasCareer = Boolean(base?.onet?.soc_code || hasSkills);
  const prefixParts = buildPrefixSegment(base);
  const prefix = prefixParts.join(':');
  const hasPrefix = prefixParts.length > 0;

  const round = (v) => Math.round(Number(v) || 0);
  const s = (scored && scored.normalized) ? scored.normalized : {};
  const o = round(s.O ?? s.openness ?? 0);
  const c = round(s.C ?? s.conscientiousness ?? 0);
  const e = round(s.E ?? s.extraversion ?? 0);
  const a = round(s.A ?? s.agreeableness ?? 0);
  const n = round(s.N ?? s.neuroticism ?? 0);

  const hasPersonality = [o, c, e, a, n].some((v) => Number.isFinite(v) && v > 0);
  const hasState = Boolean(modules?.state && typeof modules.state === 'object');
  const stateSegment = hasState ? formatStateSegment(canonicalizeState(modules.state)) : '';
  const soc8 = base?.onet?.soc_code ? normalizeSoc8(base.onet.soc_code) : '';
  const skillsSource = modules?.skills;
  const skills = Array.isArray(skillsSource)
    ? skillsSource
    : Array.isArray(skillsSource?.filtered)
      ? skillsSource.filtered
      : Array.isArray(skillsSource?.responses)
        ? skillsSource.responses
        : Array.isArray(skillsSource?.fullAssessment)
          ? skillsSource.fullAssessment
          : [];
  const car = hasCareer ? buildCareerSegment(soc8, skills) : '';

  if (hasCareer && !hasPersonality && !hasPrefix) {
    let code = car ? `/${car}` : '';
    if (stateSegment) code += `/${stateSegment}`;
    return { code, version: stateSegment ? '0.6' : '0.4' };
  }

  let ver = hasPrefix ? '0.6' : '0.1';
  const oceanSegment = hasPersonality ? `O${o}C${c}E${e}A${a}N${n}` : '';
  const baseSegments = [];
  if (hasPrefix) baseSegments.push(prefix);
  if (oceanSegment) baseSegments.push(oceanSegment);
  let code = `IAM/${ver}${baseSegments.length ? `:${baseSegments.join(':')}` : ''}`;

  try {
    if (modules && modules.aesthetics && modules.aesthetics.normalized) {
      const an = modules.aesthetics.normalized;
      const seg = [];
      if (typeof an.minimalism === 'number') seg.push(`MIN${round(an.minimalism)}`);
      if (typeof an.colorfulness === 'number') seg.push(`CLR${round(an.colorfulness)}`);
      if (typeof an.warmth === 'number') seg.push(`WRM${round(an.warmth)}`);
      if (typeof an.motion === 'number') seg.push(`MOT${round(an.motion)}`);
      if (typeof an.imagery === 'object' && typeof an.imagery.photos === 'number') seg.push(`IMG${round(an.imagery.photos)}`);
      else if (typeof an.texture === 'number') seg.push(`IMG${round(an.texture)}`);
      if (typeof an.typography === 'object' && typeof an.typography.prefers_serif === 'number') seg.push(`TYP${round(an.typography.prefers_serif)}`);
      if (typeof an.layout === 'object' && typeof an.layout.grid_consistency === 'number') seg.push(`LAY${round(an.layout.grid_consistency)}`);
      if (seg.length) code += `/AES:${seg.join('')}`;
    }
  } catch(e) {}

  try {
    if (modules && modules.music && modules.music.normalized) {
      const mn = modules.music.normalized;
      const seg = [];
      if (typeof mn.mellow === 'number') seg.push(`MEL${round(mn.mellow)}`);
      if (typeof mn.sophisticated === 'number') seg.push(`SOP${round(mn.sophisticated)}`);
      if (typeof mn.unpretentious === 'number') seg.push(`UNP${round(mn.unpretentious)}`);
      if (typeof mn.intense === 'number') seg.push(`INT${round(mn.intense)}`);
      if (typeof mn.contemporary === 'number') seg.push(`CON${round(mn.contemporary)}`);
      if (seg.length) code += `/MUS:${seg.join('')}`;
    }
  } catch(e) {}

  try {
    const cn = modules && modules.communication
      ? (modules.communication.normalized_trait_scores || modules.communication.normalized)
      : null;
    if (cn && typeof cn === 'object') {
      const readMetric = (value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? round(numeric) : null;
      };
      const drv = readMetric(cn.driver);
      const anc = readMetric(cn.analytical);
      const exp = readMetric(cn.expressive);
      const amb = readMetric(cn.amiable);
      if (drv !== null || anc !== null || exp !== null || amb !== null) {
        ver = hasPrefix ? '0.6' : '0.2';
        code = code.replace('IAM/0.1', 'IAM/0.2');
        code += `/COMM:DRV${drv ?? 0}ANC${anc ?? 0}EXP${exp ?? 0}AMB${amb ?? 0}`;
      }
    }
  } catch(e) {}

  try {
    if (modules && modules.delivery && modules.delivery.normalized) {
      const dn = modules.delivery.normalized;
      const seg = [];
      if (typeof dn.def === 'number') seg.push(`DEF${round(dn.def)}`);
      if (typeof dn.peer === 'number') seg.push(`PEER${round(dn.peer)}`);
      if (typeof dn.chl === 'number') seg.push(`CHL${round(dn.chl)}`);
      if (typeof dn.dns === 'number') seg.push(`DNS${round(dn.dns)}`);
      if (typeof dn.aud === 'number') seg.push(`AUD${round(dn.aud)}`);
      if (typeof dn.str === 'number') seg.push(`STR${round(dn.str)}`);
      if (typeof dn.abs === 'number') seg.push(`ABS${round(dn.abs)}`);
      if (typeof dn.fmt === 'number') seg.push(`FMT${round(dn.fmt)}`);
      if (typeof dn.vbs === 'number') seg.push(`VBS${round(dn.vbs)}`);
      if (typeof dn.emp === 'number') seg.push(`EMP${round(dn.emp)}`);
      if (typeof dn.cnd === 'number') seg.push(`CND${round(dn.cnd)}`);
      if (typeof dn.hmr === 'number') seg.push(`HMR${round(dn.hmr)}`);
      if (typeof dn.aut === 'number') seg.push(`AUT${round(dn.aut)}`);
      if (typeof dn.bur === 'number') seg.push(`BUR${round(dn.bur)}`);
      if (seg.length) {
        code += `/DELIVERY:${seg.join('')}`;
        code = code.replace(/^IAM\/0\.[0-9]+/, 'IAM/0.7');
        ver = '0.7';
      }
    }
  } catch(e) {}

  if (car) {
    if (ver === '0.1' || ver === '0.2') {
      ver = '0.4';
      code = code.replace(/^IAM\/0\.[0-9]+/, 'IAM/0.4');
    }
    code += `/${car}`;
  }

  if (stateSegment) {
    code += `/${stateSegment}`;
    if (ver !== '0.7') {
      code = code.replace(/^IAM\/0\.[0-9]+/, 'IAM/0.6');
      ver = '0.6';
    }
  }

  return { code, version: ver };
}
