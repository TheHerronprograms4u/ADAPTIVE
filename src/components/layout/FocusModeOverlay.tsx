import React, { useState, useEffect } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { Play, Pause, RotateCcw, Minimize2, Sparkles, Send, Bot, CheckCircle2 } from 'lucide-react';
import { askGroqTutor } from '../../lib/groq';
import { MathText } from '../shared/MathText';

export const FocusModeOverlay: React.FC = () => {
  const {
    isFocusModeActive,
    toggleFocusMode,
    selectedConcept,
    profile,
    userConceptStates,
  } = useAdaptive();

  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [focusNote, setFocusNote] = useState<string>('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([
    'Derive chain rule for composite differentials',
  ]);
  const [newTaskInput, setNewTaskInput] = useState<string>('');

  const [quickTutorPrompt, setQuickTutorPrompt] = useState<string>('');
  const [tutorReply, setTutorReply] = useState<string>('');
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isFocusModeActive && isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusModeActive, isRunning, secondsRemaining]);

  if (!isFocusModeActive) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleAskQuickTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTutorPrompt.trim()) return;

    setIsTutorLoading(true);
    const conceptName = selectedConcept?.name || 'Calculus Foundations';
    const conceptSummary = selectedConcept?.summary || 'Foundational mathematical theory';
    const mastery = selectedConcept ? (userConceptStates[selectedConcept.id]?.masteryScore || 0.7) : 0.7;

    const answer = await askGroqTutor({
      learnerName: profile.name,
      educationLevel: profile.educationLevel,
      conceptName,
      conceptSummary,
      learnerMastery: mastery,
      knownMisconceptions: [],
      mode: 'socratic',
      userMessage: quickTutorPrompt,
      conversationHistory: [],
    });

    setTutorReply(answer);
    setIsTutorLoading(false);
    setQuickTutorPrompt('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setCompletedTasks((prev) => [...prev, newTaskInput.trim()]);
    setNewTaskInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/98 p-6 text-zinc-100 backdrop-blur-3xl animate-in fade-in duration-200 overflow-y-auto">
      {/* Focus Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Deep Cognitive Focus Mode
            </h2>
            <p className="text-xs text-zinc-400">
              Zero distraction environment • Current Target: <span className="text-indigo-300 font-medium">{selectedConcept?.name || 'Active Concept'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={toggleFocusMode}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <Minimize2 className="h-4 w-4" />
          <span>Exit Focus</span>
        </button>
      </div>

      {/* Main Focus Content */}
      <div className="mx-auto mt-8 flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
        {/* Pomodoro Timer */}
        <div className="mb-4 font-mono text-7xl font-extrabold tracking-tight text-white sm:text-8xl">
          {formattedTime}
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all cursor-pointer"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsRemaining(25 * 60);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset (25m)</span>
          </button>
        </div>

        {/* Micro Checklist */}
        <div className="mt-10 w-full rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
            <span>Active Sprint Objectives</span>
          </h3>

          <div className="space-y-2">
            {completedTasks.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{t}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTask} className="mt-3 flex gap-2">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              placeholder="Add next micro-milestone..."
              className="glass-input flex-1 rounded-xl px-3 py-1.5 text-xs"
            />
            <button
              type="submit"
              className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
            >
              Add
            </button>
          </form>
        </div>

        {/* Minimal Embedded Socratic Tutor in Focus Mode */}
        <div className="mt-6 w-full rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Focus AI Mentor
            </h4>
          </div>

          {tutorReply && (
            <div className="mb-4 rounded-xl border border-white/5 bg-zinc-950/70 p-3 text-xs text-zinc-200 leading-relaxed max-h-40 overflow-y-auto">
              <MathText content={tutorReply} />
            </div>
          )}

          <form onSubmit={handleAskQuickTutor} className="flex gap-2">
            <input
              type="text"
              value={quickTutorPrompt}
              onChange={(e) => setQuickTutorPrompt(e.target.value)}
              placeholder="Ask for an intuitive analogy, proof hint, or Socratic clue..."
              className="glass-input flex-1 rounded-xl px-3 py-2 text-xs"
            />
            <button
              type="submit"
              disabled={isTutorLoading || !quickTutorPrompt.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-40"
            >
              {isTutorLoading ? <Sparkles className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
