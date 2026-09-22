<script>
  export let markdown = '';

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  function inline(value) {
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  function render(value) {
    const lines = String(value || '').replace(/\r\n/g, '\n').split('\n');
    const output = [];
    let paragraph = [];
    let list = [];
    let listType = '';

    const flushParagraph = () => {
      if (paragraph.length) output.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    };
    const flushList = () => {
      if (list.length) output.push(`<${listType}>${list.map((item) => `<li>${inline(item)}</li>`).join('')}</${listType}>`);
      list = [];
      listType = '';
    };

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        flushParagraph();
        flushList();
        continue;
      }
      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        flushList();
        output.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
        continue;
      }
      const unordered = trimmed.match(/^[-*]\s+(.+)$/);
      const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
      if (unordered || ordered) {
        const nextType = unordered ? 'ul' : 'ol';
        flushParagraph();
        if (listType && listType !== nextType) flushList();
        listType = nextType;
        list.push((unordered || ordered)[1]);
        continue;
      }
      paragraph.push(trimmed);
    }
    flushParagraph();
    flushList();
    return output.join('\n');
  }

  $: html = render(markdown);
</script>

<div class="markdown-content">{@html html}</div>

<style>
  .markdown-content :global(:first-child) { margin-top: 0; }
  .markdown-content :global(:last-child) { margin-bottom: 0; }
  .markdown-content :global(p), .markdown-content :global(li) { line-height: 1.65; }
  .markdown-content :global(code) { padding: 0.1em 0.35em; border-radius: 0.3em; background: rgba(15, 23, 42, 0.72); color: #d8b4fe; }
  .markdown-content :global(h1), .markdown-content :global(h2), .markdown-content :global(h3) { color: var(--iam-text-primary); }
</style>
