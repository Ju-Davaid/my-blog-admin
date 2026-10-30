/* 极简 Markdown 渲染器：先整体转义，再按行解析，输出安全 HTML */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeUrl(url: string): string {
  const u = url.trim();
  if (/^(https?:|mailto:)/i.test(u)) return u;
  return "#";
}

function inline(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, url: string) => {
    const safe = sanitizeUrl(url);
    const external = /^https?:/i.test(safe);
    return `<a href="${safe}" class="md-link"${external ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`;
  });
  return s;
}

export function renderMarkdown(src: string): string {
  const lines = src.split("\n");
  const out: string[] = [];
  let i = 0;
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${paragraph.map(inline).join("<br/>")}</p>`);
      paragraph = [];
    }
  };
  const flushList = (ordered: boolean) => {
    if (list.length) {
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag} class="md-list">${list.map((li) => `<li>${inline(li)}</li>`).join("")}</${tag}>`);
      list = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line.trim())) {
      flushParagraph();
      flushList(false);
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      out.push(
        `<pre class="md-pre"><code>${escapeHtml(buf.join("\n"))}</code></pre>`,
      );
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList(false);
      const level = heading[1].length;
      out.push(`<h${level} class="md-h${level}">${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList(false);
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote class="md-quote">${buf.map(inline).join("<br/>")}</blockquote>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\s*[-*]\s+/, ""));
      i++;
      continue;
    }
    flushList(false);

    if (/^\s*\d+[.)]\s+/.test(line)) {
      flushParagraph();
      const buf: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      out.push(`<ol class="md-list">${buf.map((li) => `<li>${inline(li)}</li>`).join("")}</ol>`);
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      i++;
      continue;
    }

    paragraph.push(line);
    i++;
  }

  flushParagraph();
  flushList(false);
  return out.join("");
}
