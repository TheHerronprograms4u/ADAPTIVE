import React from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { QuestionRenderer } from '../shared/QuestionRenderer';
import { ConfidenceRating } from '../../types/assessment';
import {
  Sparkles,
  Activity,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Compass,
  Layers,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DiagnosticScreen: React.FC = () => {
  const {
    diagnosticState,
    submitDiagnosticAnswer,
    finishDiagnostic,
    activeSubject,
    startDiagnostic,
    concepts,
  } = useAdaptive();

  if (!diagnosticState) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/80 p-8 text-center backdrop-blur-2xl shadow-2xl space-y-6 animate-in fade-in duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/20">
          <Activity className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Initial Computerized Adaptive Diagnostic
          </h2>
          <p className="mt-2 text-xs text-zinc-300 leading-relaxed max-w-lg mx-auto">
            Before building your learning path, our Bayesian engine performs an adaptive diagnostic assessment to detect prerequisite boundaries, classify misconception patterns, and generate your baseline <strong>Knowledge Galaxy</strong>.
          </p>
        </div>

        <button
          onClick={() => startDiagnostic(activeSubject.id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <span>Launch Adaptive Diagnostic for {activeSubject.name}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const currentQ = diagnosticState.questions[diagnosticState.currentQuestionIndex];
  const isComplete = diagnosticState.isComplete || !currentQ;

  const handleAnswerSubmit = (answer: any, isCorrect: boolean, confidence: ConfidenceRating, timeSec: number) => {
    submitDiagnosticAnswer(answer, confidence, timeSec);
  };

  const handleNext = () => {
    if (isComplete) {
      finishDiagnostic();
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (e) {}
    }
  };

  // If Diagnostic Completed, show the Generated Knowledge Map synthesis
  if (isComplete) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-12 animate-in zoom-in-95 duration-200">
        <div className="rounded-3xl border border-emerald-500/30 bg-zinc-900/90 p-8 backdrop-blur-2xl shadow-2xl space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Compass className="h-8 w-8" />
          </div>

          <div>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 uppercase">
              Bayesian Convergence Achieved
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-white">
              INITIAL KNOWLEDGE GALAXY SYNTHESIZED
            </h2>
            <p className="mt-1 text-xs text-zinc-300 max-w-lg mx-auto">
              Sufficient statistical confidence reached. We mapped your cognitive strengths, weak prerequisite bottlenecks, and initial difficulty baseline.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-zinc-950/60 p-4 font-mono text-xs text-zinc-300 text-left">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Estimated Ability (θ)</span>
              <span className="text-lg font-bold text-white">{diagnosticState.estimatedAbilityTheta > 0 ? `+${diagnosticState.estimatedAbilityTheta}` : diagnosticState.estimatedAbilityTheta}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Calibrated Difficulty</span>
              <span className="text-lg font-bold text-indigo-400">{(diagnosticState.continuousDifficulty * 100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Standard Error</span>
              <span className="text-lg font-bold text-emerald-400">±{diagnosticState.abilityStandardError.toFixed(2)}</span>
            </div>
          </div>

          {/* Diagnostic Strengths & Bottlenecks */}
          {(() => {
            const strengthNames = diagnosticState.detectedStrengths
              .map(cid => concepts.find(c => c.id === cid)?.name)
              .filter(Boolean);

            const weakNames = diagnosticState.detectedWeakPrerequisites
              .map(cid => concepts.find(c => c.id === cid)?.name)
              .filter(Boolean);

            return (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Verified Strengths</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {strengthNames.length > 0
                      ? `Demonstrated solid conceptual mastery on: ${strengthNames.join(', ')}.`
                      : `Core baseline mechanics calibrated across ${activeSubject.name}.`}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    <span>Targeted Prerequisite Focus</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {weakNames.length > 0
                      ? `Recommended scaffolded reinforcement on: ${weakNames.join(', ')}.`
                      : 'No critical prerequisite bottlenecks flagged; ready for direct advancement.'}
                  </p>
                </div>
              </div>
            );
          })()}

          <button
            onClick={finishDiagnostic}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <span>Explore Your Interactive Knowledge Galaxy</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12 animate-in fade-in duration-200">
      {/* CAT Dynamic Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-bold text-white">Computerized Adaptive Testing (CAT)</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <span>Question {diagnosticState.currentQuestionIndex + 1} of {diagnosticState.totalQuestionsPlanned}</span>
          <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-indigo-300 font-semibold">
            Difficulty: {(diagnosticState.continuousDifficulty * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {currentQ && (
        <QuestionRenderer
          question={currentQ}
          onSubmitAnswer={handleAnswerSubmit}
          onNextQuestion={handleNext}
          isLastQuestion={diagnosticState.currentQuestionIndex + 1 === diagnosticState.totalQuestionsPlanned}
        />
      )}
    </div>
  );
};
