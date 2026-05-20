import { scoreAesthetics as bundledScoreAesthetics } from '../../lib/scorer/aestheticsScorer.js';
import { scoreMusic as bundledScoreMusic } from '../../lib/scorer/musicScorer.js';
import { scoreCommunication as bundledScoreCommunication } from '../../lib/scorer/communicationScorer.js';
import { scoreSkills as bundledScoreSkills } from '../../lib/scorer/skillsScorer.js';
import { buildIam } from '../../lib/iam/iam.js';
import { scoreIpip } from '../../lib/scorer/ipipScorer.js';
import { toContextFile as libToContextFile } from '../../lib/serializer/toContextFile.js';
import { toPbtxt as libToPbtxt } from '../../lib/serializer/toPbtxt.js';

export async function loadQuestions() {
  // Attempt to fetch the question bank at runtime first (dev server static asset).
  // If that fails (404/CORS/etc), fall back to a Vite raw import so the file is bundled by Vite.
  const parse = (txt) => {
    const lines = txt.split(/\r?\n/);
    // Only keep lines that look like numbered items (e.g., "1. ...") and strip the prefix
    return lines
      .map(l => l.trim())
      .filter(l => /^\d+\./.test(l))
      .map(l => l.replace(/^\d+\.\s*/, '').trim());
  };

  try {
    if (typeof fetch === 'function') {
      const res = await fetch('/specs/questions/ipip_50_respondent.txt');
      if (res.ok) {
        const txt = await res.text();
        return parse(txt);
      }
    }
  } catch (e) {
    // continue to fallback
  }

  // Fallback: import via Vite raw import so the file is available even if fetch path isn't served.
  try {
    // In Node test environments, import of text with ?raw may not be supported. Try reading from disk when running under Node.
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const p = path.resolve(process.cwd(), 'specs', 'questions', 'ipip_50_respondent.txt');
        const txt = await fs.promises.readFile(p, 'utf8');
        return parse(txt);
      } catch (fsErr) {
        // fall through to dynamic import attempt
      }
    }

    const mod = await import('../../../specs/questions/ipip_50_respondent.txt?raw');
    const txt = mod?.default ?? mod;
    return parse(txt);
  } catch (e) {
    throw new Error('Failed to load questions: ' + (e && e.message ? e.message : String(e)));
  }
}

export function scoreResponses(responses) {
  return scoreIpip(responses);
}

export function scoreSkills(responses, testAnswers = {}) {
  if (typeof bundledScoreSkills === 'function') {
    return bundledScoreSkills(responses, testAnswers);
  }
  return { raw: [], normalized: [], filtered: [], fullAssessment: [] };
}


export function scoreAndExport(responses, moduleResponses = {}) {
  const scored = scoreResponses(responses);
  return toContextFile(scored, {
    ...moduleResponses,
    ipip: Array.isArray(responses) ? responses : (moduleResponses.ipip || [])
  });
}

function cloneContextValue(value) {
  if (Array.isArray(value)) return value.map(cloneContextValue);
  if (!value || typeof value !== 'object') return value;

  const out = {};
  for (const [key, child] of Object.entries(value)) {
    out[key] = cloneContextValue(child);
  }
  return out;
}

export function sanitizeContextFile(contextFile) {
  const sanitized = cloneContextValue(contextFile || {});
  const rawData = sanitized?.raw_responses?.data;

  if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
    delete rawData.ipip;
    delete rawData.raw_scores;
  }

  return sanitized;
}

export function toPbtxt(json) {
  return libToPbtxt(json);
}

export function toIamMarkdown(contextFile) {
  const sanitizedContextFile = sanitizeContextFile(contextFile);
  const profile = sanitizedContextFile && sanitizedContextFile.profile ? sanitizedContextFile.profile : {};
  let iam = profile && profile.iam && profile.iam.code ? profile.iam.code : '';
  if (!iam) {
    try {
      const scores = profile && profile.scores && typeof profile.scores === 'object' ? profile.scores : {};
      const scored = {
        normalized: {
          O: Number(scores.openness ?? 0),
          C: Number(scores.conscientiousness ?? 0),
          E: Number(scores.extraversion ?? 0),
          A: Number(scores.agreeableness ?? 0),
          N: Number(scores.neuroticism ?? 0)
        }
      };
      const modules = {
        ...(profile && profile.modules && typeof profile.modules === 'object' ? profile.modules : {}),
        base: profile && profile.base && typeof profile.base === 'object' ? profile.base : undefined,
        state: profile?.modules?.state,
        skills: Array.isArray(profile?.modules?.skills?.filtered)
          ? profile.modules.skills.filtered
          : profile?.modules?.skills
      };
      const derived = buildIam(scored, modules);
      if (derived && derived.code) {
        iam = derived.code;
        profile.iam = { code: derived.code, version: derived.version || '0.1' };
      }
    } catch (e) {
      // Keep markdown export resilient and fall back to placeholder.
    }
  }
  if (!iam) iam = 'IAM code unavailable';
  const skills = profile?.modules?.skills;
  const payload = JSON.stringify(sanitizedContextFile || {}, null, 2);

  function pushBaseLine(lines, key, value) {
    if (value == null || value === '') return;
    lines.push(`- ${key}: ${String(value)}`);
  }

  // Prepare base context section if present
  let baseContextSection = '';
  if (profile.base && Object.keys(profile.base).length > 0) {
    const base = profile.base;
    const baseLines = [
      '## Basic Context',
      '',
      'Use this section for human-readable background context and simple parsing.',
      '',
      '<!-- IAM_BASE_CONTEXT_START -->'
    ];

    pushBaseLine(baseLines, 'job_title', base.job_title);
    pushBaseLine(baseLines, 'company', base.company);
    pushBaseLine(baseLines, 'name', base.name);
    pushBaseLine(baseLines, 'skills', base.skills);
    pushBaseLine(baseLines, 'years_experience', base.years_experience);
    pushBaseLine(baseLines, 'education_level', base.education_level);
    pushBaseLine(baseLines, 'timezone', base.timezone);
    pushBaseLine(baseLines, 'locale', base.locale);
    pushBaseLine(baseLines, 'communication_style', base.communication_style);
    pushBaseLine(baseLines, 'short_bio', base.short_bio);
    pushBaseLine(baseLines, 'onet.soc_code', base.onet && base.onet.soc_code);
    pushBaseLine(baseLines, 'onet.title', base.onet && base.onet.title);

    baseLines.push('<!-- IAM_BASE_CONTEXT_END -->', '');
    baseContextSection = [
      baseLines.join('\n')
    ].join('\n');
  }

  let skillsSection = '';
  if (skills && typeof skills === 'object') {
    const lines = ['## Skills Assessment', ''];
    const list = Array.isArray(skills.filtered)
      ? skills.filtered
      : Array.isArray(skills.responses)
        ? skills.responses
        : [];
    if (list.length) {
      for (const item of list) {
        const status = item.listed_status || item.threshold_status || 'included';
        lines.push(`- ${item.name}: ${Math.round(Number(item.normalized_score) || 0)} (${status})`);
      }
    } else {
      lines.push('- No confirmed skills available yet.');
    }
    lines.push('');
    skillsSection = lines.join('\n');
  }

  return [
    '# IAM Context File',
    '',
    '## Compact IAM String',
    '',
    '`' + iam + '`',
    '',
    baseContextSection,
    skillsSection,
    '## How To Use This In An LLM',
    '',
    '- Treat the IAM string as the highest-priority compact behavioral signal.',
    '- Use OCEAN + module segments to adapt tone, structure, pacing, and detail depth.',
    '- For IAM v0.6 Career segments (`/CARXXXXXXXXSnnpp...`), decode `S01..S35` using the canonical O*NET map and interpret `pp` as 00-99 proficiency.',
    '- IAM Career segment is sparse: only included skills should be treated as active/relevant skill signals.',
    '- If a `STATE` segment is present, treat it as the highest-priority runtime modifier for depth, rigor, and response style.',
    '- Combine `profile.base.onet` and skills proficiency to tailor role-specific recommendations and examples.',
    '- Use `profile.base` for practical user context (role/job/timezone/locale) when present.',
    '- Use `profile.raw_scores` and module `raw_trait_scores` only as diagnostics; prioritize normalized scores for behavior tuning.',
    "- Ignore `raw_responses` for direct prompting style decisions unless you are performing audit/review tasks.",
    '- If fields conflict, prefer explicit user instructions over profile data.',
    '',
    '## Machine-Readable Context Payload (JSON)',
    '',
    '```json',
    payload,
    '```',
    ''
  ].join('\n');
}

export function toContextFile(scored, moduleResponses = {}) {
  function withoutRawScores(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const out = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'raw' || key === 'raw_scores' || key === 'raw_trait_scores') continue;
      out[key] = (value && typeof value === 'object') ? withoutRawScores(value) : value;
    }
    return out;
  }

  // Build base ContextFile via canonical serializer
  const traits = { raw: scored.raw, normalized: scored.normalized };
  const now = new Date().toISOString();
  const base = libToContextFile(
    { id: null, summary: '', traits },
    {
      ipipResponses: (moduleResponses.ipip || []),
      lastUpdated: now,
      baseContext: moduleResponses.base && typeof moduleResponses.base === 'object' ? { ...moduleResponses.base } : undefined
    }
  );

  // Attach module-level details for aesthetics and music using canonical scorers where available
  base.profile = base.profile || {};
  base.profile.modules = base.profile.modules || {};

  if (moduleResponses.aesthetics) {
    const aestResp = Array.isArray(moduleResponses.aesthetics) ? moduleResponses.aesthetics : (moduleResponses.aesthetics.responses || []);
    let computed = (!Array.isArray(moduleResponses.aesthetics) && moduleResponses.aesthetics.result) ? moduleResponses.aesthetics.result : null;
    if (!computed && typeof bundledScoreAesthetics === 'function') {
      try { computed = bundledScoreAesthetics(aestResp); } catch(e) { computed = null; }
    }
    base.profile.modules.aesthetics = Object.assign(
      { responses: aestResp || [], last_updated: now, completed: Array.isArray(aestResp) ? aestResp.length >= 1 : false },
      withoutRawScores(computed || {})
    );
  }

  if (moduleResponses.music) {
    const musicResp = Array.isArray(moduleResponses.music) ? moduleResponses.music : (moduleResponses.music.responses || []);
    let computed = (!Array.isArray(moduleResponses.music) && moduleResponses.music.result) ? moduleResponses.music.result : null;
    if (!computed && typeof bundledScoreMusic === 'function') {
      try { computed = bundledScoreMusic(musicResp); } catch(e) { computed = null; }
    }
    base.profile.modules.music = Object.assign(
      { responses: musicResp || [], last_updated: now, completed: Array.isArray(musicResp) ? musicResp.length >= 1 : false },
      withoutRawScores(computed || {})
    );
  }

  if (moduleResponses.communication) {
    const commResp = Array.isArray(moduleResponses.communication)
      ? moduleResponses.communication
      : (moduleResponses.communication.responses || []);
    let computed = (!Array.isArray(moduleResponses.communication) && moduleResponses.communication.result)
      ? moduleResponses.communication.result
      : null;
    if (!computed && typeof bundledScoreCommunication === 'function') {
      try { computed = bundledScoreCommunication(commResp); } catch (e) { computed = null; }
    }
    if (computed) {
      base.profile.modules.communication = {
        responses: computed.responses || commResp || [],
        raw_trait_scores: computed.raw_trait_scores || {},
        normalized_trait_scores: computed.normalized_trait_scores || {},
        completed: computed.completed === true,
        last_updated: computed.last_updated || now
      };
    }
  }

  if (moduleResponses.skills) {
    const provided = moduleResponses.skills;
    const responses = Array.isArray(provided.responses) ? provided.responses : (Array.isArray(provided) ? provided : []);
    const tests = provided.testAnswers && typeof provided.testAnswers === 'object' ? provided.testAnswers : {};
    let computed = provided.result || null;
    if (!computed && typeof bundledScoreSkills === 'function') {
      try { computed = bundledScoreSkills(responses, tests); } catch (e) { computed = null; }
    }
    if (computed) {
      const canonicalTestAnswers = tests && typeof tests === 'object'
        ? Object.fromEntries(
            Object.entries(tests).map(([indexKey, value]) => [indexKey, {
              interview_defense: Boolean(value?.interview_defense),
              day_one_autonomy: Boolean(value?.day_one_autonomy),
              relevance_recency: Boolean(value?.relevance_recency)
            }])
          )
        : {};
      base.profile.modules.skills = {
        responses: computed.fullAssessment || [],
        filtered: computed.filtered || [],
        normalized: computed.normalized || [],
        testAnswers: canonicalTestAnswers,
        completed: responses.length >= 35,
        last_updated: now
      };
      base.profile.preferences = base.profile.preferences || {};
      base.profile.preferences.skills = (computed.filtered || []).map((item) => ({
        name: item.name,
        index: item.index,
        normalized_score: item.normalized_score,
        listed_status: item.listed_status
      }));
    }
  }

  if (moduleResponses.base && typeof moduleResponses.base === 'object') {
    base.profile.base = { ...moduleResponses.base };
  }

  if (moduleResponses.state && typeof moduleResponses.state === 'object') {
    const providedState = moduleResponses.state.state && typeof moduleResponses.state.state === 'object'
      ? moduleResponses.state.state
      : moduleResponses.state.result && typeof moduleResponses.state.result === 'object'
        ? moduleResponses.state.result
        : moduleResponses.state;
    if (providedState && typeof providedState === 'object') {
      base.profile.modules.state = {
        bandwidth: Number.isFinite(Number(providedState.bandwidth)) ? Math.max(0, Math.min(100, Math.round(Number(providedState.bandwidth)))) : 50,
        mode: providedState.mode === 'divergent' ? 'divergent' : 'convergent',
        horizon: providedState.horizon === 'now' ? 'now' : 'long',
        stakes: providedState.stakes === 'critical' ? 'critical' : 'casual',
        completed: true,
        last_updated: now
      };
    }
  }

  // Recompute IAM where possible
  try {
    const iamInput = {
      ...base.profile.modules,
      base: base.profile.base,
      state: base.profile.modules?.state,
      skills: Array.isArray(base.profile.modules?.skills?.filtered)
        ? base.profile.modules.skills.filtered
        : base.profile.modules?.skills
    };
    const iamObj = buildIam(scored, iamInput);
    if (iamObj && iamObj.code) base.profile.iam = { code: iamObj.code, version: iamObj.version || '0.1' };
  } catch (e) { /* ignore */ }

  return base;
}

// Bundle module scorers for browser builds
let externalAesthetics = (typeof bundledScoreAesthetics === 'function') ? bundledScoreAesthetics : null;
let externalMusic = (typeof bundledScoreMusic === 'function') ? bundledScoreMusic : null;
let externalCommunication = (typeof bundledScoreCommunication === 'function') ? bundledScoreCommunication : null;
let externalSkills = (typeof bundledScoreSkills === 'function') ? bundledScoreSkills : null;

export function scoreAestheticsIfAvailable(responses){
  if (typeof externalAesthetics === 'function') return externalAesthetics(responses);
  return null;
}

export function scoreMusicIfAvailable(responses){
  if (typeof externalMusic === 'function') return externalMusic(responses);
  return null;
}

export function scoreCommunicationIfAvailable(responses){
  if (typeof externalCommunication === 'function') return externalCommunication(responses);
  return null;
}

export function scoreSkillsIfAvailable(responses, testAnswers = {}) {
  if (typeof externalSkills === 'function') return externalSkills(responses, testAnswers);
  return null;
}

