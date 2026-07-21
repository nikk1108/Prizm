import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // premium dark code theme
import katex from 'katex';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';

// Initialize mermaid library
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      background: '#111827',
      primaryColor: '#3B82F6',
      primaryTextColor: '#F8FAFC',
      lineColor: '#1E293B'
    }
  });
} catch (e) {
  console.warn('Mermaid failed to initialize:', e);
}

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parsedHtml, setParsedHtml] = useState<string>('');

  useEffect(() => {
    // 1. Sanitize & Escape basic HTML tags to prevent XSS
    let html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Parse KaTeX Display Math: $$ ... $$
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return `<div class="katex-display-math my-4 overflow-x-auto py-2">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch (err) {
        return `<pre class="text-danger font-mono p-2">${math}</pre>`;
      }
    });

    // 3. Parse KaTeX Inline Math: $ ... $
    html = html.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return `<span class="katex-inline-math px-1">${katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })}</span>`;
      } catch (err) {
        return `<code class="text-danger font-mono bg-red-100 dark:bg-red-950 px-1 rounded">${math}</code>`;
      }
    });

    // 4. Parse Code Blocks with Syntax Highlighting: ```lang ... ```
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang || 'clike';
      
      // If code block is mermaid, render a placeholder div to target later
      if (language.toLowerCase() === 'mermaid') {
        const diagramId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        return `<div class="mermaid-diagram my-6 bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-x-auto" data-diagram="${diagramId}">${code.trim()}</div>`;
      }

      return `<pre class="my-4 p-4 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto text-slate-100 font-mono text-sm"><code class="language-${language}">${code}</code></pre>`;
    });

    // 5. Parse Inline Code: `code`
    html = html.replace(/`([^`\n]+?)`/g, (_, code) => {
      return `<code class="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-accent">${code}</code>`;
    });

    // 6. Parse Headings: #, ##, ###
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-text-primary">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 border-b border-border pb-1 text-text-primary">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-extrabold mt-8 mb-4 border-b border-border pb-2 text-text-primary">$1</h1>');

    // 7. Parse Tables
    // Matches standard pipe tables
    html = html.replace(/\|(.+?)\|/g, (match) => {
      // Avoid parsing math equations as tables
      if (match.includes('katex')) return match;
      const cells = match.split('|').slice(1, -1);
      const cellHtml = cells.map(cell => `<td class="border border-border p-2 text-sm">${cell.trim()}</td>`).join('');
      return `<tr class="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">${cellHtml}</tr>`;
    });
    // Wrap consecutive table rows in table element
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<div class="overflow-x-auto my-4 border border-border rounded-lg"><table class="w-full border-collapse">$1</table></div>');

    // 8. Parse Bold and Italics
    html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>');
    html = html.replace(/\*([^*]+?)\*/g, '<em class="italic">$1</em>');

    // 9. Parse Lists: - item or * item
    html = html.replace(/^\s*-\s+(.*?)$/gm, '<li class="list-disc list-inside ml-4 text-text-secondary my-1">$1</li>');
    html = html.replace(/^\s*\*\s+(.*?)$/gm, '<li class="list-disc list-inside ml-4 text-text-secondary my-1">$1</li>');
    // Wrap consecutive li elements in ul
    html = html.replace(/(<li[\s\S]*?<\/li>)+/g, '<ul class="my-3 space-y-1">$1</ul>');

    // 10. Parse Links: [text](url)
    html = html.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline font-medium">$1</a>');

    // 11. Parse Images & Video embeds: ![alt](url)
    html = html.replace(/!\[([^\]]*?)\]\(([^)]+?)\)/g, (_, alt, url) => {
      const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('youtube.com') || url.includes('youtu.be');
      if (isVideo) {
        return `<div class="my-6 rounded-lg overflow-hidden border border-border bg-slate-900 aspect-video"><video src="${url}" controls class="w-full h-full object-cover"></video></div>`;
      }
      return `<div class="my-6 flex flex-col items-center"><img src="${url}" alt="${alt}" loading="lazy" class="max-h-[500px] rounded-lg border border-border shadow-sm"><span class="text-xs text-text-secondary mt-2">${alt}</span></div>`;
    });

    // 12. Parse Paragraph lines (non-HTML tags block)
    const lines = html.split('\n');
    const parsedLines = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      // Skip wrapping block tags
      if (
        trimmed.startsWith('<h') || 
        trimmed.startsWith('<ul') || 
        trimmed.startsWith('<li') || 
        trimmed.startsWith('<div') || 
        trimmed.startsWith('<table') || 
        trimmed.startsWith('<tr') || 
        trimmed.startsWith('<td') || 
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<a')
      ) {
        return line;
      }
      return `<p class="my-2.5 leading-relaxed text-text-secondary">${line}</p>`;
    });
    
    setParsedHtml(parsedLines.join('\n'));
  }, [content]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Trigger Prism Syntax Highlighting
    Prism.highlightAllUnder(containerRef.current);

    // Trigger Mermaid Renderings
    const mermaidBlocks = containerRef.current.querySelectorAll('.mermaid-diagram');
    mermaidBlocks.forEach(async (block) => {
      const diagramCode = block.textContent || '';
      const diagramId = block.getAttribute('data-diagram') || 'mermaid-gen';
      
      if (!diagramCode.trim()) return;

      try {
        block.innerHTML = '<div class="flex items-center justify-center py-4 text-sm text-text-secondary"><span class="animate-pulse">Parsing flowchart diagram...</span></div>';
        const { svg } = await mermaid.render(diagramId, diagramCode);
        block.innerHTML = svg;
      } catch (err) {
        console.error('Mermaid render error:', err);
        block.innerHTML = `<pre class="text-danger font-mono text-xs overflow-x-auto bg-red-950/20 p-2 rounded border border-red-900/50">${diagramCode}</pre>`;
      }
    });
  }, [parsedHtml]);

  return (
    <div 
      ref={containerRef} 
      className="prose dark:prose-invert max-w-none text-text-secondary select-text"
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
};
export default MarkdownRenderer;
