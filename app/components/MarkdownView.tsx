'use client';

import React, { useMemo } from 'react';
import {
  User,
  Briefcase,
  Heart,
  Shield,
  Sparkles,
  Star,
  Sun,
  Moon,
  CircleDot,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Lightweight markdown renderer tailored for Gemini kundali interpretations.
// Supports: ## / ### headings, bullet lists, numbered lists, **bold**, *italic*,
// inline `code`, horizontal rules (---), and plain paragraphs.
// No external dependency — safe for client bundles.
// ---------------------------------------------------------------------------

interface Block {
  type: 'heading' | 'bullet' | 'numbered' | 'paragraph' | 'hr';
  level?: number;
  lines: string[];
}

/** Map a heading's text to an icon + accent color for the known sections. */
function headingTheme(text: string): { icon: React.ReactNode; accent: string } {
  const t = text.toLowerCase();
  if (t.includes('personality') || t.includes('व्यक्तित्व')) {
    return { icon: <User className="w-4 h-4" />, accent: 'text-violet-600 dark:text-[#C792EA]' };
  }
  if (t.includes('career') || t.includes('profession') || t.includes('करियर')) {
    return { icon: <Briefcase className="w-4 h-4" />, accent: 'text-indigo-600 dark:text-[#82AAFF]' };
  }
  if (t.includes('relationship') || t.includes('love') || t.includes('marriage') || t.includes('संबंध')) {
    return { icon: <Heart className="w-4 h-4" />, accent: 'text-rose-500 dark:text-[#FF8A80]' };
  }
  if (t.includes('dosha') || t.includes('remedy') || t.includes('दोष') || t.includes('उपाय')) {
    return { icon: <Shield className="w-4 h-4" />, accent: 'text-amber-600 dark:text-[#FFD166]' };
  }
  if (t.includes('health') || t.includes('स्वास्थ्य')) {
    return { icon: <CircleDot className="w-4 h-4" />, accent: 'text-emerald-600 dark:text-[#69F0AE]' };
  }
  if (t.includes('moon') || t.includes('चंद्र')) {
    return { icon: <Moon className="w-4 h-4" />, accent: 'text-sky-600 dark:text-[#89DDFF]' };
  }
  if (t.includes('sun') || t.includes('lagna') || t.includes('ascendant') || t.includes('सूर्य') || t.includes('लग्न')) {
    return { icon: <Sun className="w-4 h-4" />, accent: 'text-orange-500 dark:text-[#F78C6C]' };
  }
  if (t.includes('yoga') || t.includes('योग')) {
    return { icon: <Star className="w-4 h-4" />, accent: 'text-fuchsia-600 dark:text-[#C792EA]' };
  }
  return { icon: <Sparkles className="w-4 h-4" />, accent: 'text-violet-600 dark:text-[#FFD166]' };
}

/** Parse raw markdown into structured blocks. */
function parseBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.replace(/\r\n/g, '\n').split('\n');

  let current: Block | null = null;

  const flush = () => {
    if (current && current.lines.length > 0) blocks.push(current);
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();

    // Blank line → close current block
    if (!line) {
      flush();
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flush();
      blocks.push({ type: 'hr', lines: [] });
      continue;
    }

    // Headings (# .. ####)
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flush();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        lines: [headingMatch[2].trim()],
      });
      continue;
    }

    // Bullet list items (-, *, •)
    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (!current || current.type !== 'bullet') {
        flush();
        current = { type: 'bullet', lines: [] };
      }
      current.lines.push(bulletMatch[1].trim());
      continue;
    }

    // Numbered list items (1., 2), etc.)
    const numMatch = line.match(/^(\d{1,2})[.)]\s+(.*)$/);
    if (numMatch) {
      if (!current || current.type !== 'numbered') {
        flush();
        current = { type: 'numbered', lines: [] };
      }
      current.lines.push(numMatch[2].trim());
      continue;
    }

    // Plain paragraph line — accumulate consecutive lines into one paragraph
    if (!current || (current.type !== 'paragraph' && current.type !== 'bullet' && current.type !== 'numbered')) {
      flush();
      current = { type: 'paragraph', lines: [] };
    }
    current.lines.push(line);
  }
  flush();

  return blocks;
}

/** Render inline markdown (**bold**, *italic*, `code`) as React nodes. */
function renderInline(text: string): React.ReactNode[] {
  // Split on bold first, then italic/code within each segment.
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-semibold text-indigo-950 dark:text-[#F3F4F6]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`')) {
      parts.push(
        <code key={key++} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[0.85em] font-mono">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export default function MarkdownView({ content, className = '' }: MarkdownViewProps) {
  const blocks = useMemo(() => parseBlocks(content ?? ''), [content]);

  if (!blocks.length) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'hr':
            return (
              <div key={i} className="flex items-center gap-3 py-1" role="separator">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/70 dark:via-white/15 to-transparent" />
                <Sparkles className="w-3 h-3 text-violet-400/60 dark:text-[#FFD166]/50" />
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/70 dark:via-white/15 to-transparent" />
              </div>
            );

          case 'heading': {
            const text = block.lines.join(' ');
            const theme = headingTheme(text);
            const isTopLevel = (block.level ?? 2) <= 2;
            return (
              <div key={i} className={isTopLevel ? 'pt-1' : ''}>
                <h3
                  className={`flex items-center gap-2 font-serif font-bold ${
                    isTopLevel ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                  } ${theme.accent}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                    isTopLevel
                      ? 'bg-violet-100/70 dark:bg-[#FFD166]/10'
                      : 'bg-slate-100/70 dark:bg-white/[0.04]'
                  }`}>
                    {theme.icon}
                  </span>
                  {renderInline(text)}
                </h3>
              </div>
            );
          }

          case 'bullet':
            return (
              <ul key={i} className="space-y-1.5 pl-1">
                {block.lines.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                    <span className="mt-[0.55em] w-1.5 h-1.5 rounded-full shrink-0 bg-gradient-to-br from-violet-500 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D]" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );

          case 'numbered':
            return (
              <ol key={i} className="space-y-1.5 pl-1">
                {block.lines.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                    <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 text-[10px] font-bold bg-violet-100 dark:bg-[#FFD166]/10 text-violet-700 dark:text-[#FFD166]">
                      {j + 1}
                    </span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            );

          case 'paragraph':
          default:
            return (
              <p key={i} className="text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                {renderInline(block.lines.join(' '))}
              </p>
            );
        }
      })}
    </div>
  );
}