<script>
  export let title = '';
  export let markdown = '';
  export let sourcePath = '';
  export let routePath = '/';
  export let mdPath = '';

  const REPO_BLOB_BASE = 'https://github.com/jeremypetter502/I-Am/blob/main/';
  let copyResetTimer;

  async function copyText(value) {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const temporaryTextarea = document.createElement('textarea');
    temporaryTextarea.value = value;
    temporaryTextarea.setAttribute('readonly', '');
    temporaryTextarea.style.position = 'absolute';
    temporaryTextarea.style.left = '-9999px';
    document.body.appendChild(temporaryTextarea);
    temporaryTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(temporaryTextarea);
  }

  async function handleDocContentClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('[data-copy-code]');
    if (!button) return;

    const codeArea = button.closest('.doc-code-block')?.querySelector('.doc-codearea');
    if (!codeArea) return;

    const copyLabel = button.querySelector('.doc-copy-label');
    const defaultLabel = button.dataset.copyLabel || 'Copy';
    try {
      await copyText(codeArea.value);
      if (copyLabel) copyLabel.textContent = 'Copied';
      button.setAttribute('aria-label', 'Code block copied');
      clearTimeout(copyResetTimer);
      copyResetTimer = setTimeout(() => {
        if (copyLabel) copyLabel.textContent = defaultLabel;
        button.setAttribute('aria-label', 'Copy code block');
      }, 1600);
    } catch (error) {
      if (copyLabel) copyLabel.textContent = 'Copy failed';
      button.setAttribute('aria-label', 'Copy failed');
    }
  }

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
    let badgeBuffer = [];

    const isBadgeToken = (text) => /^(?:!\[[^\]]*\]\([^\)]+\)|\[!\[[^\]]*\]\([^\)]+\)\]\([^\)]+\)|\[[^\]]+\]\([^\)]+\))$/.test(String(text || '').trim());
    const isMarkdownHr = (text) => /^(?:\*{3,}|-{3,}|_{3,})\s*$/.test(String(text || '').trim());

    const flushParagraph = () => {
      if (!paragraph.length) return;
      const joined = paragraph.join(' ');
      out.push(`<p>${applyInlineMarkdown(joined)}</p>`);
      paragraph = [];
    };

    const flushBadgeBuffer = () => {
      if (!badgeBuffer.length) return;
      out.push(`<div class="badge-row">${badgeBuffer.map((item) => applyInlineMarkdown(item)).join(' ')}</div>`);
      badgeBuffer = [];
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
      const fenceInfo = String(language || '').trim();
      const titleMatch = fenceInfo.match(/^(.*?)(?:\(([^()]*)\))$/);
      const lang = escapeHtml((titleMatch ? titleMatch[1] : fenceInfo).trim() || 'text');
      const rawTitle = (titleMatch?.[2] || '').trim();
      const isIamBlock = /^IAM:/i.test(rawTitle);
      const title = escapeHtml(isIamBlock ? rawTitle.replace(/^IAM:\s*/i, '') : rawTitle);
      const copyLabel = isIamBlock ? 'Copy I-AM' : 'Copy';
      const copyIcon = isIamBlock ? '<img class="doc-copy-icon" src="/images/iam-icon.png" alt="" aria-hidden="true" />' : '';
      const text = escapeHtml((lines || []).join('\n'));
      return `<div class="doc-code-block"><div class="doc-code-toolbar">${title ? `<span class="doc-code-title">${title}</span>` : '<span></span>'}<button type="button" class="doc-copy-button${isIamBlock ? ' doc-copy-button--iam' : ''}" data-copy-code data-copy-label="${copyLabel}" aria-label="Copy code block">${copyIcon}<span class="doc-copy-label">${copyLabel}</span></button></div><textarea class="doc-codearea" data-lang="${lang}" rows="${lineCount}" readonly wrap="soft">${text}</textarea></div>`;
    };

    const parseTableRow = (line) =>
      String(line || '')
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());

    const isTableDelimiter = (line) => {
      const cells = String(line || '')
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());
      return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
    };

    const renderTable = (headerCells, bodyRows) => {
      const head = headerCells.map((cell) => `<th>${applyInlineMarkdown(cell)}</th>`).join('');
      const body = bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${applyInlineMarkdown(cell)}</td>`).join('')}</tr>`).join('');
      return `<table class="doc-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    };

    for (let index = 0; index < lines.length; index += 1) {
      const rawLine = lines[index];
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
        flushBadgeBuffer();
        inCode = true;
        codeLang = trimmed.replace(/^```/, '').trim();
        continue;
      }

      if (trimmed.startsWith('|') && index + 1 < lines.length && isTableDelimiter(lines[index + 1])) {
        const headerCells = parseTableRow(trimmed);
        const bodyRows = [];
        index += 2;
        while (index < lines.length) {
          const nextLine = String(lines[index] || '').trim();
          if (!nextLine.startsWith('|')) break;
          bodyRows.push(parseTableRow(nextLine));
          index += 1;
        }
        out.push(renderTable(headerCells, bodyRows));
        index -= 1;
        continue;
      }

      if (!trimmed) {
        flushParagraph();
        flushList();
        flushBadgeBuffer();
        continue;
      }

      if (isMarkdownHr(trimmed)) {
        flushParagraph();
        flushList();
        flushBadgeBuffer();
        out.push('<hr />');
        continue;
      }

      if (isBadgeToken(trimmed)) {
        flushParagraph();
        flushList();
        badgeBuffer.push(trimmed);
        continue;
      }

      if (badgeBuffer.length && !isBadgeToken(trimmed)) {
        flushBadgeBuffer();
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
    flushBadgeBuffer();

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
  {#if mdPath}
    <link rel="alternate" type="text/markdown" href={mdPath} title="Raw Markdown" />
  {/if}

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
        <p class="doc-source">
          Source: {sourcePath}
          {#if mdPath}
            &nbsp;·&nbsp;<a href={mdPath}>View raw Markdown</a>
          {/if}
        </p>
      {/if}
    </div>
    <nav class="doc-nav" aria-label="Docs navigation">
      <a href="/">App</a>
      <a href="/readme">README</a>
      <a href="/iam">I-AM Format</a>
      <a href="/iam-usecase">Use Cases</a>
      <a href="/examples">Examples</a>
    </nav>
  </header>

  <article class="doc-card doc-content" on:click={handleDocContentClick}>
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

  .doc-content :global(.badge-row) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin: 0 0 1em;
  }

  .doc-content :global(.badge-row a),
  .doc-content :global(.badge-row img) {
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
  }

  .doc-content :global(hr) {
    border: 0;
    border-top: 1px solid rgba(148, 163, 184, 0.3);
    margin: 1.25em 0;
  }

  .doc-content :global(table.doc-table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.45);
  }

  .doc-content :global(table.doc-table th),
  .doc-content :global(table.doc-table td) {
    border: 1px solid rgba(148, 163, 184, 0.2);
    padding: 10px 12px;
    text-align: left;
    vertical-align: top;
    color: var(--iam-text-secondary);
  }

  .doc-content :global(table.doc-table th) {
    background: rgba(59, 130, 246, 0.12);
    color: var(--iam-text-primary);
    font-weight: 700;
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

  .doc-content :global(.doc-code-block) {
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 8px;
    background: rgba(2, 6, 23, 0.72);
  }

  .doc-content :global(.doc-code-toolbar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 34px;
    padding: 5px 8px 5px 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(15, 23, 42, 0.9);
  }

  .doc-content :global(.doc-code-title) {
    min-width: 0;
    overflow: hidden;
    color: #cbd5e1;
    font-size: 0.8rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .doc-content :global(.doc-codearea) {
    width: 100%;
    max-width: 100%;
    display: block;
    border: 0;
    border-radius: 0;
    padding: 12px;
    color: #cbd5e1;
    resize: vertical;
    overflow: auto;
    line-height: 1.45;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 0.92em;
    box-sizing: border-box;
  }

  .doc-content :global(.doc-copy-button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 58px;
    padding: 5px 9px;
    border: 1px solid rgba(148, 163, 184, 0.32);
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.92);
    color: #e2e8f0;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .doc-content :global(.doc-copy-icon) {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  .doc-content :global(.doc-copy-button:hover),
  .doc-content :global(.doc-copy-button:focus-visible) {
    background: #1d4ed8;
    border-color: #60a5fa;
    outline: none;
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

  .doc-content :global(.badge-row) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin: 0 0 1em;
  }

  .doc-content :global(.badge-row a),
  .doc-content :global(.badge-row img) {
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
  }

  .doc-content :global(img) {
    max-width: 100%;
    height: auto;
  }
</style>
