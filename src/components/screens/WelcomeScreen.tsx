import React from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Compass,
  Bot,
  RotateCcw,
  UserPlus,
  LogIn,
} from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { navigateTo } = useAdaptive();

  return (
    <div className="mx-auto max-w-4xl space-y-12 py-8 pb-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-4 py-1.5 text-xs font-semibold text-indigo-300">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>The Application Adapts to You — Not You to the Curriculum</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">ADAPTIVE</span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm text-zinc-300 sm:text-base leading-relaxed">
          An AI-native personalized learning platform grounded in Bayesian Knowledge Tracing, FSRS spaced repetition, and multi-modal Socratic tutoring.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigateTo('auth')}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 hover:from-indigo-600 hover:to-indigo-700 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Account / Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => navigateTo('dashboard')}
            className="rounded-2xl border border-white/10 bg-zinc-900/80 px-6 py-4 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            Explore Demo / Dashboard
          </button>
        </div>
      </div>

      {/* 3 Core Scientific Pillars */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-3">
          <div className="rounded-2xl bg-indigo-500/20 p-3 text-indigo-400 w-fit">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">Dynamic Knowledge Galaxy</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Real-time visual concept manifold tracking prerequisites, continuous difficulty scalars, and epistemic bottlenecks.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-3">
          <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-400 w-fit">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">9-Mode Socratic AI Mentor</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Powered by Gemini 2.5 with live voice input, Socratic inquiry, deep mathematical proofs, analogies, and Teach-Me evaluations.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-3">
          <div className="rounded-2xl bg-amber-500/20 p-3 text-amber-400 w-fit">
            <RotateCcw className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">FSRS Spaced Repetition</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Empirical half-life memory models that calculate the exact optimal review window before concepts begin to fade.
          </p>
        </div>
      </div>
    </div>
  );
};
