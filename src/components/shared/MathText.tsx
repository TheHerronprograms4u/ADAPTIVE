import React, { useState } from 'react';
import katex from 'katex';
import { Check, Copy, ExternalLink } from 'lucide-react';

interface MathTextProps {
  content: string;
  className?: string;
}

// Code Block with Syntax Style & Copy Button
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 text-xs shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/80 px-3.5 py-1.5 text-[11px] font-mono text-zinc-400">
        <span className="uppercase font-semibold tracking-wider text-indigo-400">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-[11px] sm:text-xs text-zinc-200 leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Helper to render KaTeX formula safely
function renderKaTeX(tex: string, displayMode: boolean): React.ReactNode {
  try {
    const html = katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
    });
    if (displayMode) {
      return (
        <div
          className="my-3 overflow-x-auto py-1 text-center font-serif text-indigo-200 text-sm sm:text-base max-w-full"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return (
      <span
        className="inline-block px-1 font-serif text-indigo-300 font-medium align-baseline"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <span className="text-rose-400 font-mono">{tex}</span>;
  }
}

// Tokenize and render inline text (markdown formatting, inline code, inline math)
function parseInlineTokens(text: string): React.ReactNode[] {
  if (!text) return [];

  const placeholderMap: Record<string, { type: 'math' | 'code'; content: string }> = {};
  let tokenCounter = 0;

  // 1. Protect inline code `...`
  let protectedText = text.replace(/`([^`\n]+?)`/g, (_, code) => {
    const key = `\u0001CODE_${tokenCounter++}\u0001`;
    placeholderMap[key] = { type: 'code', content: code };
    return key;
  });

  // 2. Protect LaTeX inline math: \(...\) and $...$
  protectedText = protectedText.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
    const key = `\u0001MATH_${tokenCounter++}\u0001`;
    placeholderMap[key] = { type: 'math', content: math.trim() };
    return key;
  });

  protectedText = protectedText.replace(/\$([^$\n]+?)\$/g, (_, math) => {
    const key = `\u0001MATH_${tokenCounter++}\u0001`;
    placeholderMap[key] = { type: 'math', content: math.trim() };
    return key;
  });

  // 3. Master regex for markdown formatting
  // eslint-disable-next-line no-control-regex
  const masterRegex = /(\u0001(?:CODE|MATH)_\d+\u0001|\*\*\*(?:[^*]+)\*\*\*|___(?:[^_]+)___|\*\*(?:[^*]+)\*\*|__(?:[^_]+)__|(?:\*[^*\s][^*]*\*)|(?:_[^_]+_)|~~(?:[^~]+)~~|\[(?:[^\]]+)\]\((?:[^)]+)\))/g;

  const parts = protectedText.split(masterRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Check placeholder
    if (placeholderMap[part]) {
      const item = placeholderMap[part];
      if (item.type === 'code') {
        return (
          <code
            key={idx}
            className="mx-0.5 rounded bg-zinc-800/90 px-1.5 py-0.5 font-mono text-[11px] sm:text-xs text-indigo-300 border border-white/10"
          >
            {item.content}
          </code>
        );
      }
      if (item.type === 'math') {
        return <React.Fragment key={idx}>{renderKaTeX(item.content, false)}</React.Fragment>;
      }
    }

    // Bold Italic ***text*** or ___text___
    if (
      (part.startsWith('***') && part.endsWith('***') && part.length >= 6) ||
      (part.startsWith('___') && part.endsWith('___') && part.length >= 6)
    ) {
      const inner = part.slice(3, -3);
      return (
        <strong key={idx} className="font-bold italic text-white">
          {parseInlineTokens(inner)}
        </strong>
      );
    }

    // Bold **text** or __text__
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-bold text-white">
          {parseInlineTokens(inner)}
        </strong>
      );
    }

    // Italic *text* or _text_
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-zinc-200">
          {parseInlineTokens(inner)}
        </em>
      );
    }

    // Strikethrough ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <del key={idx} className="line-through text-zinc-500">
          {parseInlineTokens(inner)}
        </del>
      );
    }

    // Markdown link [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-indigo-400 underline hover:text-indigo-300 font-medium transition-colors"
        >
          <span>{linkMatch[1]}</span>
          <ExternalLink className="h-3 w-3 inline ml-0.5" />
        </a>
      );
    }

    // Preserve newlines in normal text
    if (part.includes('\n')) {
      const sublines = part.split('\n');
      return (
        <React.Fragment key={idx}>
          {sublines.map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {line}
              {lIdx < sublines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

type BlockNode =
  | { type: 'code'; code: string; language?: string }
  | { type: 'math'; math: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'paragraph'; text: string };

function parseTextToBlocks(rawText: string): BlockNode[] {
  if (!rawText) return [];

  // 1. Extract fenced code blocks & display math into placeholders
  const blockMap: Record<string, BlockNode> = {};
  let blockCounter = 0;

  // Code blocks: ```[lang]?\n[code]```
  let text = rawText.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const key = `\u0002BLOCK_${blockCounter++}\u0002`;
    blockMap[key] = { type: 'code', language: lang.trim(), code: code.replace(/\n$/, '') };
    return `\n\n${key}\n\n`;
  });

  // Display math $$...$$
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const key = `\u0002BLOCK_${blockCounter++}\u0002`;
    blockMap[key] = { type: 'math', math: math.trim() };
    return `\n\n${key}\n\n`;
  });

  // Display math \[...\]
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
    const key = `\u0002BLOCK_${blockCounter++}\u0002`;
    blockMap[key] = { type: 'math', math: math.trim() };
    return `\n\n${key}\n\n`;
  });

  // 2. Split by double newlines into paragraphs/blocks
  const paragraphs = text.split(/\n{2,}/);
  const result: BlockNode[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check placeholder
    if (blockMap[trimmed]) {
      result.push(blockMap[trimmed]);
      continue;
    }

    const lines = trimmed.split('\n');
    let currentTextLines: string[] = [];
    let currentUlItems: string[] = [];
    let currentOlItems: string[] = [];
    let currentQuoteLines: string[] = [];
    let currentTableLines: string[] = [];

    const flushText = () => {
      if (currentTextLines.length > 0) {
        result.push({ type: 'paragraph', text: currentTextLines.join('\n') });
        currentTextLines = [];
      }
    };
    const flushUl = () => {
      if (currentUlItems.length > 0) {
        result.push({ type: 'ul', items: currentUlItems });
        currentUlItems = [];
      }
    };
    const flushOl = () => {
      if (currentOlItems.length > 0) {
        result.push({ type: 'ol', items: currentOlItems });
        currentOlItems = [];
      }
    };
    const flushQuote = () => {
      if (currentQuoteLines.length > 0) {
        result.push({ type: 'blockquote', text: currentQuoteLines.join('\n') });
        currentQuoteLines = [];
      }
    };
    const flushTable = () => {
      if (currentTableLines.length >= 2) {
        const parseRow = (line: string) =>
          line
            .replace(/^\||\|$/g, '')
            .split('|')
            .map(c => c.trim());
        const headers = parseRow(currentTableLines[0]);
        const dataRows = currentTableLines.slice(1).filter(l => !l.match(/^\|?[\s-:]+\|?$/));
        const rows = dataRows.map(parseRow);
        result.push({ type: 'table', headers, rows });
        currentTableLines = [];
      } else if (currentTableLines.length > 0) {
        currentTextLines.push(...currentTableLines);
        currentTableLines = [];
      }
    };

    for (const line of lines) {
      const lineTrim = line.trim();

      // Placeholder check inside line
      if (blockMap[lineTrim]) {
        flushText();
        flushUl();
        flushOl();
        flushQuote();
        flushTable();
        result.push(blockMap[lineTrim]);
        continue;
      }

      // Horizontal rule: --- or ***
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(lineTrim)) {
        flushText();
        flushUl();
        flushOl();
        flushQuote();
        flushTable();
        result.push({ type: 'hr' });
        continue;
      }

      // Headings: #, ##, ###, ####
      const headingMatch = lineTrim.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        flushText();
        flushUl();
        flushOl();
        flushQuote();
        flushTable();
        result.push({
          type: 'heading',
          level: headingMatch[1].length,
          text: headingMatch[2],
        });
        continue;
      }

      // Blockquote: > text
      if (lineTrim.startsWith('>')) {
        flushText();
        flushUl();
        flushOl();
        flushTable();
        currentQuoteLines.push(lineTrim.replace(/^>\s?/, ''));
        continue;
      } else if (currentQuoteLines.length > 0) {
        flushQuote();
      }

      // Table row: | ... |
      if (lineTrim.startsWith('|') && lineTrim.endsWith('|')) {
        flushText();
        flushUl();
        flushOl();
        flushQuote();
        currentTableLines.push(lineTrim);
        continue;
      } else if (currentTableLines.length > 0) {
        flushTable();
      }

      // Unordered list: - item, * item, + item
      const ulMatch = line.match(/^\s*[-*+]\s+(.+)$/);
      if (ulMatch) {
        flushText();
        flushOl();
        flushQuote();
        flushTable();
        currentUlItems.push(ulMatch[1]);
        continue;
      } else if (currentUlItems.length > 0) {
        flushUl();
      }

      // Ordered list: 1. item, 2. item
      const olMatch = line.match(/^\s*\d+\.\s+(.+)$/);
      if (olMatch) {
        flushText();
        flushUl();
        flushQuote();
        flushTable();
        currentOlItems.push(olMatch[1]);
        continue;
      } else if (currentOlItems.length > 0) {
        flushOl();
      }

      // Regular text line
      currentTextLines.push(line);
    }

    flushText();
    flushUl();
    flushOl();
    flushQuote();
    flushTable();
  }

  return result;
}

function renderBlock(block: BlockNode, bIdx: number): React.ReactNode {
  switch (block.type) {
    case 'code':
      return <CodeBlock key={bIdx} code={block.code} language={block.language} />;

    case 'math':
      return <React.Fragment key={bIdx}>{renderKaTeX(block.math, true)}</React.Fragment>;

    case 'heading': {
      if (block.level === 1) {
        return (
          <h1 key={bIdx} className="text-base sm:text-lg font-extrabold text-white mt-4 mb-2 border-b border-white/10 pb-1">
            {parseInlineTokens(block.text)}
          </h1>
        );
      }
      if (block.level === 2) {
        return (
          <h2 key={bIdx} className="text-sm sm:text-base font-bold text-indigo-300 mt-3.5 mb-1.5">
            {parseInlineTokens(block.text)}
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3 key={bIdx} className="text-xs sm:text-sm font-semibold text-zinc-100 mt-3 mb-1">
            {parseInlineTokens(block.text)}
          </h3>
        );
      }
      return (
        <h4 key={bIdx} className="text-xs font-semibold text-zinc-300 mt-2 mb-0.5">
          {parseInlineTokens(block.text)}
        </h4>
      );
    }

    case 'blockquote':
      return (
        <blockquote
          key={bIdx}
          className="my-2.5 rounded-r-xl border-l-3 border-indigo-500 bg-indigo-500/10 px-3.5 py-2 text-xs text-zinc-300 italic shadow-sm"
        >
          {parseInlineTokens(block.text)}
        </blockquote>
      );

    case 'hr':
      return <hr key={bIdx} className="my-3 border-white/10" />;

    case 'table':
      return (
        <div key={bIdx} className="my-3 overflow-x-auto rounded-xl border border-white/10 shadow-md">
          <table className="min-w-full divide-y divide-white/10 text-xs">
            <thead className="bg-zinc-900/90 text-zinc-200">
              <tr>
                {block.headers.map((h, hIdx) => (
                  <th key={hIdx} className="px-3 py-2 text-left font-semibold text-[11px] uppercase tracking-wider text-indigo-300">
                    {parseInlineTokens(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-zinc-950/40 text-zinc-300">
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 whitespace-normal">
                      {parseInlineTokens(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'ul':
      return (
        <ul key={bIdx} className="my-2 space-y-1.5 pl-1 text-zinc-300">
          {block.items.map((item, iIdx) => (
            <li key={iIdx} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
              <span className="flex-1">{parseInlineTokens(item)}</span>
            </li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol key={bIdx} className="my-2 space-y-1.5 pl-1 text-zinc-300">
          {block.items.map((item, iIdx) => (
            <li key={iIdx} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded bg-indigo-500/20 text-[10px] font-bold text-indigo-300 shrink-0 font-mono">
                {iIdx + 1}
              </span>
              <span className="flex-1">{parseInlineTokens(item)}</span>
            </li>
          ))}
        </ol>
      );

    case 'paragraph':
    default:
      return (
        <p key={bIdx} className="mb-2.5 last:mb-0 leading-relaxed text-zinc-200">
          {parseInlineTokens(block.text)}
        </p>
      );
  }
}

export const MathText: React.FC<MathTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const blocks = parseTextToBlocks(content);

  return (
    <div className={`rich-content-root leading-relaxed ${className}`}>
      {blocks.map((b, idx) => renderBlock(b, idx))}
    </div>
  );
};
