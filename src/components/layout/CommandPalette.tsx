import React, { useState, useEffect } from 'react';
import { useAdaptive, ScreenName } from '../../context/AdaptiveContext';
import {
  Search,
  BookOpen,
  Bot,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Command,
  ArrowRight,
  Compass,
  FileText,
  UserCheck,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    concepts,
    navigateTo,
    startDynamicSession,
  } = useAdaptive();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredConcepts = concepts.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.summary.toLowerCase().includes(query.toLowerCase()) ||
    c.shortCode.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2.5">
          <Search className="h-4 w-4 text-indigo-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, launch AI tutor mode, or switch learners..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-1 pr-1">
          {/* Quick Actions */}
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Intelligent Quick Actions
          </div>

          <button
            onClick={() => {
              startDynamicSession();
              setIsCommandPaletteOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-zinc-200 hover:bg-indigo-600 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <PlayCircle className="h-4 w-4 text-emerald-400 group-hover:text-white" />
              <span>Launch Today's 5-Stage Adaptive Session</span>
            </div>
            <ArrowRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => {
              navigateTo('tutor');
              setIsCommandPaletteOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-zinc-200 hover:bg-indigo-600 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Bot className="h-4 w-4 text-indigo-400 group-hover:text-white" />
              <span>Ask AI Tutor Socratic Question</span>
            </div>
            <ArrowRight className="h-3 w-3 opacity-60" />
          </button>

          <button
            onClick={() => {
              navigateTo('knowledge_galaxy');
              setIsCommandPaletteOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-zinc-200 hover:bg-indigo-600 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="h-4 w-4 text-cyan-400 group-hover:text-white" />
              <span>Open Knowledge Galaxy Graph</span>
            </div>
            <ArrowRight className="h-3 w-3 opacity-60" />
          </button>

          {/* Concepts Section */}
          <div className="mt-3 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Concepts in Active Domain
          </div>
          {filteredConcepts.slice(0, 6).map((concept) => (
            <button
              key={concept.id}
              onClick={() => {
                navigateTo('concept_detail', { conceptId: concept.id });
                setIsCommandPaletteOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] text-indigo-400 font-semibold">
                  {concept.shortCode}
                </span>
                <span className="font-medium text-zinc-100">{concept.name}</span>
              </div>
              <span className="text-[10px] text-zinc-500">
                Difficulty {(concept.difficultyBase * 100).toFixed(0)}%
              </span>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-2 flex items-center justify-between border-t border-white/5 px-2 pt-2 text-[11px] text-zinc-500">
          <span>Navigate with ⌘K / Ctrl+K</span>
          <span>Adaptive Educational Operating System</span>
        </div>
      </div>
    </div>
  );
};
