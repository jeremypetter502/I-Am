import { scoreAesthetics as bundledScoreAesthetics } from '../../lib/scorer/aestheticsScorer.js';
import { scoreMusic as bundledScoreMusic } from '../../lib/scorer/musicScorer.js';
import { scoreDelivery as bundledScoreDelivery } from '../../lib/scorer/deliveryScorer.js';
import { scoreDelivery2 as bundledScoreDelivery2 } from '../../lib/scorer/delivery2Scorer.ts';
import { scoreCommunication as bundledScoreCommunication } from '../../lib/scorer/communicationScorer.js';
import { scoreSkills as bundledScoreSkills } from '../../lib/scorer/skillsScorer.js';
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

function withModuleMetadata(moduleData, metadata) {
  if (!moduleData || typeof moduleData !== 'object' || Array.isArray(moduleData)) return moduleData;
  return {
    ...moduleData,
    disabled: metadata?.disabled === true
  };
}

function removeDuplicateExportSections(contextFile) {
  const sanitizedContextFile = sanitizeContextFile(contextFile);
  const sourceProfile = sanitizedContextFile?.profile && typeof sanitizedContextFile.profile === 'object'
    ? sanitizedContextFile.profile
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
        if (item && typeof item === 'object' && Number.isFinite(Number(item.normalized_score))) {
          return Number(item.normalized_score);
        }
        return null;
      })
      .filter((item) => item !== null);

    const out = {
      responses,
      disabled: skillsModule.disabled === true
    };
    if (skillsModule.testAnswers && typeof skillsModule.testAnswers === 'object') {
      out.testAnswers = cloneContextValue(skillsModule.testAnswers);
    }
    if (typeof skillsModule.note === 'string' && skillsModule.note.trim()) {
      out.note = skillsModule.note;
    }
    return out;
  }

  function normalizeStateForStorage(stateModule) {
    if (!stateModule || typeof stateModule !== 'object') return null;
    const state = stateModule.state && typeof stateModule.state === 'object'
      ? stateModule.state
      : stateModule.result && typeof stateModule.result === 'object'
        ? stateModule.result
        : stateModule;
    const out = {};
    if (Number.isFinite(Number(state.bandwidth))) out.bandwidth = Math.max(0, Math.min(100, Math.round(Number(state.bandwidth))));
    if (state.mode === 'divergent' || state.mode === 'convergent') out.mode = state.mode;
    if (state.horizon === 'now' || state.horizon === 'long') out.horizon = state.horizon;
    if (state.stakes === 'critical' || state.stakes === 'casual') out.stakes = state.stakes;
    if (state.humor === 'none' || state.humor === 'low' || state.humor === 'normal' || state.humor === 'high') out.humor = state.humor;
    if (state.domain === 'home' || state.domain === 'work') out.domain = state.domain;
    out.disabled = stateModule.disabled === true;
    if (typeof stateModule.note === 'string' && stateModule.note.trim()) {
      out.note = stateModule.note;
    }
    return out;
  }

  function normalizeModuleForStorage(moduleKey, moduleValue) {
    if (!moduleValue || typeof moduleValue !== 'object') return null;
    if (moduleKey === 'state') return normalizeStateForStorage(moduleValue);
    if (moduleKey === 'skills') return normalizeSkillsForStorage(moduleValue);

    const responses = Array.isArray(moduleValue.responses)
      ? moduleValue.responses.map((value) => (Number.isFinite(Number(value)) ? Number(value) : value))
      : [];

    const out = {
      responses,
      disabled: moduleValue.disabled === true
    };
    if (typeof moduleValue.note === 'string' && moduleValue.note.trim()) {
      out.note = moduleValue.note;
    }
    return out;
  }

  const profile = {};

  if (sourceProfile.base && typeof sourceProfile.base === 'object') {
    const base = { ...sourceProfile.base };
    delete base.skills;
    delete base.communication_style;
    delete base.favorites;
    if (Object.keys(base).length > 0) {
      profile.base = base;
    }
  }

  if (sourceProfile.modules && typeof sourceProfile.modules === 'object') {
    const modules = {};
    for (const [moduleKey, moduleValue] of Object.entries(sourceProfile.modules)) {
      const normalized = normalizeModuleForStorage(moduleKey, moduleValue);
      if (normalized && typeof normalized === 'object') {
        modules[moduleKey] = normalized;
      }
    }
    if (Object.keys(modules).length > 0) {
      profile.modules = modules;
    }
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
  const cleaned = removeDuplicateExportSections(sanitizedContextFile);
  return { ...cleaned };
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
      withModuleMetadata(withoutRawScores(computed || {}), moduleResponses.aesthetics),
      (moduleResponses.aesthetics && typeof moduleResponses.aesthetics.note === 'string') ? { note: moduleResponses.aesthetics.note } : {}
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
      withModuleMetadata(withoutRawScores(computed || {}), moduleResponses.music),
      (moduleResponses.music && typeof moduleResponses.music.note === 'string') ? { note: moduleResponses.music.note } : {}
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
      withModuleMetadata(withoutRawScores(computed || {}), moduleResponses.delivery),
      (moduleResponses.delivery && typeof moduleResponses.delivery.note === 'string') ? { note: moduleResponses.delivery.note } : {}
    );
  }

  if (moduleResponses.delivery2) {
    const delivery2Resp = Array.isArray(moduleResponses.delivery2) ? moduleResponses.delivery2 : (moduleResponses.delivery2.responses || []);
    let computed = (!Array.isArray(moduleResponses.delivery2) && moduleResponses.delivery2.result) ? moduleResponses.delivery2.result : null;
    if (!computed && typeof bundledScoreDelivery2 === 'function') {
      try { computed = bundledScoreDelivery2(delivery2Resp); } catch (e) { computed = null; }
    }
    base.profile.modules.delivery2 = Object.assign(
      { responses: delivery2Resp || [], last_updated: now, completed: Array.isArray(delivery2Resp) ? delivery2Resp.length >= 1 : false },
      withModuleMetadata(withoutRawScores(computed || {}), moduleResponses.delivery2),
      (moduleResponses.delivery2 && typeof moduleResponses.delivery2.note === 'string') ? { note: moduleResponses.delivery2.note } : {}
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
      base.profile.modules.communication = Object.assign(
        withModuleMetadata({
          responses: computed.responses || commResp || [],
          raw_trait_scores: computed.raw_trait_scores || {},
          normalized_trait_scores: computed.normalized_trait_scores || {},
          completed: computed.completed === true,
          last_updated: computed.last_updated || now
        }, moduleResponses.communication),
        (moduleResponses.communication && typeof moduleResponses.communication.note === 'string') ? { note: moduleResponses.communication.note } : {}
      );
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
      base.profile.modules.skills = Object.assign(
        withModuleMetadata({
          responses: computed.fullAssessment || [],
          filtered: computed.filtered || [],
          normalized: computed.normalized || [],
          ...(provided.testAnswers ? { testAnswers: provided.testAnswers } : {}),
          completed: responses.length >= 35,
          last_updated: now
        }, provided),
        (provided && typeof provided.note === 'string') ? { note: provided.note } : {}
      );
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
    // Exclude fields from Base module that are no longer collected/exported
    const filteredBase = { ...moduleResponses.base };
    delete filteredBase.skills;
    delete filteredBase.communication_style;
    delete filteredBase.favorites;
    base.profile.base = filteredBase;
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
        humor: providedState.humor === 'none' || providedState.humor === 'low' || providedState.humor === 'normal' || providedState.humor === 'high' ? providedState.humor : 'normal',
        domain: providedState.domain === 'home' ? 'home' : 'work',
        completed: true,
        last_updated: now
      }, moduleResponses.state);
    }
  }

  return base;
}

// Bundle module scorers for browser builds
let externalAesthetics = (typeof bundledScoreAesthetics === 'function') ? bundledScoreAesthetics : null;
let externalMusic = (typeof bundledScoreMusic === 'function') ? bundledScoreMusic : null;
let externalDelivery = (typeof bundledScoreDelivery === 'function') ? bundledScoreDelivery : null;
let externalDelivery2 = (typeof bundledScoreDelivery2 === 'function') ? bundledScoreDelivery2 : null;
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

export function scoreDelivery2IfAvailable(responses){
  if (typeof externalDelivery2 === 'function') return externalDelivery2(responses);
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

