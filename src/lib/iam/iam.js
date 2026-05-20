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

// --- Career Segment Generator (v0.4) ---
// O*NET 8-digit SOC + S01–S35 skills, sparse encoding
import { skillPositionMap } from './skillPositionMap.js';
import { canonicalizeState, formatStateSegment } from '../state/stateManager.js';

function pad2(n) {
  const v = Math.round(Number(n) || 0);
  return v.toString().padStart(2, '0');
}

export function buildCareerSegment(soc8, skills) {
  // skills: array of { index: 1-35, normalized_score: 0-100 }
  if (!soc8 || !/^[0-9]{8}$/.test(soc8)) return '';
  const pairs = skills
    .filter(s => s.normalized_score > 0)
    .sort((a, b) => a.index - b.index)
    .map(s => `S${pad2(s.index)}${pad2(Math.round(s.normalized_score))}`)
    .join('');
  return `CAR${soc8}${pairs}`;
}

export function decodeCareerSegment(code) {
  if (!code || typeof code !== 'string') return null;
  const match = code.match(/\/CAR(?<soc8>\d{8})(?<payload>(?:S\d{4})*)/);
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
  const hasSkills = Boolean(
    Array.isArray(modules?.skills)
      || Array.isArray(modules?.skills?.filtered)
      || Array.isArray(modules?.skills?.responses)
      || Array.isArray(modules?.skills?.fullAssessment)
  );
  const hasCareer = Boolean(modules?.base?.onet?.soc_code || hasSkills);

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
  const soc8 = modules?.base?.onet?.soc_code ? normalizeSoc8(modules.base.onet.soc_code) : '';
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

  if (hasCareer && !hasPersonality) {
    let code = car ? `/${car}` : '';
    if (stateSegment) code += `/${stateSegment}`;
    return { code, version: stateSegment ? '0.6' : '0.4' };
  }

  let ver = '0.1';

  let code = `IAM/${ver}:O${o}C${c}E${e}A${a}N${n}`;

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
      if (seg.length) code += '/' + seg.join('');
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
      if (seg.length) code += '/' + seg.join('');
    }
  } catch(e) {}

  try {
    const cn = modules && modules.communication
      ? (modules.communication.normalized_trait_scores || modules.communication.normalized)
      : null;
    if (cn && typeof cn === 'object') {
      const drv = typeof cn.driver === 'number' ? round(cn.driver) : null;
      const anc = typeof cn.analytical === 'number' ? round(cn.analytical) : null;
      const exp = typeof cn.expressive === 'number' ? round(cn.expressive) : null;
      const amb = typeof cn.amiable === 'number' ? round(cn.amiable) : null;
      if (drv !== null || anc !== null || exp !== null || amb !== null) {
        ver = '0.2';
        code = code.replace('IAM/0.1', 'IAM/0.2');
        code += `/COMM/DRV${drv ?? 0}ANC${anc ?? 0}EXP${exp ?? 0}AMB${amb ?? 0}`;
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
    code = code.replace(/^IAM\/0\.[0-9]+/, 'IAM/0.6');
    ver = '0.6';
  }

  return { code, version: ver };
}
