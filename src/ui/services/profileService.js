import { scoreAesthetics as bundledScoreAesthetics } from '../../lib/scorer/aestheticsScorer.js';
import { scoreMusic as bundledScoreMusic } from '../../lib/scorer/musicScorer.js';
import { scoreDelivery as bundledScoreDelivery } from '../../lib/scorer/deliveryScorer.js';
import { scoreCommunication as bundledScoreCommunication } from '../../lib/scorer/communicationScorer.js';
import { scoreSkills as bundledScoreSkills } from '../../lib/scorer/skillsScorer.js';
import { buildIam } from '../../lib/iam/iam.js';
import { scoreIpip } from '../../lib/scorer/ipipScorer.js';
import { toContextFile as libToContextFile } from '../../lib/serializer/toContextFile.js';

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

export function scoreSkills(responses) {
  if (typeof bundledScoreSkills === 'function') {
    return bundledScoreSkills(responses);
  }
  return { raw: [], normalized: [], filtered: [], fullAssessment: [] };
}

function resolveIpipModule(ipipModuleLike, fallbackResponses = []) {
  if (ipipModuleLike && typeof ipipModuleLike === 'object' && !Array.isArray(ipipModuleLike)) {
    return {
      responses: Array.isArray(ipipModuleLike.responses)
        ? ipipModuleLike.responses
        : (Array.isArray(fallbackResponses) ? fallbackResponses : []),
      disabled: ipipModuleLike.disabled === true
    };
  }

  if (Array.isArray(ipipModuleLike)) {
    return { responses: ipipModuleLike };
  }

  return {
    responses: Array.isArray(fallbackResponses) ? fallbackResponses : []
  };
}

function personalityScoresFromModule(profileScores, ipipModule) {
  const disabled = ipipModule?.disabled === true;
  const scores = profileScores && typeof profileScores === 'object' ? profileScores : {};
  return {
    normalized: {
      O: disabled ? 0 : Number(scores.openness ?? 0),
      C: disabled ? 0 : Number(scores.conscientiousness ?? 0),
      E: disabled ? 0 : Number(scores.extraversion ?? 0),
      A: disabled ? 0 : Number(scores.agreeableness ?? 0),
      N: disabled ? 0 : Number(scores.neuroticism ?? 0)
    }
  };
}


export function scoreAndExport(responses, moduleResponses = {}) {
  const scored = scoreResponses(responses);
  const ipipPayload = resolveIpipModule(moduleResponses.ipip, responses);
  return toContextFile(scored, {
    ...moduleResponses,
    ipip: ipipPayload
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

function deriveIamFromProfile(profile) {
  let iam = profile && profile.iam && profile.iam.code ? profile.iam.code : '';

  const communicationModule = profile?.modules?.communication;
  const communicationScores = communicationModule && typeof communicationModule === 'object'
    ? (communicationModule.normalized_trait_scores
      || communicationModule.normalized
      || communicationModule.result?.normalized_trait_scores
      || communicationModule.result?.normalized)
    : null;
  const hasCommunicationScores = communicationScores && typeof communicationScores === 'object'
    ? ['driver', 'analytical', 'expressive', 'amiable'].some((key) => Number.isFinite(Number(communicationScores[key])))
    : false;
  const hasExplicitCommMetrics = /\/COMM:DRV\d+ANC\d+EXP\d+AMB\d+/.test(iam);
  const hasMalformedCommSegment = /\/COMM(?::|$)/.test(iam) && !hasExplicitCommMetrics;
  const needsCommRefresh = hasCommunicationScores && !hasExplicitCommMetrics;
  const canReuseExistingIam = Boolean(iam) && !hasMalformedCommSegment && !needsCommRefresh;
  if (canReuseExistingIam) return iam;

  try {
    const scored = personalityScoresFromModule(profile?.scores, profile?.modules?.ipip);
    const modules = filterDisabledModules({
      ...(profile && profile.modules && typeof profile.modules === 'object' ? profile.modules : {}),
      base: profile && profile.base && typeof profile.base === 'object' ? profile.base : undefined,
      state: profile?.modules?.state,
      skills: Array.isArray(profile?.modules?.skills?.filtered)
        ? profile.modules.skills.filtered
        : profile?.modules?.skills
    });
    const derived = buildIam(scored, modules);
    if (derived && derived.code) {
      iam = derived.code;
      profile.iam = { code: derived.code, version: derived.version || '0.1' };
    }
  } catch (e) {
    // Keep export resilient and fall back to placeholder.
  }

  return iam;
}

function withModuleMetadata(moduleData, metadata) {
  if (!moduleData || typeof moduleData !== 'object' || Array.isArray(moduleData)) return moduleData;
  return {
    ...moduleData,
    disabled: metadata?.disabled === true
  };
}

function filterDisabledModules(modules) {
  if (!modules || typeof modules !== 'object') return {};

  const nextModules = { ...modules };
  for (const key of ['ipip', 'aesthetics', 'music', 'delivery', 'communication', 'state']) {
    if (nextModules[key] && typeof nextModules[key] === 'object' && nextModules[key].disabled === true) {
      delete nextModules[key];
    }
  }

  if (modules.skills && typeof modules.skills === 'object' && !Array.isArray(modules.skills) && modules.skills.disabled === true) {
    delete nextModules.skills;
  }

  return nextModules;
}

function removeDuplicateExportSections(contextFile) {
  const sanitizedContextFile = sanitizeContextFile(contextFile);
  const profile = sanitizedContextFile?.profile && typeof sanitizedContextFile.profile === 'object'
    ? { ...sanitizedContextFile.profile }
    : {};

  function normalizeSkillsForStorage(skillsModule) {
    if (!skillsModule || typeof skillsModule !== 'object') return skillsModule;
    const source = Array.isArray(skillsModule.responses)
      ? skillsModule.responses
      : Array.isArray(skillsModule.filtered)
        ? skillsModule.filtered
        : [];

    const responses = source
      .map((item) => {
        if (Number.isFinite(Number(item))) return Number(item);
        if (item && typeof item === 'object' && Number.isFinite(Number(item.raw_score))) {
          return Number(item.raw_score);
        }
        return null;
      })
      .filter((item) => item !== null);

    return {
      responses,
      completed: skillsModule.completed === true,
      disabled: skillsModule.disabled === true,
      last_updated: skillsModule.last_updated
    };
  }

  function normalizeModuleDisabledFlags(modules) {
    if (!modules || typeof modules !== 'object') return modules;
    const normalizedModules = { ...modules };
    for (const [key, value] of Object.entries(normalizedModules)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
      normalizedModules[key] = {
        ...value,
        disabled: value.disabled === true
      };
    }
    return normalizedModules;
  }

  // `iam` is emitted as the top-level first field in storage JSON.
  if (profile.iam) delete profile.iam;

  // `preferences.skills` duplicates module-level skill responses.
  if (profile.preferences && typeof profile.preferences === 'object') {
    delete profile.preferences.skills;
    if (Object.keys(profile.preferences).length === 0) delete profile.preferences;
  }

  if (profile.modules && typeof profile.modules === 'object' && profile.modules.skills) {
    profile.modules = { ...profile.modules, skills: normalizeSkillsForStorage(profile.modules.skills) };
  }
  if (profile.modules && typeof profile.modules === 'object') {
    profile.modules = normalizeModuleDisabledFlags(profile.modules);
  }

  const out = {
    schema_version: sanitizedContextFile?.schema_version,
    generated_at: sanitizedContextFile?.generated_at,
    profile
  };

  // `raw_responses` duplicates module-level responses and is excluded from storage JSON.
  return out;
}

export function toIamDataStorageObject(contextFile) {
  const sanitizedContextFile = sanitizeContextFile(contextFile);
  const profile = sanitizedContextFile && sanitizedContextFile.profile ? sanitizedContextFile.profile : {};
  // Only emit top-level iam when at least one module is completed
  const modulesObj = sanitizedContextFile?.profile?.modules;
  let hasCompletedModule = false;
  if (modulesObj && typeof modulesObj === 'object') {
    for (const k of Object.keys(modulesObj)) {
      const m = modulesObj[k];
      if (m && typeof m === 'object' && m.completed === true) {
        hasCompletedModule = true;
        break;
      }
    }
  }
  const iam = hasCompletedModule ? (deriveIamFromProfile(profile) || 'I-AM string unavailable') : undefined;
  const cleaned = removeDuplicateExportSections(sanitizedContextFile);

  const out = (typeof iam === 'string' && iam.length)
    ? { iam, ...cleaned }
    : { ...cleaned };
  return out;
}

export function toIamDataStorageJson(contextFile) {
  return JSON.stringify(toIamDataStorageObject(contextFile), null, 2);
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
      ipip: resolveIpipModule(moduleResponses.ipip),
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
      withModuleMetadata(withoutRawScores(computed || {}), moduleResponses.aesthetics)
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
      withModuleMetadata(withoutRawScores(computed || {}), moduleResponses.music)
    );
  }

  if (moduleResponses.delivery) {
    const deliveryResp = Array.isArray(moduleResponses.delivery) ? moduleResponses.delivery : (moduleResponses.delivery.responses || []);
    let computed = (!Array.isArray(moduleResponses.delivery) && moduleResponses.delivery.result) ? moduleResponses.delivery.result : null;
    if (!computed && typeof bundledScoreDelivery === 'function') {
      try { computed = bundledScoreDelivery(deliveryResp); } catch(e) { computed = null; }
    }
    base.profile.modules.delivery = Object.assign(
      { responses: deliveryResp || [], last_updated: now, completed: Array.isArray(deliveryResp) ? deliveryResp.length >= 1 : false },
      withModuleMetadata(withoutRawScores(computed || {}), moduleResponses.delivery)
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
      base.profile.modules.communication = withModuleMetadata({
        responses: computed.responses || commResp || [],
        raw_trait_scores: computed.raw_trait_scores || {},
        normalized_trait_scores: computed.normalized_trait_scores || {},
        completed: computed.completed === true,
        last_updated: computed.last_updated || now
      }, moduleResponses.communication);
    }
  }

  if (moduleResponses.skills) {
    const provided = moduleResponses.skills;
    const responses = Array.isArray(provided.responses) ? provided.responses : (Array.isArray(provided) ? provided : []);
    let computed = provided.result || null;
    if (!computed && typeof bundledScoreSkills === 'function') {
      try { computed = bundledScoreSkills(responses); } catch (e) { computed = null; }
    }
    if (computed) {
      base.profile.modules.skills = withModuleMetadata({
        responses: computed.fullAssessment || [],
        filtered: computed.filtered || [],
        normalized: computed.normalized || [],
        ...(provided.testAnswers ? { testAnswers: provided.testAnswers } : {}),
        completed: responses.length >= 35,
        last_updated: now
      }, provided);
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
      base.profile.modules.state = withModuleMetadata({
        bandwidth: Number.isFinite(Number(providedState.bandwidth)) ? Math.max(0, Math.min(100, Math.round(Number(providedState.bandwidth)))) : 50,
        mode: providedState.mode === 'divergent' ? 'divergent' : 'convergent',
        horizon: providedState.horizon === 'now' ? 'now' : 'long',
        stakes: providedState.stakes === 'critical' ? 'critical' : 'casual',
        completed: true,
        last_updated: now
      }, moduleResponses.state);
    }
  }

  // Recompute IAM where possible
  try {
    const iamScored = personalityScoresFromModule(base.profile?.scores, base.profile?.modules?.ipip);
    const iamInput = filterDisabledModules({
      ...base.profile.modules,
      base: base.profile.base,
      state: base.profile.modules?.state,
      skills: Array.isArray(base.profile.modules?.skills?.filtered)
        ? base.profile.modules.skills.filtered
        : base.profile.modules?.skills
    });
    const iamObj = buildIam(iamScored, iamInput);
    if (iamObj && iamObj.code) base.profile.iam = { code: iamObj.code, version: iamObj.version || '0.1' };
  } catch (e) { /* ignore */ }

  return base;
}

// Bundle module scorers for browser builds
let externalAesthetics = (typeof bundledScoreAesthetics === 'function') ? bundledScoreAesthetics : null;
let externalMusic = (typeof bundledScoreMusic === 'function') ? bundledScoreMusic : null;
let externalDelivery = (typeof bundledScoreDelivery === 'function') ? bundledScoreDelivery : null;
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

export function scoreDeliveryIfAvailable(responses){
  if (typeof externalDelivery === 'function') return externalDelivery(responses);
  return null;
}

export function scoreCommunicationIfAvailable(responses){
  if (typeof externalCommunication === 'function') return externalCommunication(responses);
  return null;
}

export function scoreSkillsIfAvailable(responses) {
  if (typeof externalSkills === 'function') return externalSkills(responses);
  return null;
}

