<script>
  import { onMount } from 'svelte';
  import Survey from '../components/Survey.svelte';
  import Aesthetics from '../components/Aesthetics.svelte';
  import Music from '../components/Music.svelte';
  import Skills from '../components/Skills.svelte';
  import Communication from '../components/Communication.svelte';
  import State from '../components/State.svelte';
  import BaseContextPicker from '../components/BaseContextPicker.svelte';
  import sessionService from '../services/sessionService.js';
  import { scoreResponses, toContextFile, toIamMarkdown, sanitizeContextFile } from '../services/profileService.js';
  import { canonicalizeState, DEFAULT_STATE } from '../../lib/state/stateManager.js';

  const moduleOrder = [
    { key: 'base', label: 'Base Context', emoji: '🪪', blurb: 'Role and personal context metadata', tone: 'teal', expectedLength: 1 },
    { key: 'ipip', label: 'Personality', emoji: '🧠', blurb: 'Core personality baseline', tone: 'violet', expectedLength: 50 },
    { key: 'aesthetics', label: 'Aesthetics', emoji: '🎨', blurb: 'Visual taste and style signals', tone: 'teal', expectedLength: 32 },
    { key: 'music', label: 'Music', emoji: '🎵', blurb: 'Listening preferences and vibe', tone: 'amber', expectedLength: 20 },
    { key: 'skills', label: 'Skills Assessment', emoji: '🛠️', blurb: 'Transferable professional skills and validation checks', tone: 'teal', expectedLength: 35 },
    { key: 'communication', label: 'Communication', emoji: '🗣️', blurb: 'How you prefer responses to be structured and delivered', tone: 'violet', expectedLength: 20 },
    { key: 'state', label: 'State', emoji: '⚡', blurb: 'Dynamic runtime context for this session', tone: 'amber', expectedLength: 0 }
  ];
  const HELP_SESSION_KEY = 'iam_help_seen_v1';

  let resumeData = null;
  let active = 'base';
  let completedModules = { base: false, ipip: false, aesthetics: false, music: false, skills: false, communication: false, state: false };
  let moduleResults = { ipip: null, aesthetics: null, music: null, skills: null, communication: null, state: null };
  let partialProfile = null;
  let partialModule = null;
  let storedProfile = null;
  let showHelp = false;
  let showIamPopup = false;
  let iamCopyStatus = '';
  let importInput;
  let importMessage = '';
  let importError = '';
  let completionPopup = null;
  let surveyResetKey = 0;
  let touchedModules = { base: false, ipip: false, aesthetics: false, music: false, skills: false, communication: false, state: false };
  let moduleProgress = {
    base: { answered: 0, expected: 1 },
    ipip: { answered: 0, expected: 50 },
    aesthetics: { answered: 0, expected: 32 },
    music: { answered: 0, expected: 20 },
    skills: { answered: 0, expected: 35 },
    communication: { answered: 0, expected: 20 },
    state: { answered: 0, expected: 1 }
  };
  let moduleProgressLabels = { base: '0/1', ipip: '0/50', aesthetics: '0/32', music: '0/20', skills: '0/35', communication: '0/20', state: '0/1' };
  let runtimeState = canonicalizeState(DEFAULT_STATE);
  let baseContext = {};
  let baseContextKey = 0; // Used to force remount of BaseContextPicker

  function isModuleComplete(moduleKey, moduleData) {
    return sessionService.isModuleCompleted(moduleKey, moduleData || {});
  }

  function hasBaseContextData(ctx) {
    if (!ctx || typeof ctx !== 'object') return false;
    const keys = ['job_title', 'company', 'years_experience', 'education_level', 'timezone', 'locale', 'communication_style', 'short_bio'];
    if (ctx.onet && typeof ctx.onet === 'object' && ctx.onet.soc_code && ctx.onet.title) return true;
    return keys.some((key) => {
      const value = ctx[key];
      if (value == null) return false;
      if (typeof value === 'number') return Number.isFinite(value);
      return String(value).trim().length > 0;
    });
  }

  function syncResumeState(data) {
    resumeData = data || null;
    const modules = resumeData?.modules || {};
    // Always update baseContext from loaded profile if present
    if (resumeData && resumeData.profile && resumeData.profile.base) {
      baseContext = { ...resumeData.profile.base };
    }
    const hasBase = hasBaseContextData(baseContext);
    completedModules = {
      base: hasBase,
      ipip: isModuleComplete('ipip', modules.ipip),
      aesthetics: isModuleComplete('aesthetics', modules.aesthetics),
      music: isModuleComplete('music', modules.music),
      skills: isModuleComplete('skills', modules.skills),
      communication: isModuleComplete('communication', modules.communication),
      state: false
    };
    runtimeState = canonicalizeState(modules.state?.state || modules.state?.result || modules.state || runtimeState);
    moduleProgress = {
      base: {
        answered: hasBase ? 1 : 0,
        expected: 1
      },
      ipip: {
        answered: sessionService.countAnsweredResponses(modules.ipip?.responses),
        expected: modules.ipip?.expectedLength || 50
      },
      aesthetics: {
        answered: sessionService.countAnsweredResponses(modules.aesthetics?.responses),
        expected: modules.aesthetics?.expectedLength || 32
      },
      music: {
        answered: sessionService.countAnsweredResponses(modules.music?.responses),
        expected: modules.music?.expectedLength || 20
      },
      skills: {
        answered: sessionService.countAnsweredResponses(modules.skills?.responses),
        expected: modules.skills?.expectedLength || 35
      },
      communication: {
        answered: sessionService.countAnsweredResponses(modules.communication?.responses),
        expected: modules.communication?.expectedLength || 20
      },
      state: {
        answered: 0,
        expected: 0
      }
    };
    touchedModules = {
      base: touchedModules.base || hasBase,
      ipip: touchedModules.ipip || sessionService.countAnsweredResponses(modules.ipip?.responses) > 0 || (modules.ipip?.current || 0) > 0,
      aesthetics: touchedModules.aesthetics || sessionService.countAnsweredResponses(modules.aesthetics?.responses) > 0 || (modules.aesthetics?.current || 0) > 0,
      music: touchedModules.music || sessionService.countAnsweredResponses(modules.music?.responses) > 0 || (modules.music?.current || 0) > 0,
      skills: touchedModules.skills || sessionService.countAnsweredResponses(modules.skills?.responses) > 0 || (modules.skills?.current || 0) > 0,
      communication: touchedModules.communication || sessionService.countAnsweredResponses(modules.communication?.responses) > 0 || (modules.communication?.current || 0) > 0,
      state: true
    };
  }

  function refreshStoredProfile() {
    try {
      const raw = localStorage.getItem('iam_profile');
      const parsed = raw ? sanitizeContextFile(JSON.parse(raw)) : null;
      const savedBase = sessionService.loadBaseContext();
      if (parsed && savedBase && typeof savedBase === 'object') {
        parsed.profile = parsed.profile || {};
        if (!parsed.profile.base || Object.keys(parsed.profile.base).length === 0) {
          parsed.profile.base = { ...savedBase };
        }
      }
      if (parsed) {
        localStorage.setItem('iam_profile', JSON.stringify(parsed));
      }
      storedProfile = parsed;
    } catch (err) {
      console.error('Failed to load stored profile', err);
      storedProfile = null;
    }
  }

  onMount(() => {
    try {
      baseContext = sessionService.loadBaseContext() || {};
      const raw = (typeof window !== 'undefined' && window.location && window.location.hash) ? window.location.hash : '';
      const m = raw.match(/\?(.+)$/);
      const qs = m ? new URLSearchParams(m[1]) : new URLSearchParams();
      if (qs.get('resume') === '1' || sessionService.hasSaved()) {
        syncResumeState(sessionService.loadProgress());
        resumeToSavedModule();
      } else {
        syncResumeState(null);
      }
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const helpSeen = window.sessionStorage.getItem(HELP_SESSION_KEY) === '1';
        if (!helpSeen) {
          showHelp = true;
          window.sessionStorage.setItem(HELP_SESSION_KEY, '1');
        }
      }
      refreshStoredProfile();
      window.addEventListener('storage', refreshStoredProfile);
    } catch (e) {
      // keep defaults
    }
    return () => {
      window.removeEventListener('storage', refreshStoredProfile);
    };
  });

  $: completedCount = moduleOrder.filter((mod) => completedModules[mod.key]).length;
  $: activeMeta = moduleOrder.find((mod) => mod.key === active) || moduleOrder[0];
  $: fallbackExportProfile = buildFallbackExportProfile();
  $: exportProfile = fallbackExportProfile || partialProfile || storedProfile;
  $: currentIamCode = exportProfile?.profile?.iam?.code || '';
  $: iamPopupText = buildIamPopupText(currentIamCode);
  $: canDownloadProfile = completedCount > 0 || !!exportProfile;
  $: moduleProgressLabels = Object.fromEntries(moduleOrder.map((mod) => {
    if (mod.key === 'state') return [mod.key, 'Baseline'];
    const progress = moduleProgress[mod.key] || { answered: 0, expected: mod.expectedLength || 0 };
    const answered = progress.answered || 0;
    const expected = progress.expected || mod.expectedLength || 0;
    return [mod.key, `${answered}/${expected}`];
  }));
  $: activeStatusLabel = active === 'state' ? 'Baseline' : (completedModules[active] ? 'Completed' : 'Active');

  function setActiveModule(nextModule) {
    if (!nextModule || nextModule === active) return;
    touchedModules = { ...touchedModules, [active]: true };
    active = nextModule;
  }

  function hasStarted(moduleKey) {
    const moduleData = resumeData?.modules?.[moduleKey];
    const answered = sessionService.countAnsweredResponses(moduleData?.responses);
    const savedCursor = typeof moduleData?.current === 'number' ? moduleData.current : 0;
    return answered > 0 || savedCursor > 0 || touchedModules[moduleKey];
  }

  function parseContextUpload(text) {
    if (!text || typeof text !== 'string') throw new Error('Uploaded file is empty.');
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Uploaded file is empty.');

    const parseBaseContextSection = (source) => {
      const startMarker = '<!-- IAM_BASE_CONTEXT_START -->';
      const endMarker = '<!-- IAM_BASE_CONTEXT_END -->';
      const startIndex = source.indexOf(startMarker);
      const endIndex = source.indexOf(endMarker);
      if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) return null;

      const base = {};
      const section = source.slice(startIndex + startMarker.length, endIndex);
      const lines = section.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

      for (const line of lines) {
        if (!line.startsWith('- ')) continue;
        const content = line.slice(2).trim();
        const colonIndex = content.indexOf(':');
        if (colonIndex < 0) continue;

        const key = content.slice(0, colonIndex).trim();
        const value = content.slice(colonIndex + 1).trim();
        if (!key) continue;

        if (key === 'onet.soc_code' || key === 'onet.title') {
          base.onet = base.onet || {};
          base.onet[key.split('.')[1]] = value;
        } else if (key === 'years_experience') {
          const numeric = Number(value);
          base[key] = Number.isFinite(numeric) ? numeric : value;
        } else {
          base[key] = value;
        }
      }

      return Object.keys(base).length ? base : null;
    };

    const baseContextFromMarkdown = parseBaseContextSection(trimmed);

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      if (baseContextFromMarkdown) {
        const rootProfile = parsed?.profile || parsed;
        if (rootProfile && typeof rootProfile === 'object' && !rootProfile.base) {
          rootProfile.base = baseContextFromMarkdown;
        }
      }
      return sanitizeContextFile(parsed);
    }

    const jsonBlocks = [...trimmed.matchAll(/```json\s*([\s\S]*?)```/gi)].map((match) => match[1].trim()).filter(Boolean);
    if (jsonBlocks.length) {
      const preferredBlock = jsonBlocks.find((block) => {
        try {
          const parsed = JSON.parse(block);
          return !!(parsed && typeof parsed === 'object' && (parsed.profile || parsed.schema_version || parsed.generated_at));
        } catch (err) {
          return false;
        }
      }) || jsonBlocks[0];
      const parsed = JSON.parse(preferredBlock);
      if (baseContextFromMarkdown) {
        const rootProfile = parsed?.profile || parsed;
        if (rootProfile && typeof rootProfile === 'object' && !rootProfile.base) {
          rootProfile.base = baseContextFromMarkdown;
        }
      }
      return sanitizeContextFile(parsed);
    }

    if (baseContextFromMarkdown) {
      return sanitizeContextFile({ profile: { base: baseContextFromMarkdown } });
    }

    throw new Error('Could not find a context payload or basic context section. Upload a context JSON file or an IAM markdown file.');
  }

  function buildExportBaseName(profile) {
    const name = profile?.profile?.base?.name;
    if (!name || typeof name !== 'string') return 'profile.context';
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .replace(/\.{2,}/g, '.');
    return slug || 'profile.context';
  }

  function downloadCurrent() {
    try {
      const latestProfile = buildFallbackExportProfile();
      const profileToDownload = latestProfile || exportProfile;
      if (!profileToDownload) return;
      try {
        localStorage.setItem('iam_profile', JSON.stringify(profileToDownload));
        refreshStoredProfile();
      } catch (err) {
        console.error('Failed to persist latest export profile', err);
      }
      const md = toIamMarkdown(profileToDownload);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${buildExportBaseName(profileToDownload)}.iam.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  }

  function downloadPartial() {
    try {
      if (!partialProfile) return;
      const md = toIamMarkdown(partialProfile);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${buildExportBaseName(partialProfile)}.partial.${partialModule}.iam.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  }

  function buildIamPopupText(iamCode) {
    return [
      `IAM: ${iamCode || 'IAM code unavailable'}`,
      '',
      'Instructions for the LLM:',
      '1. Treat the IAM string above as authoritative structured profile context for the user.',
      '2. Use it to adapt tone, communication style, preferences, and response framing.',
      '3. Do not rewrite, compress, or reinterpret the IAM string unless explicitly asked to explain it.',
      '4. If additional context conflicts with the IAM string, prefer the most recent user instruction while retaining IAM as the baseline profile.',
      '5. Apply the IAM guidance silently in your responses instead of repeatedly restating the profile.'
    ].join('\n');
  }

  async function copyIamText() {
    iamCopyStatus = '';
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(iamPopupText);
      } else {
        const temp = document.createElement('textarea');
        temp.value = iamPopupText;
        temp.setAttribute('readonly', '');
        temp.style.position = 'absolute';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      iamCopyStatus = 'Copied to clipboard.';
    } catch (err) {
      iamCopyStatus = 'Copy failed. Select the text and copy manually.';
    }
  }

  function buildModuleResponses() {
    const storedModules = storedProfile?.profile?.modules && typeof storedProfile.profile.modules === 'object'
      ? storedProfile.profile.modules
      : {};
    return {
      ipip: resumeData?.modules?.ipip?.responses || moduleResults.ipip?.responses || storedModules?.ipip?.responses || [],
      aesthetics: moduleResults.aesthetics
        ? { responses: moduleResults.aesthetics.responses, result: moduleResults.aesthetics.result }
        : (resumeData?.modules?.aesthetics
          ? { responses: resumeData.modules.aesthetics.responses }
          : (storedModules?.aesthetics
            ? {
                responses: Array.isArray(storedModules.aesthetics.responses) ? storedModules.aesthetics.responses : [],
                result: storedModules.aesthetics
              }
            : null)),
      music: moduleResults.music
        ? { responses: moduleResults.music.responses, result: moduleResults.music.result }
        : (resumeData?.modules?.music
          ? { responses: resumeData.modules.music.responses }
          : (storedModules?.music
            ? {
                responses: Array.isArray(storedModules.music.responses) ? storedModules.music.responses : [],
                result: storedModules.music
              }
            : null)),
      skills: moduleResults.skills
        ? {
            responses: moduleResults.skills.responses,
            result: moduleResults.skills.result,
            testAnswers: moduleResults.skills.testAnswers || {}
          }
        : (resumeData?.modules?.skills
          ? {
              responses: resumeData.modules.skills.responses,
              testAnswers: resumeData.modules.skills.testAnswers || {}
            }
          : (storedModules?.skills
            ? {
                responses: Array.isArray(storedModules.skills.responses) ? storedModules.skills.responses : [],
                result: storedModules.skills,
                testAnswers: storedModules.skills.testAnswers || {}
              }
            : null)),
      communication: moduleResults.communication
        ? { responses: moduleResults.communication.responses, result: moduleResults.communication.result }
        : (resumeData?.modules?.communication
          ? { responses: resumeData.modules.communication.responses }
          : (storedModules?.communication
            ? {
                responses: Array.isArray(storedModules.communication.responses) ? storedModules.communication.responses : [],
                result: storedModules.communication
              }
            : null)),
      state: moduleResults.state
        ? {
            responses: moduleResults.state.responses,
            result: moduleResults.state.result,
            state: moduleResults.state.state || moduleResults.state.result
          }
        : (resumeData?.modules?.state
          ? {
              responses: resumeData.modules.state.responses,
              state: resumeData.modules.state.state || resumeData.modules.state.result
            }
          : (storedModules?.state
            ? {
                responses: Array.isArray(storedModules.state.responses) ? storedModules.state.responses : [],
                state: storedModules.state.state || storedModules.state
              }
            : {
                responses: [],
                state: canonicalizeState(runtimeState || DEFAULT_STATE)
              })),
      base: baseContext || {}
    };
  }

  function handleBaseContextChange(event) {
    const payload = event?.detail?.value || {};
    baseContext = payload;
    sessionService.saveBaseContext(payload);
    const hasBase = hasBaseContextData(payload);
    completedModules = { ...completedModules, base: hasBase };
    moduleProgress = { ...moduleProgress, base: { answered: hasBase ? 1 : 0, expected: 1 } };
    touchedModules = { ...touchedModules, base: hasBase || touchedModules.base };
  }

  function buildFallbackExportProfile() {
    if (completedCount <= 0) return null;
    try {
      const modulePayload = buildModuleResponses();
      const ipipResponses = modulePayload.ipip || [];
      const scored = Array.isArray(ipipResponses) && ipipResponses.length === 50
        ? scoreResponses(ipipResponses)
        : { raw: {}, normalized: {} };
      return toContextFile(scored, modulePayload);
    } catch (err) {
      console.error('Failed to build fallback export profile', err);
      return null;
    }
  }

  function triggerImportPicker() {
    if (importInput) importInput.click();
  }

  async function handleImportFile(event) {
    importMessage = '';
    importError = '';
    const selectedFile = event?.target?.files?.[0];
    if (!selectedFile) return;
    try {
      const text = await selectedFile.text();
      const parsed = parseContextUpload(text);
      const rootProfile = parsed?.profile || parsed;
      const modules = rootProfile?.modules || {};

      const persistModule = (moduleName, moduleValue) => {
        if (!moduleValue || !Array.isArray(moduleValue.responses)) return;
        const expectedLength = moduleName === 'ipip' ? 50 : moduleValue.responses.length;
        sessionService.saveProgress(moduleName, {
          responses: moduleValue.responses,
          current: moduleValue.responses.length,
          expectedLength,
          completed: isModuleComplete(moduleName, moduleValue)
        });
      };

      persistModule('ipip', modules.ipip);
      persistModule('aesthetics', modules.aesthetics);
      persistModule('music', modules.music);
      persistModule('skills', modules.skills);
      persistModule('communication', modules.communication);
      if (modules.state && typeof modules.state === 'object') {
        runtimeState = canonicalizeState(modules.state.state || modules.state.result || modules.state);
        sessionService.saveProgress('state', {
          responses: [],
          current: 0,
          expectedLength: 0,
          completed: false,
          state: modules.state.state || modules.state
        });
      }

      if (rootProfile?.base && typeof rootProfile.base === 'object') {
        baseContext = { ...rootProfile.base };
        sessionService.saveBaseContext(baseContext);
        baseContextKey += 1; // Force BaseContextPicker remount
      }

      const normalized = parsed?.profile ? parsed : { profile: rootProfile };
      localStorage.setItem('iam_profile', JSON.stringify(normalized));
      syncResumeState(sessionService.loadProgress());
      refreshStoredProfile();
      importMessage = 'Context file loaded.';
    } catch (err) {
      importError = err?.message || String(err);
    } finally {
      if (event?.target) event.target.value = '';
    }
  }

  function handleModuleComplete(e) {
    const { module, responses, result, testAnswers } = e.detail;
    const moduleMeta = moduleOrder.find((mod) => mod.key === module);
    const expectedLength = moduleMeta?.expectedLength || responses.length;

    try {
      sessionService.saveProgress(module, {
        responses,
        testAnswers: module === 'skills' ? (testAnswers || {}) : undefined,
        current: responses.length,
        expectedLength,
        completed: true
      });
      syncResumeState(sessionService.loadProgress());
    } catch (err) {
      console.error('Failed to save module progress', err);
    }

    completedModules = { ...completedModules, [module]: true };
    moduleResults = {
      ...moduleResults,
      [module]: {
        responses,
        result,
        ...(module === 'skills' ? { testAnswers: testAnswers || {} } : {})
      }
    };
    moduleProgress = {
      ...moduleProgress,
      [module]: { answered: responses.length, expected: expectedLength }
    };

    try {
      const ipipResponses = resumeData?.modules?.ipip?.responses || moduleResults.ipip?.responses || [];
      const scored = Array.isArray(ipipResponses) && ipipResponses.length === 50 ? scoreResponses(ipipResponses) : { raw: {}, normalized: {} };
      partialProfile = toContextFile(scored, buildModuleResponses());
      partialModule = module;
      const moduleLabel = moduleMeta?.label || module;
      completionPopup = {
        title: `${moduleLabel} completed`,
        message: 'Context file updated and ready for download.'
      };
      try {
        localStorage.setItem('iam_profile', JSON.stringify(partialProfile));
        refreshStoredProfile();
      } catch (err) {
        console.error('Failed to persist partial profile', err);
      }
    } catch (err) {
      console.error('Failed to prepare partial context', err);
    }

    if (module === 'ipip') setActiveModule('aesthetics');
    else if (module === 'aesthetics') setActiveModule('music');
    else if (module === 'music') setActiveModule('skills');
    else if (module === 'skills') setActiveModule('communication');
    else if (module === 'communication') {
      setActiveModule('state');
      try {
        const ipipResponses = resumeData?.modules?.ipip?.responses || moduleResults.ipip?.responses || [];
        const scored = Array.isArray(ipipResponses) && ipipResponses.length === 50 ? scoreResponses(ipipResponses) : { raw: {}, normalized: {} };
        const ctx = toContextFile(scored, buildModuleResponses());
        try {
          localStorage.setItem('iam_profile', JSON.stringify(ctx));
          refreshStoredProfile();
        } catch (err) {
          console.error('Failed to persist final profile', err);
        }
      } catch (err) {
        console.error('Failed to export context', err);
      }
      try {
        sessionService.clearProgress();
      } catch (err) {
        console.error('Failed to clear progress', err);
      }
    }
  }

  function handleModuleProgress(payloadOrEvent) {
    const detail = payloadOrEvent?.detail || payloadOrEvent || {};
    const { module, responses, current, expectedLength, testAnswers, state } = detail;
    if (!module || !Array.isArray(responses)) return;
    try {
      if (module === 'state') {
        runtimeState = canonicalizeState(state || runtimeState);
      }
      const answered = sessionService.countAnsweredResponses(responses);
      const resolvedExpected = expectedLength || moduleProgress[module]?.expected || moduleOrder.find((mod) => mod.key === module)?.expectedLength || 0;
      const isStateModule = module === 'state';
      moduleProgress = {
        ...moduleProgress,
        [module]: {
          answered: isStateModule ? 0 : answered,
          expected: isStateModule ? 0 : resolvedExpected
        }
      };
      touchedModules = { ...touchedModules, [module]: true };
      resumeData = {
        ...(resumeData || {}),
        modules: {
          ...((resumeData && resumeData.modules) ? resumeData.modules : {}),
          [module]: {
            ...(((resumeData && resumeData.modules) ? resumeData.modules[module] : {}) || {}),
            responses: responses.slice(0),
            ...(module === 'skills' ? { testAnswers: testAnswers || {} } : {}),
            ...(module === 'state' && state && typeof state === 'object' ? { state: { ...state } } : {}),
            current: typeof current === 'number' ? current : 0,
            expectedLength: isStateModule ? 0 : resolvedExpected,
            answered: isStateModule ? 0 : answered,
            completed: isStateModule ? false : answered >= resolvedExpected
          }
        }
      };
      completedModules = {
        ...completedModules,
        [module]: isStateModule ? false : answered >= resolvedExpected
      };
      sessionService.saveProgress(module, {
        responses,
        testAnswers: module === 'skills' ? (testAnswers || {}) : undefined,
        state: module === 'state' ? canonicalizeState(state || runtimeState) : undefined,
        current,
        expectedLength: isStateModule ? 0 : expectedLength
      });

      if (module === 'state') {
        const ipipResponses = resumeData?.modules?.ipip?.responses || moduleResults.ipip?.responses || [];
        const scored = Array.isArray(ipipResponses) && ipipResponses.length === 50
          ? scoreResponses(ipipResponses)
          : { raw: {}, normalized: {} };
        const latest = toContextFile(scored, buildModuleResponses());
        partialProfile = latest;
        partialModule = 'state';
        try {
          localStorage.setItem('iam_profile', JSON.stringify(latest));
          refreshStoredProfile();
        } catch (err) {
          console.error('Failed to persist state-updated profile', err);
        }
      }
    } catch (err) {
      console.error('Failed to sync module progress', err);
    }
  }

  function resumeToSavedModule() {
    try {
      if (resumeData?.modules?.ipip && !isModuleComplete('ipip', resumeData.modules.ipip)) {
        setActiveModule('ipip');
      } else if (resumeData?.modules?.aesthetics && !isModuleComplete('aesthetics', resumeData.modules.aesthetics)) {
        setActiveModule('aesthetics');
      } else if (resumeData?.modules?.music && !isModuleComplete('music', resumeData.modules.music)) {
        setActiveModule('music');
      } else if (resumeData?.modules?.skills && !isModuleComplete('skills', resumeData.modules.skills)) {
        setActiveModule('skills');
      } else if (resumeData?.modules?.communication && !isModuleComplete('communication', resumeData.modules.communication)) {
        setActiveModule('communication');
      } else if (resumeData?.modules?.state && !isModuleComplete('state', resumeData.modules.state)) {
        setActiveModule('state');
      } else if (resumeData?.modules?.aesthetics) {
        setActiveModule('aesthetics');
      } else if (resumeData?.modules?.music) {
        setActiveModule('music');
      } else if (resumeData?.modules?.skills) {
        setActiveModule('skills');
      } else if (resumeData?.modules?.communication) {
        setActiveModule('communication');
      } else if (resumeData?.modules?.state) {
        setActiveModule('state');
      } else if (hasBaseContextData(baseContext)) {
        setActiveModule('base');
      }
    } catch (err) {
      console.error('Failed to resume module', err);
    }
  }

  function doStartOver() {
    try {
      sessionService.clearProgress();
      sessionService.clearBaseContext();
      localStorage.removeItem('iam_profile');
    } catch (err) {
      console.error('Failed to clear progress', err);
    }
    resumeData = null;
    completedModules = { base: false, ipip: false, aesthetics: false, music: false, skills: false, communication: false, state: false };
    moduleResults = { ipip: null, aesthetics: null, music: null, skills: null, communication: null, state: null };
    partialProfile = null;
    partialModule = null;
    storedProfile = null;
    importMessage = '';
    importError = '';
    completionPopup = null;
    active = 'base';
    touchedModules = { base: false, ipip: false, aesthetics: false, music: false, skills: false, communication: false, state: false };
    moduleProgress = {
      base: { answered: 0, expected: 1 },
      ipip: { answered: 0, expected: 50 },
      aesthetics: { answered: 0, expected: 32 },
      music: { answered: 0, expected: 20 },
      skills: { answered: 0, expected: 35 },
      communication: { answered: 0, expected: 20 },
      state: { answered: 0, expected: 0 }
    };
    runtimeState = canonicalizeState(DEFAULT_STATE);
    baseContext = {};
    surveyResetKey += 1;
  }
</script>

<section class="survey-shell">
  <div class="survey-hero">
    <div class="hero-branding">
      <img src="/iam-logo.png" alt="IAM Logo" class="hero-logo" />
      <div class="hero-titles">
        <h1 class="survey-app-title">I-Am</h1>
        <p class="subtitle">Context Generator</p>
      </div>
    </div>
    <div class="hero-content">
      <div class="hero-toolbar">
        <div class="toolbar-actions">
          <input bind:this={importInput} class="hidden-input" type="file" accept="application/json,text/markdown,.md" on:change={handleImportFile} />
          <button class="mini-btn" on:click={triggerImportPicker}>Upload</button>
          <button class="mini-btn" on:click={() => { showIamPopup = true; iamCopyStatus = ''; }} disabled={!canDownloadProfile}>View IAM</button>
          <button class="mini-btn" on:click={downloadCurrent} disabled={!canDownloadProfile}>IAM Markdown</button>
          <button class="mini-btn danger" on:click={doStartOver}>Reset</button>
        </div>
        <button class="mini-btn subtle" on:click={() => showHelp = true} aria-haspopup="dialog" aria-expanded={showHelp}>Help</button>
      </div>
      <h2>{activeMeta.emoji} {activeMeta.label}</h2>
      {#if importMessage}
        <p class="hero-message">{importMessage}</p>
      {/if}
      {#if importError}
        <p class="hero-error">Import failed: {importError}</p>
      {/if}
      <div class="module-rail" aria-label="Module navigator">
        {#each moduleOrder as mod}
          <button
            class={`module-chip ${active === mod.key ? 'active' : ''} ${completedModules[mod.key] ? 'done' : ''} tone-${mod.tone}`}
            on:click={() => setActiveModule(mod.key)}
          >
            <span class="module-chip__emoji">{mod.emoji}</span>
            <span class="module-chip__label">{mod.label}</span>
            {#if mod.key !== 'state'}
              <small>{moduleProgressLabels[mod.key]}</small>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="workspace">
    <div class="workspace-header">
      <div>
        <h3>{activeMeta.label}</h3>
      </div>
      <div class={`status-pill ${active === 'state' ? '' : (completedModules[active] ? 'done' : '')}`}>{activeStatusLabel}</div>
    </div>

    {#key `${active}:${surveyResetKey}`}
      {#if active === 'base'}
        <BaseContextPicker value={baseContext} key={baseContextKey} on:change={handleBaseContextChange} />
      {:else if active === 'ipip'}
        <Survey onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.ipip?.responses} initialCurrent={resumeData?.modules?.ipip?.current} />
      {:else if active === 'aesthetics'}
        <Aesthetics onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.aesthetics?.responses} initialCurrent={resumeData?.modules?.aesthetics?.current} />
      {:else if active === 'music'}
        <Music onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.music?.responses} initialCurrent={resumeData?.modules?.music?.current} />
      {:else if active === 'skills'}
        <Skills onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.skills?.responses} initialCurrent={resumeData?.modules?.skills?.current} initialConfirmations={resumeData?.modules?.skills?.testAnswers} />
      {:else if active === 'state'}
        <State onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} initialState={runtimeState} />
      {:else}
        <Communication onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.communication?.responses} initialCurrent={resumeData?.modules?.communication?.current} />
      {/if}
    {/key}
  </div>

  {#if completionPopup}
    <div class="popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="completion-popup-title">
      <div class="popup-card">
        <p class="panel-eyebrow">Context updated</p>
        <h3 id="completion-popup-title">{completionPopup.title}</h3>
        <p>{completionPopup.message}</p>
        <div class="panel-actions">
          <button class="primary" on:click={downloadPartial}>Download IAM Markdown</button>
          <button on:click={() => completionPopup = null}>Close</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showHelp}
    <div class="popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="help-popup-title">
      <div class="popup-card">
        <p class="panel-eyebrow">Welcome</p>
        <h3 id="help-popup-title">What this site does</h3>
        <p>This site builds a structured personality context profile for AI systems across baseline context plus modules: Personality, Aesthetics, Music, Skills, Communication, and State.</p>
        <p>As you answer questions, progress is saved automatically and module scores are assembled into a downloadable IAM markdown context file with embedded JSON for review and editing.</p>
        <p>Complete as many modules as you want, then use the top controls to export your current profile or upload a saved context file to continue.</p>
        <div class="panel-actions">
          <button class="primary" on:click={() => showHelp = false}>Got it</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showIamPopup}
    <div class="popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="iam-popup-title">
      <div class="popup-card">
        <p class="panel-eyebrow">Current profile</p>
        <h3 id="iam-popup-title">Current IAM String</h3>
        <p>This block includes model-facing instructions that travel with the current IAM string.</p>
        <textarea class="iam-popup-text" readonly value={iamPopupText} aria-label="Current IAM text"></textarea>
        {#if iamCopyStatus}
          <p class="iam-copy-status">{iamCopyStatus}</p>
        {/if}
        <div class="panel-actions">
          <button class="primary" on:click={copyIamText}>Copy</button>
          <button on:click={() => showIamPopup = false}>Close</button>
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  .survey-shell {
    display: grid;
    gap: 24px;
  }

  .survey-hero,
  .workspace,
  .panel,
  .popup-card {
    border-radius: 20px;
    background: var(--iam-card-bg, rgba(30, 41, 59, 0.7));
    border: 1px solid var(--iam-card-border, rgba(148, 163, 184, 0.1));
    box-shadow: var(--iam-card-shadow, 0 10px 24px rgba(0, 0, 0, 0.3));
    backdrop-filter: blur(12px);
  }

  .survey-hero {
    padding: 24px;
    display: flex;
    flex-direction: row;
    gap: 32px;
    align-items: center;
  }

  .hero-branding {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    text-align: center;
    min-width: 140px;
  }

  .hero-logo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-shadow: var(--iam-card-shadow);
  }

  .survey-app-title {
    font-size: 1.4rem;
    margin: 0;
    font-weight: 800;
    color: var(--iam-text-primary);
  }
  
  .hero-titles .subtitle {
    font-size: 0.8rem;
    margin: 0;
    font-weight: 600;
    color: var(--iam-text-secondary);
  }

  .hero-content {
    flex-grow: 1;
    min-width: 0;
  }

  .survey-hero h2 {
    margin: 6px 0 10px;
    font-size: clamp(1.7rem, 3vw, 2.5rem);
    line-height: 1.06;
    color: var(--iam-text-primary);
  }

  .survey-hero p {
    margin: 0;
    color: var(--iam-text-secondary);
    max-width: 60ch;
  }

  .eyebrow,
  .panel-eyebrow {
    margin: 0 0 6px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 0.75rem;
    font-weight: 800;
    color: #6366f1;
  }

  .hero-tools {
    display: grid;
    gap: 10px;
  }

  .hero-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .mini-btn {
    padding: 7px 11px;
    border-radius: 999px;
    font-weight: 800;
    font-size: 0.8rem;
    background: #e2e8f0;
    color: #0f172a;
    border: 1px solid rgba(148, 163, 184, 0.3);
  }

  .mini-btn.subtle {
    background: #0f172a;
    color: #f8fafc;
  }

  .mini-btn.danger {
    background: rgba(220, 38, 38, 0.12);
    color: #991b1b;
    border-color: rgba(220, 38, 38, 0.24);
  }

  .mini-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .hidden-input {
    display: none;
  }

  .hero-message {
    margin-top: 8px;
    color: #047857;
    font-size: 0.9rem;
    font-weight: 700;
  }

  .hero-error {
    margin-top: 8px;
    color: #b91c1c;
    font-size: 0.9rem;
    font-weight: 700;
  }

  .module-rail {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 14px;
  }

  .module-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 190px;
    padding: 14px;
    border-radius: 20px;
    border: 1px solid var(--iam-card-border);
    background: var(--iam-card-bg);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
    text-align: left;
    transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease;
    backdrop-filter: blur(12px);
    color: var(--iam-text-primary);
  }

  .module-chip:hover,
  .module-chip:focus-visible {
    transform: translateY(-4px);
    outline: none;
    border-color: var(--iam-teal);
    box-shadow: 0 16px 26px rgba(6, 182, 212, 0.2);
  }

  .module-chip.active {
    border-color: var(--iam-purple);
    box-shadow: 0 18px 30px rgba(168, 85, 247, 0.25);
    background: rgba(168, 85, 247, 0.1);
  }

  .module-chip.done {
    background: rgba(132, 204, 22, 0.1);
    border-color: var(--iam-green);
  }

  .module-chip__emoji {
    font-size: 1.2rem;
  }

  .module-chip__label {
    font-weight: 900;
  }

  .module-chip small {
    margin-left: auto;
    color: var(--iam-text-secondary);
    font-weight: 800;
  }

  .panel,
  .workspace {
    padding: 24px;
  }

  .workspace-header h3 {
    margin: 0 0 8px;
    font-size: 1.2rem;
    color: var(--iam-text-primary);
  }

  .panel-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .panel-actions button,
  .workspace-header .status-pill {
    padding: 10px 14px;
    border-radius: 999px;
    font-weight: 800;
  }

  .panel-actions button {
    background: rgba(255, 255, 255, 0.1);
    color: var(--iam-text-primary);
    border: none;
  }

  .panel-actions .primary {
    background: var(--iam-gradient);
    color: #fff;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
  }

  .workspace {
    display: grid;
    gap: 16px;
  }

  .workspace-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .workspace-header .status-pill {
    background: rgba(168, 85, 247, 0.2);
    color: #D8B4FE;
  }

  .workspace-header .status-pill.done {
    background: rgba(132, 204, 22, 0.2);
    color: #BEF264;
  }

  .popup-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    display: grid;
    place-items: center;
    padding: 16px;
    z-index: 40;
  }

  .popup-card {
    width: min(520px, 100%);
    background: var(--iam-card-bg);
  }

  .popup-card h3 {
    margin: 0 0 8px;
    font-size: 1.2rem;
    color: var(--iam-text-primary);
  }

  .popup-card p {
    margin: 0 0 12px;
    color: var(--iam-text-secondary);
  }

  .iam-popup-text {
    width: 100%;
    min-height: 170px;
    border-radius: 12px;
    border: 1px dashed rgba(148, 163, 184, 0.35);
    background: rgba(0, 0, 0, 0.2);
    color: #cbd5e1;
    font: 0.9rem/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    padding: 12px;
    resize: vertical;
  }

  .iam-copy-status {
    margin-top: 8px;
    font-size: 0.85rem;
    color: #0f766e;
    font-weight: 700;
  }

  @media (max-width: 900px) {
    .survey-hero {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
</style>

