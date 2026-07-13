<script>
  export let title = '';
  export let markdown = '';
  export let sourcePath = '';
  export let routePath = '/';

  const REPO_BLOB_BASE = 'https://github.com/jeremypetter502/I-Am/blob/main/';

  function stripMarkdownSyntax(value) {
    return String(value || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[[^\]]+\]\([^)]*\)/g, '$1')
      .replace(/^\s*#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function trimDescription(value, max = 160) {
    const text = String(value || '').trim();
    if (!text) return '';
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1).trimEnd()}...`;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeDocLink(rawHref) {
    const href = String(rawHref || '').trim();
    if (!href) return '#';
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;

    const clean = href
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/^\.\//, '')
      .replace(/^(\.\.\/)+/, '');

    if (/^(README\.md)$/i.test(clean)) return '/readme';
    if (/(^|\/)docs\/iam\.md$/i.test(clean) || /^iam\.md$/i.test(clean)) return '/iam';
    if (/(^|\/)docs\/iam-usecase\.md$/i.test(clean) || /^iam-usecase\.md$/i.test(clean)) return '/iam-usecase';

    if (/\.md($|#)/i.test(clean)) {
      return `${REPO_BLOB_BASE}${clean}`;
    }

    if (/^(public|\.\.\/public|\.\/public)\//i.test(href)) {
      return '/' + clean.replace(/^public\//i, '');
    }

    return href;
  }

  function applyInlineMarkdown(text) {
    let out = String(text || '');

    out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, href) => {
      const mappedHref = normalizeDocLink(href);
      return `<img src="${mappedHref}" alt="${escapeHtml(alt)}" />`;
    });

    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
      const mappedHref = normalizeDocLink(href);
      const isExternal = /^(https?:)?\/\//i.test(mappedHref);
      const rel = isExternal ? ' rel="noopener noreferrer"' : '';
      const target = isExternal ? ' target="_blank"' : '';
      return `<a href="${mappedHref}"${target}${rel}>${label}</a>`;
    });

    out = out.replace(/`([^`]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`);
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    return out;
  }

  function preprocessMarkdown(value) {
    return String(value || '')
      .replace(/src="(?:\.\.\/|\.\/)?public\//g, 'src="/')
      .replace(/src='(?:\.\.\/|\.\/)?public\//g, "src='/");
  }

  function renderMarkdown(value) {
    const lines = preprocessMarkdown(value).replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let inCode = false;
    let codeLang = '';
    let codeLines = [];
    let paragraph = [];
    let listType = null;
    let listItems = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      out.push(`<p>${applyInlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    };

    const flushList = () => {
      if (!listType || !listItems.length) return;
      const tag = listType === 'ol' ? 'ol' : 'ul';
      const itemsHtml = listItems.map((item) => `<li>${applyInlineMarkdown(item)}</li>`).join('');
      out.push(`<${tag}>${itemsHtml}</${tag}>`);
      listType = null;
      listItems = [];
    };

    const codeTextarea = (lines, language) => {
      const lineCount = Math.max(3, Math.min(18, (Array.isArray(lines) ? lines.length : 0) + 1));
      const lang = escapeHtml(language || 'text');
      const text = escapeHtml((lines || []).join('\n'));
      return `<textarea class="doc-codearea" data-lang="${lang}" rows="${lineCount}" readonly wrap="soft">${text}</textarea>`;
    };

    for (const rawLine of lines) {
      const line = rawLine ?? '';
      const trimmed = line.trim();

      if (inCode) {
        if (/^```/.test(trimmed)) {
          out.push(codeTextarea(codeLines, codeLang));
          inCode = false;
          codeLang = '';
          codeLines = [];
        } else {
          codeLines.push(line);
        }
        continue;
      }

      if (/^```/.test(trimmed)) {
        flushParagraph();
        flushList();
        inCode = true;
        codeLang = trimmed.replace(/^```/, '').trim();
        continue;
      }

      if (!trimmed) {
        flushParagraph();
        flushList();
        continue;
      }

      const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        flushParagraph();
        flushList();
        const level = heading[1].length;
        out.push(`<h${level}>${applyInlineMarkdown(heading[2])}</h${level}>`);
        continue;
      }

      const ul = trimmed.match(/^[-*]\s+(.*)$/);
      if (ul) {
        flushParagraph();
        if (listType && listType !== 'ul') flushList();
        listType = 'ul';
        listItems.push(ul[1]);
        continue;
      }

      const ol = trimmed.match(/^\d+\.\s+(.*)$/);
      if (ol) {
        flushParagraph();
        if (listType && listType !== 'ol') flushList();
        listType = 'ol';
        listItems.push(ol[1]);
        continue;
      }

      paragraph.push(trimmed);
    }

    flushParagraph();
    flushList();

    if (inCode) {
      out.push(codeTextarea(codeLines, codeLang));
    }

    return out.join('\n');
  }

  function resolveMetaDescription() {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    for (const rawLine of lines) {
      const trimmed = String(rawLine || '').trim();
      if (!trimmed || /^#{1,6}\s+/.test(trimmed) || /^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed) || /^```/.test(trimmed)) {
        continue;
      }
      const clean = stripMarkdownSyntax(trimmed);
      if (clean) return trimDescription(clean);
    }
    return 'I-AM project documentation page.';
  }

  const seoOrigin = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin
    : '';

  $: html = renderMarkdown(markdown);
  $: seoTitle = `${title} | I-AM Docs`;
  $: seoDescription = resolveMetaDescription();
  $: canonicalUrl = seoOrigin ? `${seoOrigin}${routePath}` : routePath;
  $: seoImage = seoOrigin ? `${seoOrigin}/images/iam-logo.png` : '/images/iam-logo.png';
  $: seoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: seoDescription,
    url: canonicalUrl,
    image: seoImage,
    mainEntityOfPage: canonicalUrl
  };
</script>

<svelte:head>
  <title>{seoTitle}</title>
  <meta name="description" content={seoDescription} />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href={canonicalUrl} />

  <meta property="og:type" content="article" />
  <meta property="og:title" content={seoTitle} />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={seoImage} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seoTitle} />
  <meta name="twitter:description" content={seoDescription} />
  <meta name="twitter:image" content={seoImage} />

  <script type="application/ld+json">{JSON.stringify(seoJsonLd)}</script>
</svelte:head>

<section class="doc-shell">
  <header class="doc-header">
    <div>
      <p class="doc-eyebrow">Documentation</p>
      <h1>{title}</h1>
      {#if sourcePath}
        <p class="doc-source">Source: {sourcePath}</p>
      {/if}
    </div>
    <nav class="doc-nav" aria-label="Docs navigation">
      <a href="/">App</a>
      <a href="/readme">README</a>
      <a href="/iam">I-AM Format</a>
      <a href="/iam-usecase">Use Cases</a>
    </nav>
  </header>

  <article class="doc-card doc-content">
    {@html html}
  </article>
</section>

<style>
  .doc-shell {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    gap: 14px;
    padding: 12px;
    min-width: 0;
  }

  .doc-header,
  .doc-card {
    border-radius: 20px;
    background: var(--iam-card-bg, rgba(30, 41, 59, 0.7));
    border: 1px solid var(--iam-card-border, rgba(148, 163, 184, 0.1));
    box-shadow: var(--iam-card-shadow, 0 10px 24px rgba(0, 0, 0, 0.3));
    backdrop-filter: blur(12px);
    min-width: 0;
  }

  .doc-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .doc-eyebrow {
    margin: 0 0 6px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 0.75rem;
    font-weight: 800;
    color: #6366f1;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.4rem, 2vw, 2rem);
    color: var(--iam-text-primary);
  }

  .doc-source {
    margin: 8px 0 0;
    font-size: 0.85rem;
    color: var(--iam-text-secondary);
  }

  .doc-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-self: flex-start;
  }

  .doc-nav a {
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(148, 163, 184, 0.13);
    color: var(--iam-text-primary);
    padding: 8px 12px;
    font-weight: 700;
    font-size: 0.86rem;
    text-decoration: none;
  }

  .doc-card {
    padding: 20px;
  }

  .doc-content :global(h1),
  .doc-content :global(h2),
  .doc-content :global(h3),
  .doc-content :global(h4) {
    color: var(--iam-text-primary);
    margin: 1.15em 0 0.5em;
  }

  .doc-content :global(h1) {
    margin-top: 0;
  }

  .doc-content :global(p),
  .doc-content :global(li) {
    color: var(--iam-text-secondary);
    line-height: 1.6;
  }

  .doc-content :global(ul),
  .doc-content :global(ol) {
    margin: 0.3em 0 1em 1.3em;
    padding: 0;
  }

  .doc-content :global(pre) {
    background: rgba(2, 6, 23, 0.72);
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 12px;
    padding: 12px;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .doc-content :global(.doc-codearea) {
    width: 100%;
    max-width: 100%;
    display: block;
    background: rgba(2, 6, 23, 0.72);
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 12px;
    padding: 12px;
    color: #cbd5e1;
    resize: vertical;
    overflow: auto;
    line-height: 1.45;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 0.92em;
    box-sizing: border-box;
  }

  .doc-content :global(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 0.92em;
    color: #cbd5e1;
  }

  .doc-content :global(a) {
    color: #93c5fd;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .doc-content :global(img) {
    max-width: 100%;
    height: auto;
  }
</style>
