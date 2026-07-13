<script>
  import { onMount } from 'svelte';
  import Survey from '../components/Survey.svelte';
  import Aesthetics from '../components/Aesthetics.svelte';
  import Music from '../components/Music.svelte';
  import Delivery from '../components/Delivery.svelte';
  import Delivery2 from '../components/Delivery2.svelte';
  import Skills from '../components/Skills.svelte';
  import Communication from '../components/Communication.svelte';
  import State from '../components/State.svelte';
  import BaseContextPicker from '../components/BaseContextPicker.svelte';
  import introHelpMd from '../help/intro.md?raw';
  import baseHelpMd from '../help/base.md?raw';
  import ipipHelpMd from '../help/ipip.md?raw';
  import aestheticsHelpMd from '../help/aesthetics.md?raw';
  import musicHelpMd from '../help/music.md?raw';
  import deliveryHelpMd from '../help/delivery.md?raw';
  import delivery2HelpMd from '../help/delivery2.md?raw';
  import skillsHelpMd from '../help/skills.md?raw';
  import communicationHelpMd from '../help/communication.md?raw';
  import stateHelpMd from '../help/state.md?raw';
  import sessionService from '../services/sessionService.js';
  import { scoreResponses, toContextFile, toIamDataStorageJson, sanitizeContextFile } from '../services/profileService.js';
  import { buildIam } from '../../lib/iam/iam.js';
  import { canonicalizeState, DEFAULT_STATE } from '../../lib/state/stateManager.js';

  const moduleOrder = [
    { key: 'state', label: 'State', emoji: '⚡', blurb: 'Dynamic runtime context for this session', tone: 'amber', expectedLength: 0 },
    { key: 'base', label: 'Base Context', emoji: '🪪', blurb: 'Role and personal context metadata', tone: 'teal', expectedLength: 1 },
    { key: 'ipip', label: 'Personality', emoji: '🧠', blurb: 'Core personality baseline', tone: 'violet', expectedLength: 50 },
    { key: 'aesthetics', label: 'Aesthetics', emoji: '🎨', blurb: 'Visual taste and style signals', tone: 'teal', expectedLength: 32 },
    { key: 'music', label: 'Music', emoji: '🎵', blurb: 'Listening preferences and vibe', tone: 'amber', expectedLength: 20 },
    { key: 'delivery', label: 'Delivery', emoji: '🔎', blurb: 'Unified interaction preference delivery', tone: 'teal', expectedLength: 30 },
    { key: 'delivery2', label: 'Delivery v2', emoji: '🧭', blurb: 'Standalone presentation and initiative preferences', tone: 'violet', expectedLength: 24 },
    { key: 'skills', label: 'Skills Assessment', emoji: '🛠️', blurb: 'Transferable professional skills and validation checks', tone: 'teal', expectedLength: 35 },
    { key: 'communication', label: 'Communication', emoji: '🗣️', blurb: 'How you prefer responses to be structured and delivered', tone: 'violet', expectedLength: 20 }
  ];

  const HELP_SESSION_KEY = 'iam_help_seen_v1';

  const HELP_FALLBACKS = {
    base: { title: 'Base Context', summary: '', howToAnswer: [], metrics: [], metricMeaning: '', aiUse: '' },
    ipip: { title: 'Personality', summary: '', howToAnswer: [], metrics: [], metricMeaning: '', aiUse: '' },
    aesthetics: { title: 'Aesthetics', summary: '', howToAnswer: [], metrics: [], metricMeaning: '', aiUse: '' },
    music: { title: 'Music', summary: '', howToAnswer: [], metrics: [], metricMeaning: '', aiUse: '' },
    delivery: { title: 'Delivery', summary: '', howToAnswer: [], metrics: [], metricMeaning: '', aiUse: '' },
    delivery2: { title: 'Delivery v2', summary: '', howToAnswer: [], metrics: [], metricMeaning: '', aiUse: '' },
    skills: { title: 'Skills Assessment', summary: '', howToAnswer: [], metrics: [], metricMeaning: '', aiUse: '' },
    communication: { title: 'Communication', summary: '', howToAnswer: [], metrics: [], metricMeaning: '', aiUse: '' },
    state: { title: 'State', summary: '', howToAnswer: [], metrics: [], metricMeaning: '', aiUse: '' }
  };

  function formatInlineMarkdown(text) {
    if (!text) return '';
    return String(text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function normalizeHelpSectionKey(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseModuleHelpMarkdown(markdownText, fallback) {
    const result = {
      title: fallback?.title || '',
      summary: fallback?.summary || '',
      howToAnswer: Array.isArray(fallback?.howToAnswer) ? fallback.howToAnswer.slice(0) : [],
      metrics: Array.isArray(fallback?.metrics) ? fallback.metrics.slice(0) : [],
      metricMeaning: fallback?.metricMeaning || '',
      aiUse: fallback?.aiUse || ''
    };

    if (!markdownText) return result;

    const sectionMap = {
      summary: 'summary',
      'how to answer': 'howToAnswer',
      'key metrics produced': 'metrics',
      'key metrics': 'metrics',
      'metric meaning': 'metricMeaning',
      'how these metrics guide ai behavior': 'aiUse',
      'how it helps the ai': 'aiUse'
    };

    const listSections = new Set(['howToAnswer', 'metrics']);
    let currentSection = 'summary';
    const lines = String(markdownText).split(/\r?\n/);

    result.howToAnswer = [];
    result.metrics = [];
    result.summary = '';
    result.metricMeaning = '';
    result.aiUse = '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith('# ')) {
        result.title = line.replace(/^#\s+/, '').trim() || result.title;
        continue;
      }

      if (line.startsWith('## ')) {
        const heading = normalizeHelpSectionKey(line.replace(/^##\s+/, ''));
        currentSection = sectionMap[heading] || currentSection;
        continue;
      }

      if (line.startsWith('- ')) {
        const item = line.replace(/^-\s+/, '').trim();
        if (!item) continue;
        if (listSections.has(currentSection)) {
          result[currentSection].push(item);
        }
        continue;
      }

      if (listSections.has(currentSection)) continue;
      result[currentSection] = result[currentSection] ? `${result[currentSection]} ${line}` : line;
    }

    if (!result.summary) result.summary = fallback?.summary || '';
    if (!result.metricMeaning) result.metricMeaning = fallback?.metricMeaning || '';
    if (!result.aiUse) result.aiUse = fallback?.aiUse || '';
    if (!result.howToAnswer.length) result.howToAnswer = Array.isArray(fallback?.howToAnswer) ? fallback.howToAnswer.slice(0) : [];
    if (!result.metrics.length) result.metrics = Array.isArray(fallback?.metrics) ? fallback.metrics.slice(0) : [];

    return result;
  }

  function parseIntroHelpMarkdown(markdownText) {
    const result = {
      title: 'What this site does',
      blocks: []
    };
    if (!markdownText) return result;

    const lines = String(markdownText).split(/\r?\n/);
    let paragraphBuffer = [];
    let listBuffer = null;

    const flushList = () => {
      if (!listBuffer || !listBuffer.items.length) {
        listBuffer = null;
        return;
      }
      result.blocks.push({
        type: listBuffer.type,
        items: listBuffer.items.slice(0)
      });
      listBuffer = null;
    };

    const flushParagraph = () => {
      if (!paragraphBuffer.length) return;
      result.blocks.push({ type: 'paragraph', text: paragraphBuffer.join(' ') });
      paragraphBuffer = [];
    };

    const flushAll = () => {
      flushParagraph();
      flushList();
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        flushAll();
        continue;
      }

      if (line.startsWith('# ')) {
        flushAll();
        result.title = line.replace(/^#\s+/, '').trim() || result.title;
        continue;
      }

      if (line.startsWith('## ') || line.startsWith('### ')) {
        flushAll();
        const headingText = line.replace(/^#{2,3}\s+/, '').trim();
        if (headingText) {
          result.blocks.push({ type: 'heading', text: headingText });
        }
        continue;
      }

      const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
      if (unorderedMatch) {
        flushParagraph();
        if (!listBuffer || listBuffer.type !== 'ul') {
          flushList();
          listBuffer = { type: 'ul', items: [] };
        }
        const item = unorderedMatch[1].trim();
        if (item) listBuffer.items.push(item);
        continue;
      }

      const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
      if (orderedMatch) {
        flushParagraph();
        if (!listBuffer || listBuffer.type !== 'ol') {
          flushList();
          listBuffer = { type: 'ol', items: [] };
        }
        const item = orderedMatch[1].trim();
        if (item) listBuffer.items.push(item);
        continue;
      }

      if (line.startsWith('> ')) {
        flushAll();
        const quoteText = line.replace(/^>\s+/, '').trim();
        if (quoteText) {
          result.blocks.push({ type: 'quote', text: quoteText });
        }
        continue;
      }

      flushList();
      paragraphBuffer.push(line);
    }

    flushAll();
    return result;
  }

  const MODULE_HELP_MARKDOWN = {
    base: baseHelpMd,
    ipip: ipipHelpMd,
    aesthetics: aestheticsHelpMd,
    music: musicHelpMd,
    delivery: deliveryHelpMd,
    delivery2: delivery2HelpMd,
    skills: skillsHelpMd,
    communication: communicationHelpMd,
    state: stateHelpMd
  };

  const MODULE_HELP = Object.fromEntries(
    Object.entries(MODULE_HELP_MARKDOWN).map(([key, markdown]) => [
      key,
      parseModuleHelpMarkdown(markdown, HELP_FALLBACKS[key])
    ])
  );

  const COMPLETE_IMAGES = [
    '/images/ziggy-complete1.png',
    '/images/ziggy-complete2.png',
    '/images/ziggy-complete3.png'
  ];

  function chooseRandomCompleteImage() {
    try {
      const idx = Math.floor(Math.random() * COMPLETE_IMAGES.length);
      return COMPLETE_IMAGES[idx];
    } catch (e) {
      return COMPLETE_IMAGES[0];
    }
  }

  // Local metric name maps used by browser fallback to ensure Long Form uses full words.
  const LOCAL_METRIC_MAPS = {
    AES: { MIN: 'minimalism', CLR: 'colorfulness', WRM: 'warmth', MOT: 'motion', IMG: 'imagery', TYP: 'typography', LAY: 'layout' },
    MUS: { MEL: 'mellow', SOP: 'sophisticated', UNP: 'unpretentious', INT: 'intense', CON: 'contemporary' },
    COMM: { DRV: 'driver', ANC: 'analytical', EXP: 'expressive', AMB: 'amiable' },
    DELIVERY: { DEF: 'deference', PEER: 'peer', CHL: 'challenge', DNS: 'density', AUD: 'audience', STR: 'structure', ABS: 'abstraction', FMT: 'format', VBS: 'verbosity', EMP: 'empathy', CND: 'candor', HMR: 'humor', AUT: 'autonomy', BUR: 'burden' },
    DELIVERY2: { STR: 'structure', DNS: 'density', FRM: 'framing', FMT: 'format', EMP: 'empathy', AUT: 'autonomy' }
  };

  const INTRO_HELP = parseIntroHelpMarkdown(introHelpMd);

  let resumeData = null;
  let active = 'base';
  let completedModules = { base: false, ipip: false, aesthetics: false, music: false, delivery: false, delivery2: false, skills: false, communication: false, state: false };
  let moduleResults = { ipip: null, aesthetics: null, music: null, delivery: null, delivery2: null, skills: null, communication: null, state: null };
  let moduleNotes = { ipip: '', aesthetics: '', music: '', delivery: '', delivery2: '', skills: '', communication: '', state: '' };
  let partialProfile = null;
  let partialModule = null;
  let storedProfile = null;
  let moduleActionDialog = null;
  let showHelp = false;
  let showModuleHelp = false;
  let moduleHelpKey = 'base';
  let showIamPopup = false;
  let modulesOpen = false;
  let currentIamCode = '';
  let generatedIamProfile = null;
  let modulesToggleEl;
  let modulesPopoverStyle = '';
  let modulesPopoverEl;
  let modulesPopoverOriginalParent = null;
  let modulesPopoverOriginalNextSibling = null;
  let headerMenuToggleEl;
  let heroToolbarActionsEl;
  let heroToolbarActionsOriginalParent = null;
  let heroToolbarActionsOriginalNextSibling = null;
  let heroToolbarActionsStyle = '';
  let headerMenuOpen = false;
  let iamCopyStatus = '';
  let importInput;
  let importMessage = '';
  let importError = '';
  let completionPopup = null;
  let showMainResetDialog = false;
  let surveyResetKey = 0;
  let currentModuleDisabled = false;
  let showModuleActionButtons = false;
  let touchedModules = { base: false, ipip: false, aesthetics: false, music: false, delivery: false, delivery2: false, skills: false, communication: false, state: false };
  let moduleProgress = {
    base: { answered: 0, expected: 1 },
    ipip: { answered: 0, expected: 50 },
    aesthetics: { answered: 0, expected: 32 },
    music: { answered: 0, expected: 20 },
    delivery: { answered: 0, expected: 30 },
    delivery2: { answered: 0, expected: 24 },
    skills: { answered: 0, expected: 35 },
    communication: { answered: 0, expected: 20 },
    state: { answered: 0, expected: 0 }
  };
  let moduleProgressLabels = { base: '0/1', ipip: '0/50', aesthetics: '0/32', music: '0/20', delivery: '0/30', delivery2: '0/24', skills: '0/35', communication: '0/20', state: '0/1' };
  let runtimeState = canonicalizeState(DEFAULT_STATE);
  let baseContext = {};
  let baseContextKey = 0; // Used to force remount of BaseContextPicker

  function isModuleComplete(moduleKey, moduleData) {
    return sessionService.isModuleCompleted(moduleKey, moduleData || {});
  }

  function hasBaseContextData(ctx) {
    if (!ctx || typeof ctx !== 'object') return false;
    const keys = ['name', 'birth_month', 'birth_day', 'birth_year', 'gender', 'job_title', 'company', 'years_experience', 'education_level', 'timezone', 'locale', 'short_bio'];
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
      delivery: isModuleComplete('delivery', modules.delivery),
      delivery2: isModuleComplete('delivery2', modules.delivery2),
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
      delivery: {
        answered: sessionService.countAnsweredResponses(modules.delivery?.responses),
        expected: modules.delivery?.expectedLength || 30
      },
      delivery2: {
        answered: sessionService.countAnsweredResponses(modules.delivery2?.responses),
        expected: modules.delivery2?.expectedLength || 24
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
      delivery: touchedModules.delivery || sessionService.countAnsweredResponses(modules.delivery?.responses) > 0 || (modules.delivery?.current || 0) > 0,
      delivery2: touchedModules.delivery2 || sessionService.countAnsweredResponses(modules.delivery2?.responses) > 0 || (modules.delivery2?.current || 0) > 0,
      skills: touchedModules.skills || sessionService.countAnsweredResponses(modules.skills?.responses) > 0 || (modules.skills?.current || 0) > 0,
      communication: touchedModules.communication || sessionService.countAnsweredResponses(modules.communication?.responses) > 0 || (modules.communication?.current || 0) > 0,
      state: true
    };
    // load module notes from resume or stored profile
    try {
      const storedModules = resumeData?.modules || (storedProfile?.profile && storedProfile.profile.modules) || {};
      for (const key of Object.keys(moduleNotes)) {
        moduleNotes[key] = (resumeData?.modules?.[key]?.note) || (storedModules?.[key]?.note) || (moduleResults[key]?.note) || '';
      }
    } catch (e) {}
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
  $: iamInstructionSections = getIamInstructionSections(currentIamCode, generatedIamProfile || exportProfile);
  $: iamPopupText = buildIamPopupText(currentIamCode, iamInstructionSections, (generatedIamProfile || exportProfile)?.profile?.base || baseContext);
  $: canGenerateIam = completedCount > 0;
  $: canSaveProfile = completedCount > 0 || !!exportProfile;
  $: moduleProgressLabels = Object.fromEntries(moduleOrder.map((mod) => {
    if (mod.key === 'state') return [mod.key, 'Baseline'];
    const progress = moduleProgress[mod.key] || { answered: 0, expected: mod.expectedLength || 0 };
    const answered = progress.answered || 0;
    const expected = progress.expected || mod.expectedLength || 0;
    return [mod.key, `${answered}/${expected}`];
  }));
  $: activeStatusLabel = active === 'state' ? 'Baseline' : (completedModules[active] ? 'Completed' : 'Active');
  $: activeModuleHelp = MODULE_HELP[active] || MODULE_HELP.base;
  $: selectedModuleHelp = MODULE_HELP[moduleHelpKey] || MODULE_HELP.base;
  $: currentModuleDisabled = isModuleDisabled(active);
  $: showModuleActionButtons = !['base', 'state'].includes(active);

  function setActiveModule(nextModule) {
    if (!nextModule || nextModule === active) return;
    touchedModules = { ...touchedModules, [active]: true };
    active = nextModule;
    // if the modules dropdown is open, close it after selecting an item
    if (modulesOpen) {
      modulesOpen = false;
      // restore popover into original parent if portaled
      if (modulesPopoverEl && modulesPopoverOriginalParent) {
        if (modulesPopoverOriginalNextSibling && modulesPopoverOriginalNextSibling.parentNode === modulesPopoverOriginalParent) {
          modulesPopoverOriginalParent.insertBefore(modulesPopoverEl, modulesPopoverOriginalNextSibling);
        } else {
          modulesPopoverOriginalParent.appendChild(modulesPopoverEl);
        }
        modulesPopoverOriginalParent = null;
        modulesPopoverOriginalNextSibling = null;
      }
      window.removeEventListener('click', outsideClickListener);
      window.removeEventListener('resize', computePopoverPosition);
    }
  }

  function openModuleHelp(moduleKey, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    moduleHelpKey = moduleKey || active || 'base';
    showModuleHelp = true;
  }

  function hasStarted(moduleKey) {
    const moduleData = resumeData?.modules?.[moduleKey];
    const answered = sessionService.countAnsweredResponses(moduleData?.responses);
    const savedCursor = typeof moduleData?.current === 'number' ? moduleData.current : 0;
    return answered > 0 || savedCursor > 0 || touchedModules[moduleKey];
  }

  function isModuleDisabled(moduleKey) {
    const resumeModule = resumeData?.modules?.[moduleKey];
    if (resumeModule && Object.prototype.hasOwnProperty.call(resumeModule, 'disabled')) {
      return resumeModule.disabled === true;
    }
    const storedModule = storedProfile?.profile?.modules?.[moduleKey];
    if (storedModule && Object.prototype.hasOwnProperty.call(storedModule, 'disabled')) {
      return storedModule.disabled === true;
    }
    return false;
  }

  function isFoundationalModule(moduleKey) {
    return moduleKey === 'state' || moduleKey === 'base';
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

    throw new Error('Could not find a context payload. Upload a valid context JSON file.');
  }

  function buildExportBaseName(profile) {
    const name = profile?.profile?.base?.name;
    if (!name || typeof name !== 'string') return 'profile.context';
    const parts = name
      .trim()
      .split(/\s+/)
      .map((segment) => segment.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(Boolean);
    if (!parts.length) return 'profile.context';
    if (parts.length === 1) return parts[0];
    return `${parts[0]}.${parts[parts.length - 1]}`;
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
      const storageJson = toIamDataStorageJson(profileToDownload);
      const jsonBlob = new Blob([storageJson], { type: 'application/json;charset=utf-8' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `${buildExportBaseName(profileToDownload)}.iam.json`;
      jsonLink.click();
      URL.revokeObjectURL(jsonUrl);
    } catch (e) {
      console.error('Save failed', e);
    }
  }

  function downloadPartial() {
    try {
      if (!partialProfile) return;
      const storageJson = toIamDataStorageJson(partialProfile);
      const jsonBlob = new Blob([storageJson], { type: 'application/json;charset=utf-8' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `${buildExportBaseName(partialProfile)}.partial.${partialModule}.iam.json`;
      jsonLink.click();
      URL.revokeObjectURL(jsonUrl);
    } catch (e) {
      console.error('Save failed', e);
    }
  }

  function getIamInstructionSections(iamCode, profileFile) {
    const code = String(iamCode || '');
    const hasToken = (pattern) => pattern.test(code);
    const disabled = (moduleKey) => profileFile?.profile?.modules?.[moduleKey]?.disabled === true;
    return {
      personality: !disabled('ipip') && (Boolean(completedModules.ipip) || hasToken(/(?:^|\/)PERSONALITY:/i) || hasToken(/(?:^|\/)O\d+C\d+E\d+A\d+N\d+(?:\/|$)/)),
      aesthetics: !disabled('aesthetics') && (Boolean(completedModules.aesthetics) || hasToken(/(?:^|\/)AESTHETIC(?:\([^)]+\))?:/i) || hasToken(/\/AES:[A-Z0-9]+/)),
      music: !disabled('music') && (Boolean(completedModules.music) || hasToken(/(?:^|\/)MUSIC(?:\([^)]+\))?:/i) || hasToken(/\/MUS:[A-Z0-9]+/)),
      delivery: !disabled('delivery') && (Boolean(completedModules.delivery) || hasToken(/(?:^|\/)DELIVERY(?:\([^)]+\))?:/i) || hasToken(/\/DELIVERY:[A-Z0-9]+/)),
      delivery2: !disabled('delivery2') && (Boolean(completedModules.delivery2) || hasToken(/(?:^|\/)DELIVERY2(?:\([^)]+\))?:/i) || hasToken(/\/DELIVERY2\/[A-Z0-9]+/)),
      communication: !disabled('communication') && (Boolean(completedModules.communication) || hasToken(/(?:^|\/)COMMUNICATION(?:\([^)]+\))?:/i) || hasToken(/\/COMM:DRV\d+ANC\d+EXP\d+AMB\d+/)),
      career: !disabled('skills') && (Boolean(completedModules.skills) || hasToken(/\/(?:SKILL|SKILLS)(?:\([^)]+\))?:/i) || hasToken(/\/(?:CAR|SKL)(?:\([^)]+\))?:\d{8}(?:S\d{4})*/)),
      state: !disabled('state') && (Boolean(completedModules.state) || hasToken(/\/STATE:[^/]+/))
    };
  }

  function buildBaseContextLinesForIam(base) {
    const source = base && typeof base === 'object' ? base : {};
    const lines = [];
    const pushIfPresent = (label, value) => {
      if (value == null) return;
      const text = String(value).trim();
      if (!text) return;
      lines.push(`- ${label}: ${text}`);
    };

    // Exclude fields already encoded in the I-AM string: name, birth_year, gender, locale, timezone.
    pushIfPresent('Birth Month', source.birth_month);
    pushIfPresent('Birth Day', source.birth_day);
    pushIfPresent('Company', source.company);
    pushIfPresent('Years Experience', source.years_experience);
    pushIfPresent('Education Level', source.education_level);
    // Skills, Communication Style, and Favorites are no longer exported from Base module
    pushIfPresent('Short Bio', source.short_bio);

    return lines;
  }

  function buildIamPopupText(iamCode, sections, base) {
    const enabled = sections || {};
    const sectionInstructionBodies = [];
    const quickReference = [];

    if (enabled.personality) {
      sectionInstructionBodies.push('Use OCEAN trait weights to tune reasoning cadence, assertiveness, novelty, and reassurance style.');
      quickReference.push('OCEAN: Big Five trait scores (O=Openness, C=Conscientiousness, E=Extraversion, A=Agreeableness, N=Neuroticism)');
    }
    if (enabled.aesthetics) {
      sectionInstructionBodies.push('Use aesthetic preferences to choose visual examples, formatting density, and presentation style that feel native to the user.');
      quickReference.push('AES: Aesthetic Preferences (MIN=Minimalism, CLR=Colorfulness, WRM=Warmth, MOT=Motion, IMG=Imagery, TYP=Typography, LAY=Layout)');
    }
    if (enabled.music) {
      sectionInstructionBodies.push('Use music preference factors to align tone and creative framing with the user\'s preferred energy and mood profile.');
      quickReference.push('MUS: Music Preferences (MEL=Mellow, SOP=Sophisticated, UNP=Unpretentious, INT=Intense, CON=Contemporary)');
    }
    if (enabled.delivery) {
      sectionInstructionBodies.push('Use DELIVERY as a delivery profile: tune directness (DEF/PEER/CHL), structure and density (DNS/STR/FMT), depth and verbosity (ABS/VBS), and social tone (EMP/CND/HMR).');
      sectionInstructionBodies.push('For high BUR, include governance and risk caveats; for high AUT, prioritize self-serve execution steps and ownership-friendly options.');
      sectionInstructionBodies.push('Treat AUD as a signal to favor spoken-friendly phrasing (short clauses, clear transitions, lower jargon density) when possible.');
      quickReference.push('DELIVERY: Unified interaction preferences (DEF, PEER, CHL, DNS, AUD, STR, ABS, FMT, VBS, EMP, CND, HMR, AUT, BUR)');
    }
    if (enabled.communication) {
      sectionInstructionBodies.push('Use communication traits to calibrate directness, detail level, and relationship tone in every response.');
      quickReference.push('COM: Communication Style (DRV=Driver, ANC=Analytical, EXP=Expressive, AMB=Amiable)');
    }
    if (enabled.career) {
      sectionInstructionBodies.push('Use career and skills context to prioritize recommendations that match validated strengths and role-adjacent options.');
      quickReference.push('CAR: Career/Skills (CAR=O*NET SOC code, Sxx=O*NET Skill index, proficiency)');
    }
    if (enabled.state) {
      sectionInstructionBodies.push('Use STATE as immediate runtime context for urgency, rigor, and decision framing in this session.');
      quickReference.push('STATE: Dynamic state (bandwidth, mode, horizon, stakes)');
    }

    const sectionInstructions = sectionInstructionBodies.map((line, idx) => `${idx + 6}. ${line}`);

    const additionalBaseContextLines = buildBaseContextLinesForIam(base);

    const parts = [
      `I-AM string: ${iamCode || 'I-AM string unavailable'}`,
      '',
      'Instructions for the LLM:',
      '1. Treat the I-AM string above as authoritative structured profile context for the user.',
      '2. Use it to adapt tone, communication style, preferences, and response framing.',
      '3. Do not rewrite, compress, or reinterpret the I-AM string unless explicitly asked to explain it.',
      '4. If additional context conflicts with the I-AM string, prefer the most recent user instruction while retaining it as the baseline profile.',
      '5. Apply the I-AM guidance silently in your responses instead of repeatedly restating the profile.',
      ...sectionInstructions,
      '',
      ...(quickReference.length
        ? ['Quick Reference:', ...quickReference]
        : ['Quick Reference: No completed I-AM sections detected yet.'])
    ];

    if (additionalBaseContextLines.length) {
      parts.push('', 'Additional Base Context:', ...additionalBaseContextLines);
    }

    return parts.join('\n');
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
    const getDisabled = (moduleKey) => {
      const resultModule = moduleResults[moduleKey];
      if (resultModule && typeof resultModule === 'object' && Object.prototype.hasOwnProperty.call(resultModule, 'disabled')) {
        return resultModule.disabled === true;
      }
      const resumeModule = resumeData?.modules?.[moduleKey];
      if (resumeModule && Object.prototype.hasOwnProperty.call(resumeModule, 'disabled')) {
        return resumeModule.disabled === true;
      }
      const storedModule = storedModules?.[moduleKey];
      if (storedModule && Object.prototype.hasOwnProperty.call(storedModule, 'disabled')) {
        return storedModule.disabled === true;
      }
      return false;
    };
    return {
      ipip: Object.assign(
        { responses: resumeData?.modules?.ipip?.responses || moduleResults.ipip?.responses || storedModules?.ipip?.responses || [] },
        getDisabled('ipip') ? { disabled: true } : {},
        (resumeData?.modules?.ipip?.note || storedModules?.ipip?.note || moduleResults.ipip?.note || moduleNotes.ipip)
          ? { note: resumeData?.modules?.ipip?.note || storedModules?.ipip?.note || moduleResults.ipip?.note || moduleNotes.ipip }
          : {}
      ),
      aesthetics: (function(){
        const existing = moduleResults.aesthetics ? { responses: moduleResults.aesthetics.responses, result: moduleResults.aesthetics.result } : (resumeData?.modules?.aesthetics ? { responses: resumeData.modules.aesthetics.responses } : (storedModules?.aesthetics ? { responses: Array.isArray(storedModules.aesthetics.responses) ? storedModules.aesthetics.responses : [], result: storedModules.aesthetics } : null));
        if (!existing) return getDisabled('aesthetics') ? { responses: [], disabled: true } : null;
        return Object.assign(
          existing,
          getDisabled('aesthetics') ? { disabled: true } : {},
          (resumeData?.modules?.aesthetics?.note || storedModules?.aesthetics?.note || moduleResults.aesthetics?.note || moduleNotes.aesthetics)
            ? { note: resumeData?.modules?.aesthetics?.note || storedModules?.aesthetics?.note || moduleResults.aesthetics?.note || moduleNotes.aesthetics }
            : {}
        );
      })(),
      music: (function(){
        const existing = moduleResults.music ? { responses: moduleResults.music.responses, result: moduleResults.music.result } : (resumeData?.modules?.music ? { responses: resumeData.modules.music.responses } : (storedModules?.music ? { responses: Array.isArray(storedModules.music.responses) ? storedModules.music.responses : [], result: storedModules.music } : null));
        if (!existing) return getDisabled('music') ? { responses: [], disabled: true } : null;
        return Object.assign(existing, getDisabled('music') ? { disabled: true } : {}, (resumeData?.modules?.music?.note || storedModules?.music?.note || moduleResults.music?.note || moduleNotes.music) ? { note: resumeData?.modules?.music?.note || storedModules?.music?.note || moduleResults.music?.note || moduleNotes.music } : {});
      })(),
      delivery: (function(){
        const existing = moduleResults.delivery ? { responses: moduleResults.delivery.responses, result: moduleResults.delivery.result } : (resumeData?.modules?.delivery ? { responses: resumeData.modules.delivery.responses } : (storedModules?.delivery ? { responses: Array.isArray(storedModules.delivery.responses) ? storedModules.delivery.responses : [], result: storedModules.delivery } : null));
        if (!existing) return getDisabled('delivery') ? { responses: [], disabled: true } : null;
        return Object.assign(existing, getDisabled('delivery') ? { disabled: true } : {}, (resumeData?.modules?.delivery?.note || storedModules?.delivery?.note || moduleResults.delivery?.note || moduleNotes.delivery) ? { note: resumeData?.modules?.delivery?.note || storedModules?.delivery?.note || moduleResults.delivery?.note || moduleNotes.delivery } : {});
      })(),
      delivery2: (function(){
        const existing = moduleResults.delivery2 ? { responses: moduleResults.delivery2.responses, result: moduleResults.delivery2.result } : (resumeData?.modules?.delivery2 ? { responses: resumeData.modules.delivery2.responses } : (storedModules?.delivery2 ? { responses: Array.isArray(storedModules.delivery2.responses) ? storedModules.delivery2.responses : [], result: storedModules.delivery2 } : null));
        if (!existing) return getDisabled('delivery2') ? { responses: [], disabled: true } : null;
        return Object.assign(existing, getDisabled('delivery2') ? { disabled: true } : {}, (resumeData?.modules?.delivery2?.note || storedModules?.delivery2?.note || moduleResults.delivery2?.note || moduleNotes.delivery2) ? { note: resumeData?.modules?.delivery2?.note || storedModules?.delivery2?.note || moduleResults.delivery2?.note || moduleNotes.delivery2 } : {});
      })(),
      skills: (function(){
        const existing = moduleResults.skills ? { responses: moduleResults.skills.responses, result: moduleResults.skills.result, testAnswers: moduleResults.skills.testAnswers || {} } : (resumeData?.modules?.skills ? { responses: resumeData.modules.skills.responses, testAnswers: resumeData.modules.skills.testAnswers || {} } : (storedModules?.skills ? { responses: Array.isArray(storedModules.skills.responses) ? storedModules.skills.responses : [], result: storedModules.skills, testAnswers: storedModules.skills.testAnswers || {} } : null));
        if (!existing) return getDisabled('skills') ? { responses: [], testAnswers: {}, disabled: true } : null;
        return Object.assign(existing, getDisabled('skills') ? { disabled: true } : {}, (resumeData?.modules?.skills?.note || storedModules?.skills?.note || moduleResults.skills?.note || moduleNotes.skills) ? { note: resumeData?.modules?.skills?.note || storedModules?.skills?.note || moduleResults.skills?.note || moduleNotes.skills } : {});
      })(),
      communication: (function(){
        const existing = moduleResults.communication ? { responses: moduleResults.communication.responses, result: moduleResults.communication.result } : (resumeData?.modules?.communication ? { responses: resumeData.modules.communication.responses } : (storedModules?.communication ? { responses: Array.isArray(storedModules.communication.responses) ? storedModules.communication.responses : [], result: storedModules.communication } : null));
        if (!existing) return getDisabled('communication') ? { responses: [], disabled: true } : null;
        return Object.assign(existing, getDisabled('communication') ? { disabled: true } : {}, (resumeData?.modules?.communication?.note || storedModules?.communication?.note || moduleResults.communication?.note || moduleNotes.communication) ? { note: resumeData?.modules?.communication?.note || storedModules?.communication?.note || moduleResults.communication?.note || moduleNotes.communication } : {});
      })(),
      state: (function(){
        const existing = moduleResults.state ? { responses: moduleResults.state.responses, result: moduleResults.state.result, state: moduleResults.state.state || moduleResults.state.result } : (resumeData?.modules?.state ? { responses: resumeData.modules.state.responses, state: resumeData.modules.state.state || resumeData.modules.state.result } : (storedModules?.state ? { responses: Array.isArray(storedModules.state.responses) ? storedModules.state.responses : [], state: storedModules.state.state || storedModules.state } : { responses: [], state: canonicalizeState(runtimeState || DEFAULT_STATE) }));
        if (!existing) return existing;
        return Object.assign(existing, getDisabled('state') ? { disabled: true } : {}, (resumeData?.modules?.state?.note || storedModules?.state?.note || moduleResults.state?.note || moduleNotes.state) ? { note: resumeData?.modules?.state?.note || storedModules?.state?.note || moduleResults.state?.note || moduleNotes.state } : {});
      })(),
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

  function scoredFromModulePayload(modulePayload) {
    const ipipModule = modulePayload?.ipip && typeof modulePayload.ipip === 'object'
      ? modulePayload.ipip
      : { responses: [] };
    const responses = Array.isArray(ipipModule.responses) ? ipipModule.responses : [];
    if (ipipModule.disabled === true || responses.length !== 50) {
      return { raw: {}, normalized: {} };
    }
    return scoreResponses(responses);
  }

  function buildFallbackExportProfile() {
    if (completedCount <= 0) return null;
    try {
      const modulePayload = buildModuleResponses();
      const scored = scoredFromModulePayload(modulePayload);
      return toContextFile(scored, modulePayload);
    } catch (err) {
      console.error('Failed to build fallback export profile', err);
      return null;
    }
  }

  // Helpers to build BASE prefix parts locally (avoid importing buildPrefixSegment here)
  function titleCase(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    return text
      .split(/\s+/)
      .map((part) => part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : '')
      .join(' ');
  }

  function getFirstnameFromBase(base) {
    const explicit = String(base?.first_name || base?.firstname || '').trim();
    if (explicit) return explicit;
    const name = String(base?.name || '').trim();
    if (!name) return '';
    return name.split(/\s+/)[0] || '';
  }

  function getTimezoneAbbreviationForBase(timezone) {
    const text = String(timezone || '').trim();
    if (!text) return '';
    if (/^[A-Z]{2,5}$/.test(text)) return text;

    const map = {
      UTC: 'UTC',
      'Etc/UTC': 'UTC',
      'Etc/GMT': 'GMT',
      'America/New_York': 'EST',
      'America/Chicago': 'CST',
      'America/Denver': 'MST',
      'America/Los_Angeles': 'PST',
      'Europe/London': 'GMT',
      'Europe/Paris': 'CET',
      'Asia/Tokyo': 'JST',
      'Australia/Sydney': 'AEST'
    };

    return map[text] || text;
  }

  function buildBasePartsFromBase(base) {
    const b = base && typeof base === 'object' ? base : {};
    const parts = [];
    const firstName = getFirstnameFromBase(b);
    if (firstName) parts.push(firstName);
    if (Number.isInteger(Number(b.birth_year))) parts.push(String(Math.round(Number(b.birth_year))));
    if (b.gender) parts.push(titleCase(b.gender));
    if (b.locale) parts.push(String(b.locale));
    if (b.timezone) parts.push(getTimezoneAbbreviationForBase(b.timezone));
    return parts;
  }

  function deriveCurrentIamCode(profileFile) {
    // If no explicit profileFile provided, fall back to building one from current UI state
    if (!profileFile?.profile) {
      const fb = buildFallbackExportProfile();
      if (fb && fb.profile) profileFile = fb;
      else return '';
    }
    const profile = profileFile.profile;
    const ipipDisabled = profile?.modules?.ipip?.disabled === true;
    const ipipResponses = Array.isArray(profile?.modules?.ipip?.responses)
      ? profile.modules.ipip.responses
      : [];
    const scored = profile.scores && typeof profile.scores === 'object'
      ? {
          normalized: {
            O: ipipDisabled ? 0 : Number(profile.scores.openness ?? 0),
            C: ipipDisabled ? 0 : Number(profile.scores.conscientiousness ?? 0),
            E: ipipDisabled ? 0 : Number(profile.scores.extraversion ?? 0),
            A: ipipDisabled ? 0 : Number(profile.scores.agreeableness ?? 0),
            N: ipipDisabled ? 0 : Number(profile.scores.neuroticism ?? 0)
          }
        }
      : (!ipipDisabled && ipipResponses.length === 50)
        ? scoreResponses(ipipResponses)
        : { normalized: {} };
    const modules = {
      ...(profile.modules && typeof profile.modules === 'object' ? profile.modules : {}),
      base: profile.base && typeof profile.base === 'object' ? profile.base : undefined,
      state: profile?.modules?.state,
      // Preserve the skills module object so notes/metadata remain available to builders
      skills: profile?.modules?.skills
    };
    for (const moduleKey of ['ipip', 'aesthetics', 'music', 'delivery', 'delivery2', 'communication', 'state', 'skills']) {
      if (modules[moduleKey] && typeof modules[moduleKey] === 'object' && !Array.isArray(modules[moduleKey]) && modules[moduleKey].disabled === true) {
        delete modules[moduleKey];
      }
    }

    try {
      const derived = buildIam(scored, modules, { format: 'long_form', lfVersion: 'LF.0.2' });
      if (derived && derived.code) return derived.code;
    } catch (err) {
      // Fall through to local fallback below
    }

    // If calling the shared `buildIam` failed (e.g. mapping loader not available in browser),
    // build a simple long-form string here that doesn't rely on external mapping files.
    try {
      return buildSimpleLongForm(scored, modules);
    } catch (err) {
      return '';
    }
  }

  // Local simplified long-form generator — uses metric keys directly and avoids mapping loader.
  function buildSimpleLongForm(scored, modules) {
    function localNamed(fullName, moduleObj) {
      const note = moduleObj && (moduleObj.note || (moduleObj.result && moduleObj.result.note));
      if (!note) return fullName;
      const s = String(note).trim().replace(/[/:]+/g, '-').replace(/[()]/g, '').replace(/\s+/g, ' ').slice(0, 60);
      return s ? `${fullName}(${s})` : fullName;
    }
    const segItems = [];
    const buildStatePairs = (stateObj) => {
      if (!stateObj || typeof stateObj !== 'object') return [];
      const pairs = [];

      const bandwidth = Number(stateObj.bandwidth);
      if (Number.isFinite(bandwidth)) {
        pairs.push(`bandwidth${Math.round(bandwidth)}`);
      }

      const mode = String(stateObj.mode || '').toLowerCase();
      if (mode === 'convergent' || mode === 'divergent') {
        pairs.push(`mode:${titleCase(mode)}`);
      }

      const horizon = String(stateObj.horizon || '').toLowerCase();
      if (horizon === 'now' || horizon === 'long') {
        pairs.push(`horizon:${titleCase(horizon)}`);
      }

      const stakes = String(stateObj.stakes || '').toLowerCase();
      if (stakes === 'critical' || stakes === 'casual') {
        pairs.push(`stakes:${titleCase(stakes)}`);
      }

      const domain = String(stateObj.domain || '').toLowerCase();
      if (domain === 'work' || domain === 'home') {
        pairs.push(`domain:${titleCase(domain)}`);
      }

      return pairs;
    };

    const pushSegment = (fullName, metricsObj) => {
      if (!metricsObj || typeof metricsObj !== 'object') return;
      const pairs = [];
      const metricMap = LOCAL_METRIC_MAPS[String(fullName).toUpperCase()] || null;
      for (const [k, v] of Object.entries(metricsObj)) {
        if (v == null) continue;
        const num = Math.round(Number(v) || 0);
        const lookup = metricMap && (metricMap[String(k).toUpperCase()] || metricMap[String(k).toLowerCase()]);
        const metricName = lookup || String(k).toLowerCase();
        pairs.push(`${metricName}${num}`);
      }
      if (pairs.length) {
        const agg = computeLocalAggregate(metricsObj);
        segItems.push({ fullName, pairs, score: agg });
      }
    };

    // Personality
    const s = (scored && scored.normalized) ? scored.normalized : {};
    if (s && Object.keys(s).length) {
      const map = { O: 'openness', C: 'conscientiousness', E: 'extraversion', A: 'agreeableness', N: 'neuroticism' };
      const pPairs = [];
      for (const key of ['O', 'C', 'E', 'A', 'N']) {
        const val = Math.round(Number(s[key] ?? s[key.toLowerCase()] ?? 0) || 0);
        pPairs.push(`${map[key]}${val}`);
      }
      const agg = Math.round((Number(s.O || 0) + Number(s.C || 0) + Number(s.E || 0) + Number(s.A || 0) + Number(s.N || 0)) / 5 || 0);
      segItems.push({ fullName: 'PERSONALITY', pairs: pPairs, score: agg });
    }

    if (modules && modules.aesthetics && modules.aesthetics.normalized) pushSegment(localNamed('AESTHETIC', modules.aesthetics), modules.aesthetics.normalized);
    if (modules && modules.music && modules.music.normalized) pushSegment(localNamed('MUSIC', modules.music), modules.music.normalized);
    if (modules && modules.communication && (modules.communication.normalized || modules.communication.normalized_trait_scores)) {
      const cn = modules.communication.normalized_trait_scores || modules.communication.normalized;
      pushSegment(localNamed('COMMUNICATION', modules.communication), cn);
    }
    if (modules && modules.delivery && modules.delivery.normalized) pushSegment(localNamed('DELIVERY', modules.delivery), modules.delivery.normalized);
    if (modules && modules.delivery2) {
      const d2 = modules.delivery2.normalized || modules.delivery2.normalized_trait_scores || (modules.delivery2.result && modules.delivery2.result.normalized) || modules.delivery2;
      if (d2 && typeof d2 === 'object' && Object.keys(d2).length) pushSegment(localNamed('DELIVERY2', modules.delivery2), d2);
    }
    if (modules && modules.state && typeof modules.state === 'object' && Object.keys(modules.state).length) {
      const statePairs = buildStatePairs(modules.state);
      if (statePairs.length) {
        const stateBandwidth = Number(modules.state.bandwidth);
        const stateScore = Number.isFinite(stateBandwidth) ? Math.round(stateBandwidth) : 0;
        segItems.push({ fullName: localNamed('STATE', modules.state), pairs: statePairs, score: stateScore });
      }
    }

    segItems.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return String(a.fullName || '').toUpperCase().localeCompare(String(b.fullName || '').toUpperCase());
    });

    const segmentsText = segItems.map((s) => `${s.fullName}:${s.pairs.join(',')}`).join('/');
    if (!segmentsText) return '';
    // Build BASE from modules.base using local helper
    const prefix = 'IAM-v0.2';
    const baseParts = buildBasePartsFromBase(modules && modules.base ? modules.base : {});
    let code = prefix;
    if (baseParts.length) {
      code += `/BASE:${baseParts.join(',')}`;
    }
    code += `/${segmentsText}`;
    return code;
  }

  function computeLocalAggregate(obj) {
    if (!obj || typeof obj !== 'object') return 0;
    const vals = Object.values(obj).filter((v) => typeof v === 'number' && Number.isFinite(v));
    if (!vals.length) return 0;
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round(sum / vals.length);
  }

  function normalizeIamCodeForPopup(iamCode, profileFile) {
    const code = String(iamCode || '');
    if (!code) return '';

    const ipipModule = profileFile?.profile?.modules?.ipip;
    const scored = profileFile?.profile?.scores || {};
    const hasNonZeroTrait = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
      .some((key) => Number(scored[key]) > 0);
    const ipipComplete = isModuleComplete('ipip', ipipModule);
    const hasPersonality = ipipComplete || hasNonZeroTrait;

    if (hasPersonality) return code;

    return code
      .replace(/:O0C0E0A0N0(?=\/|$)/, '')
      .replace(/\/O0C0E0A0N0(?=\/|$)/, '');
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
        const moduleMeta = moduleOrder.find((mod) => mod.key === moduleName);
        const expectedLength = moduleMeta?.expectedLength || moduleValue.responses.length;
        sessionService.saveProgress(moduleName, {
          responses: moduleValue.responses,
          current: moduleValue.responses.length,
          expectedLength,
          disabled: moduleValue.disabled === true,
          note: typeof moduleValue.note === 'string' ? moduleValue.note : undefined,
          completed: isModuleComplete(moduleName, moduleValue)
        });
      };

      persistModule('ipip', modules.ipip);
      persistModule('aesthetics', modules.aesthetics);
      persistModule('music', modules.music);
      persistModule('delivery', modules.delivery);
      persistModule('delivery2', modules.delivery2);
      persistModule('skills', modules.skills);
      persistModule('communication', modules.communication);
      if (modules.state && typeof modules.state === 'object') {
        runtimeState = canonicalizeState(modules.state.state || modules.state.result || modules.state);
        sessionService.saveProgress('state', {
          responses: [],
          current: 0,
          expectedLength: 0,
          disabled: modules.state.disabled === true,
          completed: false,
          note: typeof modules.state.note === 'string' ? modules.state.note : undefined,
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
    // Progress handlers can mark a module complete before the completion event fires,
    // so use prior completion-result presence to decide whether this is a new completion.
    const wasAlreadyComplete = Boolean(
      moduleResults[module]
      || (resumeData && resumeData.modules && resumeData.modules[module] && resumeData.modules[module].completed === true)
      || (completedModules && completedModules[module] === true)
    );

    try {
      sessionService.saveProgress(module, {
        responses,
        testAnswers: module === 'skills' ? (testAnswers || {}) : undefined,
        disabled: resumeData?.modules?.[module]?.disabled === true,
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
        disabled: resumeData?.modules?.[module]?.disabled === true,
        ...(module === 'skills' ? { testAnswers: testAnswers || {} } : {})
      }
    };
    if (!wasAlreadyComplete) {
      try {
        const modulePayload = buildModuleResponses();
        partialProfile = toContextFile(scoredFromModulePayload(modulePayload), modulePayload);
        partialModule = module;
        const moduleLabel = moduleMeta?.label || module;
        completionPopup = {
          title: `${moduleLabel} completed`,
          message: 'Context file updated and ready to save as JSON.',
          image: chooseRandomCompleteImage()
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
      else if (module === 'music') setActiveModule('delivery');
      else if (module === 'delivery') setActiveModule('delivery2');
      else if (module === 'delivery2') setActiveModule('skills');
      else if (module === 'skills') setActiveModule('communication');
      else if (module === 'communication') {
        setActiveModule('state');
        try {
          const modulePayload = buildModuleResponses();
          const ctx = toContextFile(scoredFromModulePayload(modulePayload), modulePayload);
          try {
            localStorage.setItem('iam_profile', JSON.stringify(ctx));
            refreshStoredProfile();
          } catch (err) {
            console.error('Failed to persist final profile', err);
          }
        } catch (err) {
          console.error('Failed to prepare final context', err);
        }
      }
    }
  }

  function handleModuleProgress(payloadOrEvent) {
    const detail = payloadOrEvent?.detail || payloadOrEvent || {};
    const { module, responses, current, expectedLength, testAnswers, state } = detail;
    if (!module || !Array.isArray(responses)) return;
    const wasAlreadyComplete = Boolean(completedModules && completedModules[module] === true);
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
            disabled: resumeData?.modules?.[module]?.disabled === true,
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
        disabled: resumeData?.modules?.[module]?.disabled === true,
        current,
        expectedLength: isStateModule ? 0 : expectedLength
      });

      // If this progress update caused the module to become complete (and it wasn't before),
      // show the completion popup so modules that don't dispatch a `complete` event still show it.
      if (!wasAlreadyComplete && !isStateModule && (answered >= resolvedExpected)) {
        try {
          const moduleMeta = moduleOrder.find((mod) => mod.key === module);
          const moduleLabel = moduleMeta?.label || module;
          const modulePayload = buildModuleResponses();
          partialProfile = toContextFile(scoredFromModulePayload(modulePayload), modulePayload);
          partialModule = module;
          completionPopup = {
            title: `${moduleLabel} completed`,
            message: 'Context file updated and ready to save as JSON.',
            image: chooseRandomCompleteImage()
          };
          try {
            localStorage.setItem('iam_profile', JSON.stringify(partialProfile));
            refreshStoredProfile();
          } catch (err) {
            console.error('Failed to persist partial profile', err);
          }
        } catch (err) {
          console.error('Failed to prepare partial context on progress completion', err);
        }
      }

      if (module === 'state') {
        const modulePayload = buildModuleResponses();
        const latest = toContextFile(scoredFromModulePayload(modulePayload), modulePayload);
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
      } else if (resumeData?.modules?.delivery && !isModuleComplete('delivery', resumeData.modules.delivery)) {
        setActiveModule('delivery');
      } else if (resumeData?.modules?.delivery2 && !isModuleComplete('delivery2', resumeData.modules.delivery2)) {
        setActiveModule('delivery2');
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
      } else if (resumeData?.modules?.delivery) {
        setActiveModule('delivery');
      } else if (resumeData?.modules?.delivery2) {
        setActiveModule('delivery2');
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
    completedModules = { base: false, ipip: false, aesthetics: false, music: false, delivery: false, delivery2: false, skills: false, communication: false, state: false };
    moduleResults = { ipip: null, aesthetics: null, music: null, delivery: null, delivery2: null, skills: null, communication: null, state: null };
    partialProfile = null;
    partialModule = null;
    storedProfile = null;
    importMessage = '';
    importError = '';
    completionPopup = null;
    active = 'base';
    touchedModules = { base: false, ipip: false, aesthetics: false, music: false, delivery: false, delivery2: false, skills: false, communication: false, state: false };
    moduleProgress = {
      base: { answered: 0, expected: 1 },
      ipip: { answered: 0, expected: 50 },
      aesthetics: { answered: 0, expected: 32 },
      music: { answered: 0, expected: 20 },
      delivery: { answered: 0, expected: 30 },
      delivery2: { answered: 0, expected: 24 },
      skills: { answered: 0, expected: 35 },
      communication: { answered: 0, expected: 20 },
      state: { answered: 0, expected: 0 }
    };
    runtimeState = canonicalizeState(DEFAULT_STATE);
    baseContext = {};
    surveyResetKey += 1;
  }

  function persistCurrentProfile() {
    try {
      const modulePayload = buildModuleResponses();
      const scored = scoredFromModulePayload(modulePayload);
      const latest = toContextFile(scored, modulePayload);
      partialProfile = latest;
      localStorage.setItem('iam_profile', JSON.stringify(latest));
      refreshStoredProfile();
    } catch (err) {
      console.error('Failed to persist current profile', err);
    }
  }

  function openModuleResetDialog() {
    if (!showModuleActionButtons) return;
    moduleActionDialog = {
      title: `Reset ${activeMeta.label}?`,
      message: 'This clears only the saved answers for the current module. Other modules stay unchanged.'
    };
  }

  function resetCurrentModule() {
    if (!showModuleActionButtons) return;
    const existing = resumeData?.modules?.[active] || {};
    const nextModule = {
      ...existing,
      responses: [],
      current: 0,
      answered: 0,
      completed: false,
      ...(active === 'skills' ? { testAnswers: {} } : {})
    };

    resumeData = {
      ...(resumeData || {}),
      modules: {
        ...((resumeData && resumeData.modules) ? resumeData.modules : {}),
        [active]: nextModule
      }
    };
    completedModules = { ...completedModules, [active]: false };
    moduleResults = { ...moduleResults, [active]: null };
    touchedModules = { ...touchedModules, [active]: false };
    moduleProgress = {
      ...moduleProgress,
      [active]: {
        answered: 0,
        expected: moduleOrder.find((mod) => mod.key === active)?.expectedLength || moduleProgress[active]?.expected || 0
      }
    };
    sessionService.clearModuleProgress(active);
    surveyResetKey += 1;
    moduleActionDialog = null;
    persistCurrentProfile();
  }

  function toggleCurrentModuleDisabled(event) {
    if (!showModuleActionButtons) return;
    const existing = resumeData?.modules?.[active] || {};
    const currentDisabled = Object.prototype.hasOwnProperty.call(existing, 'disabled')
      ? existing.disabled === true
      : isModuleDisabled(active);
    const nextDisabled = typeof event?.currentTarget?.checked === 'boolean'
      ? event.currentTarget.checked
      : !currentDisabled;
    resumeData = {
      ...(resumeData || {}),
      modules: {
        ...((resumeData && resumeData.modules) ? resumeData.modules : {}),
        [active]: {
          ...existing,
          responses: Array.isArray(existing.responses) ? existing.responses.slice(0) : [],
          disabled: nextDisabled
        }
      }
    };
    if (moduleResults[active] && typeof moduleResults[active] === 'object') {
      moduleResults = {
        ...moduleResults,
        [active]: {
          ...moduleResults[active],
          disabled: nextDisabled
        }
      };
    }
    sessionService.saveProgress(active, {
      responses: Array.isArray(existing.responses) ? existing.responses : [],
      testAnswers: active === 'skills' ? (existing.testAnswers || {}) : undefined,
      state: active === 'state' ? existing.state : undefined,
      current: existing.current || 0,
      expectedLength: existing.expectedLength || moduleOrder.find((mod) => mod.key === active)?.expectedLength || 0,
      completed: existing.completed === true,
      disabled: nextDisabled
    });
    persistCurrentProfile();
  }

  $: activeIsFoundational = isFoundationalModule(active);

  function toggleHeaderMenu() {
    headerMenuOpen = !headerMenuOpen;
    if (headerMenuOpen) {
      computeHeaderMenuPosition();
      if (heroToolbarActionsEl && heroToolbarActionsEl.parentNode !== document.body) {
        heroToolbarActionsOriginalParent = heroToolbarActionsEl.parentNode;
        heroToolbarActionsOriginalNextSibling = heroToolbarActionsEl.nextSibling;
        document.body.appendChild(heroToolbarActionsEl);
      }
      setTimeout(() => {
        window.addEventListener('click', outsideHeaderClickListener);
        window.addEventListener('resize', computeHeaderMenuPosition);
      }, 0);
    } else {
      if (heroToolbarActionsEl && heroToolbarActionsOriginalParent) {
        if (heroToolbarActionsOriginalNextSibling && heroToolbarActionsOriginalNextSibling.parentNode === heroToolbarActionsOriginalParent) {
          heroToolbarActionsOriginalParent.insertBefore(heroToolbarActionsEl, heroToolbarActionsOriginalNextSibling);
        } else {
          heroToolbarActionsOriginalParent.appendChild(heroToolbarActionsEl);
        }
        heroToolbarActionsOriginalParent = null;
        heroToolbarActionsOriginalNextSibling = null;
      }
      window.removeEventListener('click', outsideHeaderClickListener);
      window.removeEventListener('resize', computeHeaderMenuPosition);
      heroToolbarActionsStyle = '';
    }
  }

  function closeHeaderMenu() {
    if (!headerMenuOpen) return;
    headerMenuOpen = false;
    if (heroToolbarActionsEl && heroToolbarActionsOriginalParent) {
      if (heroToolbarActionsOriginalNextSibling && heroToolbarActionsOriginalNextSibling.parentNode === heroToolbarActionsOriginalParent) {
        heroToolbarActionsOriginalParent.insertBefore(heroToolbarActionsEl, heroToolbarActionsOriginalNextSibling);
      } else {
        heroToolbarActionsOriginalParent.appendChild(heroToolbarActionsEl);
      }
      heroToolbarActionsOriginalParent = null;
      heroToolbarActionsOriginalNextSibling = null;
    }
    window.removeEventListener('click', outsideHeaderClickListener);
    window.removeEventListener('resize', computeHeaderMenuPosition);
    heroToolbarActionsStyle = '';
  }

  function computeHeaderMenuPosition() {
    if (!headerMenuToggleEl) return;
    const rect = headerMenuToggleEl.getBoundingClientRect ? headerMenuToggleEl.getBoundingClientRect() : { top: 0, left: 0, height: 0, width: 0 };
    const top = rect.bottom + 8;
    const left = rect.right;
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const popWidth = 180;
    const maxLeft = Math.max(8, vw - popWidth - 8);
    const resolvedLeft = Math.min(Math.max(8, left - popWidth), maxLeft);
    heroToolbarActionsStyle = `position: fixed; top: ${Math.round(top)}px; left: ${Math.round(resolvedLeft)}px; z-index: 12040;`;
  }

  function outsideHeaderClickListener(e) {
    const path = e.composedPath ? e.composedPath() : (e.path || []);
    if (heroToolbarActionsEl && (path.indexOf(heroToolbarActionsEl) === -1 && path.indexOf(headerMenuToggleEl) === -1)) {
      closeHeaderMenu();
    }
  }

  function computePopoverPosition() {
    if (!modulesToggleEl) return;
    const rect = modulesToggleEl.getBoundingClientRect ? modulesToggleEl.getBoundingClientRect() : { top: 0, left: 0, height: 0, width: 0 };
    const top = rect.bottom + 8; // 8px gap
    const left = rect.left;
    // prefer not to overflow right edge
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const popWidth = 260;
    const maxLeft = Math.max(8, vw - popWidth - 8);
    const resolvedLeft = Math.min(left, maxLeft);
    modulesPopoverStyle = `position: fixed; top: ${Math.round(top)}px; left: ${Math.round(resolvedLeft)}px; z-index: 11100;`;
  }

  function toggleModules(event) {
    modulesOpen = !modulesOpen;
    if (modulesOpen) {
      computePopoverPosition();
      // portal the popover to document.body to avoid ancestor stacking contexts
      if (modulesPopoverEl && modulesPopoverEl.parentNode !== document.body) {
        modulesPopoverOriginalParent = modulesPopoverEl.parentNode;
        modulesPopoverOriginalNextSibling = modulesPopoverEl.nextSibling;
        document.body.appendChild(modulesPopoverEl);
      }
      // close when clicking outside
      setTimeout(() => {
        window.addEventListener('click', outsideClickListener);
        window.addEventListener('resize', computePopoverPosition);
      }, 0);
    } else {
      // restore popover into original parent to keep DOM stable
      if (modulesPopoverEl && modulesPopoverOriginalParent) {
        if (modulesPopoverOriginalNextSibling && modulesPopoverOriginalNextSibling.parentNode === modulesPopoverOriginalParent) {
          modulesPopoverOriginalParent.insertBefore(modulesPopoverEl, modulesPopoverOriginalNextSibling);
        } else {
          modulesPopoverOriginalParent.appendChild(modulesPopoverEl);
        }
        modulesPopoverOriginalParent = null;
        modulesPopoverOriginalNextSibling = null;
      }
      window.removeEventListener('click', outsideClickListener);
      window.removeEventListener('resize', computePopoverPosition);
    }
    event && event.stopPropagation && event.stopPropagation();
  }

  function outsideClickListener(e) {
    const path = e.composedPath ? e.composedPath() : (e.path || []);
    if (modulesPopoverEl && (path.indexOf(modulesPopoverEl) === -1 && path.indexOf(modulesToggleEl) === -1)) {
      modulesOpen = false;
      window.removeEventListener('click', outsideClickListener);
      window.removeEventListener('resize', computePopoverPosition);
    }
  }

  function generateIamFromCurrentSelection() {
    let sourceProfile = null;

    if (storedProfile?.profile?.iam?.code) {
      sourceProfile = storedProfile;
    }

    if (!sourceProfile) {
      sourceProfile = buildFallbackExportProfile() || partialProfile || storedProfile || exportProfile;
    }

    generatedIamProfile = sourceProfile || null;
    if (!sourceProfile) {
      currentIamCode = '';
      return;
    }

    const derivedLong = deriveCurrentIamCode(sourceProfile) || '';
    currentIamCode = normalizeIamCodeForPopup(derivedLong, sourceProfile);
  }

  function openGeneratePopup() {
    iamCopyStatus = '';
    generateIamFromCurrentSelection();
    showIamPopup = true;
  }

</script>

<section class="survey-shell">
  <div class="survey-hero">
    <div class="hero-toolbar">
      <div class="toolbar-left">
        <img src="/images/iam-logo.png" alt="I-AM" class="logo-icon" />
        <div class="modules-dropdown">
          <button bind:this={modulesToggleEl} class={`modules-toggle module-chip ${activeIsFoundational ? 'foundational' : `tone-${activeMeta.tone}`} ${!activeIsFoundational && completedModules[active] ? 'done' : ''}`} type="button" aria-haspopup="menu" aria-expanded={modulesOpen} on:click={toggleModules}>
            <span class="module-chip__emoji">{activeMeta.emoji}</span>
            <span class="module-chip__label">{activeMeta.label}</span>
            <!-- progress/count and completion are shown in the modules popover chips -->
            <span class="modules-caret">▾</span>
          </button>
          <div bind:this={modulesPopoverEl} class={`modules-popover ${modulesOpen ? 'open' : ''}`} role="menu" style={modulesPopoverStyle}>
            <div class="module-rail">
              {#each moduleOrder as mod}
                <button
                  class={`module-chip ${active === mod.key ? 'active' : ''} ${!isFoundationalModule(mod.key) && completedModules[mod.key] ? 'done' : ''} ${isFoundationalModule(mod.key) ? 'foundational' : `tone-${mod.tone}`}`}
                  on:click={() => setActiveModule(mod.key)}
                >
                  <span class="module-chip__emoji">{mod.emoji}</span>
                  <span class="module-chip__label">{mod.label}</span>
                  {#if mod.key !== 'state' && mod.key !== 'base'}
                    {#if completedModules[mod.key]}
                      <span class="module-chip__done-icon" aria-hidden="true">✓</span>
                    {:else}
                      <small class="module-progress-right">{moduleProgressLabels[mod.key]}</small>
                    {/if}
                  {/if}
                </button>
                {#if mod.key === 'base'}
                  <div class="module-divider" role="separator" aria-hidden="true"></div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
        <button
          bind:this={headerMenuToggleEl}
          class="menu-toggle"
          type="button"
          aria-label="Toggle header menu"
          aria-expanded={headerMenuOpen}
          aria-controls="hero-toolbar-actions"
          on:click={toggleHeaderMenu}
        >
          <span aria-hidden="true">{headerMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      <div bind:this={heroToolbarActionsEl} id="hero-toolbar-actions" class={`toolbar-actions ${headerMenuOpen ? 'mobile-open' : ''}`} style={heroToolbarActionsStyle}> 
        <input bind:this={importInput} class="hidden-input" type="file" accept="application/json,.json" on:change={handleImportFile} />
        <button class="mini-btn topbar-btn" on:click={() => { showMainResetDialog = true; closeHeaderMenu(); }}>Reset</button>
        <button class="mini-btn topbar-btn" on:click={() => { triggerImportPicker(); closeHeaderMenu(); }}>Open</button>
        <button class="mini-btn topbar-btn" on:click={() => { downloadCurrent(); closeHeaderMenu(); }} disabled={!canSaveProfile}>Save</button>
        <button class="mini-btn topbar-btn" on:click={() => { openGeneratePopup(); closeHeaderMenu(); }} disabled={!canGenerateIam}>Generate</button>
        <button class="mini-btn topbar-btn" on:click={() => { showHelp = true; closeHeaderMenu(); }} aria-haspopup="dialog" aria-expanded={showHelp}>Help</button>
      </div>
    </div>
    {#if importMessage}
      <p class="hero-message">{importMessage}</p>
    {/if}
    {#if importError}
      <p class="hero-error">Import failed: {importError}</p>
    {/if}
    <!-- module-rail moved into toolbar modules dropdown -->
  </div>

  <div class="workspace">
    <div class="workspace-header">
      <div class="workspace-title-row">
        <h3>{activeMeta.label}<button class="module-help-btn" on:click={(event) => openModuleHelp(active, event)} aria-label={`About ${activeMeta.label}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span class="sr-only">Module details</span>
        </button></h3>
        {#if showModuleActionButtons}
          {#key active}
            <div class="module-action-row">
              <button class="mini-btn topbar-btn module-action-btn" type="button" on:click={openModuleResetDialog}>Reset</button>
              <label class="mini-btn topbar-btn module-action-btn disable-toggle" aria-pressed={currentModuleDisabled}>
                <span>Disable</span>
                <input
                  class="disable-checkbox-input"
                  type="checkbox"
                  checked={currentModuleDisabled}
                  on:change={toggleCurrentModuleDisabled}
                  aria-label="Disable this module"
                />
              </label>
            </div>
          {/key}
        {/if}
      </div>

    {#if active !== 'state' && active !== 'base'}
      <div class="module-note-row">
        <input
          class="module-note"
          type="text"
          placeholder="Details and examples that represent this module."
          bind:value={moduleNotes[active]}
          on:input={() => {
            try {
              sessionService.saveProgress(active, { note: moduleNotes[active] });
              persistCurrentProfile();
            } catch (e) {}
          }}
        />
      </div>
    {/if}

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
      {:else if active === 'delivery'}
        <Delivery onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.delivery?.responses} initialCurrent={resumeData?.modules?.delivery?.current} />
      {:else if active === 'delivery2'}
        <Delivery2 onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.delivery2?.responses} initialCurrent={resumeData?.modules?.delivery2?.current} />
      {:else if active === 'skills'}
        <Skills onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.skills?.responses} initialCurrent={resumeData?.modules?.skills?.current} initialConfirmations={resumeData?.modules?.skills?.testAnswers} />
      {:else if active === 'communication'}
        <Communication onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} on:complete={handleModuleComplete} initialResponses={resumeData?.modules?.communication?.responses} initialCurrent={resumeData?.modules?.communication?.current} />
      {:else}
        <State onProgress={handleModuleProgress} on:moduleprogress={handleModuleProgress} initialState={runtimeState} />
      {/if}
    {/key}
  </div>

  {#if completionPopup}
    <div class="popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="completion-popup-title">
      <div class="popup-card">
        <p class="panel-eyebrow">Context updated</p>
        {#if completionPopup.image}
          <img src={completionPopup.image} alt="Ziggy" style="max-width:160px;margin:0 auto 12px;display:block" />
        {/if}
        <h3 id="completion-popup-title">{completionPopup.title}</h3>
        <p>{completionPopup.message}</p>
        <div class="panel-actions">
          <button class="primary" on:click={downloadPartial}>Save I-AM JSON</button>
          <button class="primary" on:click={() => completionPopup = null}>Close</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showHelp}
    <div class="popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="help-popup-title">
      <div class="popup-card with-scroll">
        <div class="popup-content-scroll">
          <p class="panel-eyebrow">Welcome</p>
          <h3 id="help-popup-title">{@html formatInlineMarkdown(INTRO_HELP.title)}</h3>
          {#each INTRO_HELP.blocks as block}
            {#if block.type === 'paragraph'}
              <p class="intro-help-paragraph">{@html formatInlineMarkdown(block.text)}</p>
            {:else if block.type === 'heading'}
              <p class="module-help-subtitle intro-help-subtitle">{@html formatInlineMarkdown(block.text)}</p>
            {:else if block.type === 'ul'}
              <ul class="module-help-list intro-help-list">
                {#each block.items as item}
                  <li>{@html formatInlineMarkdown(item)}</li>
                {/each}
              </ul>
            {:else if block.type === 'ol'}
              <ol class="module-help-list intro-help-list ordered">
                {#each block.items as item}
                  <li>{@html formatInlineMarkdown(item)}</li>
                {/each}
              </ol>
            {:else if block.type === 'quote'}
              <p class="module-help-meaning intro-help-quote">{@html formatInlineMarkdown(block.text)}</p>
            {/if}
          {/each}
          <div class="intro-help-clear" aria-hidden="true"></div>
        </div>
        <div class="panel-actions">
          <button class="primary" on:click={() => showHelp = false}>Got it</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showModuleHelp}
    <div class="popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="module-help-popup-title">
      <div class="popup-card with-scroll">
        <div class="popup-content-scroll">
          <p class="panel-eyebrow">Module guide</p>
          <h3 id="module-help-popup-title">{@html formatInlineMarkdown(selectedModuleHelp.title)}</h3>
          <p class="module-help-summary">{@html formatInlineMarkdown(selectedModuleHelp.summary)}</p>

          <p class="module-help-subtitle highlight">How to answer</p>
          <ul class="module-help-list highlight-list">
            {#each selectedModuleHelp.howToAnswer as guidance}
              <li>{@html formatInlineMarkdown(guidance)}</li>
            {/each}
          </ul>

          <p class="module-help-subtitle">Key metrics produced</p>
          <ul class="module-help-list data-list">
            {#each selectedModuleHelp.metrics as metric}
              <li>{@html formatInlineMarkdown(metric)}</li>
            {/each}
          </ul>
          <p class="module-help-meaning">{@html formatInlineMarkdown(selectedModuleHelp.metricMeaning)}</p>

          <p class="module-help-subtitle highlight-ai">How these metrics guide AI behavior</p>
          <p class="module-help-ai">{@html formatInlineMarkdown(selectedModuleHelp.aiUse)}</p>
        </div>
        <div class="panel-actions">
          <button class="primary" on:click={() => showModuleHelp = false}>Close</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showIamPopup}
    <div class="popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="iam-popup-title">
      <div class="popup-card">
        <p class="panel-eyebrow">Current profile</p>
        <h3 id="iam-popup-title">Current I-AM String</h3>
        <p>This block includes model-facing instructions that travel with the current I-AM string.</p>
        <textarea class="iam-popup-text" readonly bind:value={iamPopupText} aria-label="Current I-AM text"></textarea>
        {#if iamCopyStatus}
          <p class="iam-copy-status">{iamCopyStatus}</p>
        {/if}
        <div class="panel-actions">
          <button class="primary" on:click={copyIamText}>Copy</button>
          <button class="primary" on:click={() => showIamPopup = false}>Close</button>
        </div>
      </div>
    </div>
  {/if}

  {#if moduleActionDialog}
    <div class="popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="module-action-dialog-title">
      <div class="popup-card">
        <p class="panel-eyebrow">Module action</p>
        <h3 id="module-action-dialog-title">{moduleActionDialog.title}</h3>
        <p>{moduleActionDialog.message}</p>
        <div class="panel-actions">
          <button class="primary" on:click={resetCurrentModule}>Reset module</button>
          <button class="primary" on:click={() => moduleActionDialog = null}>Cancel</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showMainResetDialog}
    <div class="popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="main-reset-dialog-title">
      <div class="popup-card">
        <p class="panel-eyebrow">Reset all modules</p>
        <h3 id="main-reset-dialog-title">Reset all saved answers?</h3>
        <p>This clears all module answers and progress for the current profile.</p>
        <div class="panel-actions">
          <button class="primary" on:click={() => { doStartOver(); showMainResetDialog = false; }}>Reset all</button>
          <button class="primary" on:click={() => showMainResetDialog = false}>Cancel</button>
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  .survey-shell {
    display: grid;
    gap: 24px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
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
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }


  /* Remove .app-name styling, no longer needed */
  .toolbar-actions .topbar-btn,
  .module-action-row .topbar-btn {
    font-size: 0.82rem;
    padding: 5px 10px;
    border-radius: 12px;
    background: rgba(148, 163, 184, 0.13);
    color: var(--iam-text-primary);
    border: 1px solid rgba(148, 163, 184, 0.18);
    font-weight: 600;
    box-shadow: none;
    margin-right: 2px;
    margin-bottom: 2px;
    transition: background 0.15s, color 0.15s;
  }
  .toolbar-actions .topbar-btn:active,
  .module-action-row .topbar-btn:active {
    background: rgba(99, 102, 241, 0.13);
    color: #fff;
  }
  .toolbar-actions .danger.topbar-btn {
    color: #991b1b;
    background: rgba(220, 38, 38, 0.10);
    border-color: rgba(220, 38, 38, 0.18);
  }
  .toolbar-actions .subtle.topbar-btn {
    background: #0f172a;
    color: #f8fafc;
  }

  .survey-hero p {
    margin: 0;
    color: var(--iam-text-secondary);
    font-size: 0.9rem;
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
    gap: 12px;
    flex-wrap: wrap;
    position: relative;
    z-index: 12020;
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative; /* Setup relative positioning for the dropdown */
  }

  .menu-toggle {
    display: none;
    margin-left: auto;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: rgba(15, 23, 42, 0.85);
    color: var(--iam-text-primary);
    font-size: 1.2rem;
    line-height: 1;
    align-items: center;
    justify-content: center;
  }

  .modules-dropdown {
    position: relative;
    margin-left: 12px;
    display: inline-block;
    /* ensure dropdown container creates a stacking context above other UI panels */
    z-index: 11000;
  }

  .modules-toggle {
    background: transparent;
    color: var(--iam-text-primary);
    border: 1px solid rgba(148,163,184,0.12);
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
    justify-content: flex-start;
  }

  .modules-toggle .module-chip__emoji {
    font-size: 1.1rem;
    line-height: 1;
  }

  .modules-toggle .module-chip__label {
    font-weight: 700;
  }

  .modules-caret {
    margin-left: auto;
    opacity: 0.9;
  }


  .modules-popover {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 260px;
    max-width: 420px;
    background: rgba(30, 41, 59, 0.95);
    border: 1px solid rgba(148,163,184,0.08);
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    display: none;
    /* very high z-index to overcome ancestor stacking contexts */
    z-index: 11100;
    transform-origin: top left;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }

  .modules-popover.open {
    display: block;
  }

  .modules-popover .module-rail {
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* Limit height and enable scrolling when there are many modules */
    max-height: 320px;
    overflow-y: auto;
    padding-right: 6px; /* room for scrollbar */
  }

  /* scrollbar styling */
  .modules-popover .module-rail::-webkit-scrollbar {
    width: 10px;
  }
  .modules-popover .module-rail::-webkit-scrollbar-thumb {
    background: rgba(148,163,184,0.12);
    border-radius: 10px;
  }

  /* show per-chip progress inside the popover only when the popover is open */
  .modules-popover:not(.open) .module-chip small {
    display: none;
  }
  .modules-popover.open .module-chip small {
    display: inline;
  }

  .toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .toolbar-menu-title {
    display: none;
  }

  .menu-section-title {
    margin: 0;
    color: var(--iam-text-secondary);
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .mini-btn {
    padding: 6px 12px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.85rem;
    background: rgba(148, 163, 184, 0.2);
    color: var(--iam-text-primary);
    border: 1px solid rgba(148, 163, 184, 0.3);
    white-space: nowrap;
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
    gap: 8px;
  }

  .module-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.15);
    border: 1px solid rgba(148, 163, 184, 0.2);
    font-weight: 700;
    font-size: 0.92rem;
    color: var(--iam-text-secondary);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .module-chip:hover,
  .module-chip:focus-visible {
    transform: scale(1.05);
    outline: none;
    border-color: var(--iam-button-bg);
    background: rgba(99, 102, 241, 0.2);
  }

  .module-chip.active {
    border-color: var(--iam-button-bg);
    background: var(--iam-button-bg);
    color: #fff;
  }

  .module-chip.foundational {
    background: rgba(148, 163, 184, 0.12);
    border-color: rgba(148, 163, 184, 0.24);
    color: var(--iam-text-primary);
  }

  .module-chip.foundational:hover,
  .module-chip.foundational:focus-visible {
    background: rgba(148, 163, 184, 0.2);
    border-color: rgba(148, 163, 184, 0.36);
  }

  .module-chip.foundational.active {
    background: rgba(148, 163, 184, 0.22);
    border-color: rgba(148, 163, 184, 0.4);
    color: var(--iam-text-primary);
  }

  .module-chip.done {
    background: rgba(132, 204, 22, 0.2);
    border-color: var(--iam-green);
    color: var(--iam-green);
  }

  .module-divider {
    height: 1px;
    margin: 2px 4px 4px;
    background: rgba(148, 163, 184, 0.26);
  }

  .module-chip__done-icon {
    margin-left: auto;
    font-weight: 900;
    color: var(--iam-green);
    font-size: 0.95rem;
    line-height: 1;
  }

  .module-chip__emoji {
    font-size: 1rem;
  }

  .module-chip__label {
    font-weight: 700;
    font-size: 0.92rem;
  }

  .module-chip small {
    margin-left: auto;
    color: currentColor;
    font-weight: 700;
    opacity: 0.8;
    font-size: 0.82rem;
  }

  .panel,
  .workspace {
    padding: 24px;
  }

  .workspace-header h3 {
    margin: 0 0 8px;
    font-size: 1.2rem;
    color: var(--iam-text-primary);
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .workspace-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 12px;
    flex-wrap: wrap;
  }

  .module-note-row {
    width: 100%;
    margin-top: 8px;
  }

  .module-note {
    width: 100%;
    height: 40px;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px dashed rgba(148, 163, 184, 0.18);
    background: rgba(15, 23, 42, 0.45);
    color: var(--iam-text-primary);
    font-size: 0.95rem;
    line-height: 1.4;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    box-sizing: border-box;
  }

  .module-action-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
    margin-left: auto;
  }

  .module-action-btn {
    margin: 0;
  }

  .disable-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .disable-checkbox-input {
    width: 14px;
    height: 14px;
    accent-color: currentColor;
    cursor: pointer;
  }

  .module-help-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    background: rgba(148, 163, 184, 0.1);
    color: var(--iam-text-secondary);
    border: 1px solid rgba(148, 163, 184, 0.15);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .module-help-btn:hover,
  .module-help-btn:focus-visible {
    background: rgba(148, 163, 184, 0.25);
    color: var(--iam-text-primary);
    transform: scale(1.05);
    outline: none;
  }

  .module-help-btn:active {
    transform: scale(0.95);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
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

  @media (max-width: 768px) {
    .survey-shell {
      gap: 16px;
    }

    .survey-hero,
    .workspace,
    .panel,
    .popup-card {
      border-radius: 16px;
    }

    .survey-hero {
      padding: 12px;
    }

    .hero-toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .toolbar-left {
      justify-content: space-between;
      width: 100%;
    }

    .menu-toggle {
      display: inline-flex;
    }

    .toolbar-actions {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      z-index: 12030;
      flex-direction: column;
      gap: 8px;
      width: 180px;
      background: rgba(30, 41, 59, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      margin-top: 8px; /* space between header and dropdown */
    }

    .toolbar-actions.mobile-open {
      display: flex;
    }

    .mini-btn {
      width: 100%;
      font-size: 0.88rem;
      line-height: 1.2;
      padding: 9px 10px;
      text-align: center;
    }

    .module-chip {
      font-size: 0.9rem;
      padding: 8px 10px;
    }

    .module-chip small {
      font-size: 0.82rem;
    }

    .workspace {
      padding: 16px;
    }

    .workspace-header h3 {
      font-size: 1rem;
    }

    .workspace-title-row,
    .module-action-row {
      width: 100%;
    }

    .workspace-title-row {
      gap: 8px;
    }

    .module-action-row {
      justify-content: flex-end;
      margin-left: 0;
    }
  }

  @media (max-width: 480px) {
    .survey-shell {
      gap: 8px;
    }

    .survey-hero,
    .workspace,
    .panel,
    .popup-card {
      border-radius: 0;
    }

    .survey-hero {
      padding: 10px;
    }

    .app-name {
      font-size: 1.05rem;
    }

    .logo-icon {
      width: 38px;
      height: 38px;
    }

    .toolbar-actions {
      grid-template-columns: 1fr;
      gap: 7px;
    }

    .mobile-module-grid {
      grid-template-columns: 1fr;
    }

    .mini-btn {
      font-size: 0.9rem;
      padding: 10px 10px;
    }

    .module-chip {
      padding: 5px 8px;
    }

    .workspace {
      padding: 10px;
    }
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

  /* Popup-specific layout tweaks */
  .popup-card {
    padding: 20px;
    display: block;
  }

  .popup-card.with-scroll {
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .popup-content-scroll {
    overflow-y: auto;
    padding-right: 8px;
  }

  .popup-content-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .popup-content-scroll::-webkit-scrollbar-track {
    background: rgba(148, 163, 184, 0.1);
    border-radius: 4px;
  }
  .popup-content-scroll::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.4);
    border-radius: 4px;
  }

  .popup-card .panel-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 18px;
    flex-shrink: 0;
  }

  .popup-card h3 {
    margin: 0 0 12px;
    font-size: 1.3rem;
    color: var(--iam-text-primary);
  }

  .popup-card p {
    margin: 0 0 12px;
    color: var(--iam-text-secondary);
    line-height: 1.5;
  }

  /* Markdown formatting inside popups */
  .popup-card :global(strong) {
    color: var(--iam-text-primary);
    font-weight: 700;
  }
  .popup-card :global(em) {
    color: var(--iam-text-primary);
    opacity: 0.9;
    font-style: italic;
  }

  .module-help-summary {
    font-size: 1.05rem;
    color: var(--iam-text-primary) !important;
  }

  .module-help-subtitle {
    margin: 16px 0 8px 0 !important;
    font-weight: 700;
    color: var(--iam-text-primary) !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
  }

  .module-help-subtitle.highlight {
    color: var(--iam-teal) !important;
  }

  .module-help-subtitle.highlight-ai {
    color: var(--iam-purple) !important;
  }

  .module-help-list {
    margin: 0 0 12px 0;
    padding-left: 20px;
    color: var(--iam-text-secondary);
    line-height: 1.5;
  }

  .module-help-list li {
    margin-bottom: 6px;
  }

  /* Custom bullet styles */
  .module-help-list.highlight-list {
    list-style-type: none;
    padding-left: 0;
  }

  .module-help-list.highlight-list li {
    position: relative;
    padding-left: 18px;
    color: var(--iam-text-primary);
  }

  .module-help-list.highlight-list li::before {
    content: "•";
    color: var(--iam-teal);
    font-weight: bold;
    position: absolute;
    left: 0;
  }

  .module-help-list.data-list li {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.85rem;
    color: #cbd5e1;
    background: rgba(15, 23, 42, 0.4);
    padding: 2px 6px;
    border-radius: 4px;
    margin-bottom: 8px;
    display: table;
  }

  .module-help-meaning, 
  .module-help-ai {
    background: rgba(15, 23, 42, 0.4);
    padding: 12px;
    border-radius: 8px;
    border-left: 3px solid rgba(148, 163, 184, 0.4);
  }

  .module-help-ai {
    border-left-color: var(--iam-purple);
  }

  .intro-help-subtitle {
    margin-top: 14px !important;
  }

  .intro-help-list {
    margin-top: 0;
  }

  .intro-help-list.ordered {
    list-style: decimal;
    padding-left: 22px;
  }

  .intro-help-quote {
    border-left-color: var(--iam-teal);
  }

  .intro-help-clear {
    clear: both;
    height: 0;
    overflow: hidden;
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

</style>

