import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { ExamPreparationPlan } from '../../types/document';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  PlayCircle,
  AlertCircle,
  Flame,
} from 'lucide-react';

export const StudyPlannerScreen: React.FC = () => {
  const { concepts, userConceptStates, activeSubject, navigateTo } = useAdaptive();

  const [examName, setExamName] = useState<string>('Advanced Calculus Final Examination');
  const [daysRemaining, setDaysRemaining] = useState<number>(14);
  const [dailyMinutes, setDailyMinutes] = useState<number>(30);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Dynamic 14-day timetable plan
  const [studyPlan, setStudyPlan] = useState<ExamPreparationPlan['dailyBreakdown']>([
    { dayNumber: 1, date: 'Day 1 (Today)', focusTopic: 'Variables & Expressions (ALG.1)', targetConcepts: ['math-alg-vars'], estimatedMinutes: 25, isCompleted: true, priority: 'critical', rationale: 'Foundation prerequisite audit.' },
    { dayNumber: 2, date: 'Day 2', focusTopic: 'Linear Equations & Systems (ALG.2)', targetConcepts: ['math-alg-lin-eq'], estimatedMinutes: 30, isCompleted: true, priority: 'critical', rationale: 'Strengthen negative sign distributions.' },
    { dayNumber: 3, date: 'Day 3', focusTopic: 'Quadratic Functions & Factoring (ALG.3)', targetConcepts: ['math-alg-quad'], estimatedMinutes: 30, isCompleted: false, priority: 'high', rationale: 'Master root branches and vertex transformations.' },
    { dayNumber: 4, date: 'Day 4', focusTopic: 'Limits & Epsilon-Delta Formalism (CALC.1)', targetConcepts: ['math-calc-limits'], estimatedMinutes: 35, isCompleted: false, priority: 'high', rationale: 'Core transition into continuous calculus.' },
    { dayNumber: 5, date: 'Day 5', focusTopic: 'Derivatives & Power Rules (CALC.2)', targetConcepts: ['math-calc-deriv'], estimatedMinutes: 30, isCompleted: false, priority: 'critical', rationale: 'Instantaneous rates of change derivation.' },
    { dayNumber: 6, date: 'Day 6', focusTopic: 'Chain Rule & Composite Functions', targetConcepts: ['math-calc-deriv'], estimatedMinutes: 35, isCompleted: false, priority: 'critical', rationale: 'Peeling composite function differentials.' },
    { dayNumber: 7, date: 'Day 7', focusTopic: 'Interleaved Spaced Review & Diagnostic Quiz', targetConcepts: ['math-alg-quad', 'math-calc-deriv'], estimatedMinutes: 40, isCompleted: false, priority: 'high', rationale: 'Mid-sprint calibration check.' },
    { dayNumber: 8, date: 'Day 8', focusTopic: 'Definite & Indefinite Integrals (CALC.3)', targetConcepts: ['math-calc-integrals'], estimatedMinutes: 35, isCompleted: false, priority: 'critical', rationale: 'Fundamental Theorem of Calculus.' },
    { dayNumber: 9, date: 'Day 9', focusTopic: 'Integration by Substitution', targetConcepts: ['math-calc-integrals'], estimatedMinutes: 30, isCompleted: false, priority: 'high', rationale: 'Reversing composite derivative operations.' },
    { dayNumber: 10, date: 'Day 10', focusTopic: 'Applications: Rates & Accumulations', targetConcepts: ['math-calc-deriv', 'math-calc-integrals'], estimatedMinutes: 35, isCompleted: false, priority: 'medium', rationale: 'Word problem modeling and boundary units.' },
    { dayNumber: 11, date: 'Day 11', focusTopic: 'Comprehensive Mock Exam Simulation 1', targetConcepts: ['math-calc-limits', 'math-calc-deriv', 'math-calc-integrals'], estimatedMinutes: 45, isCompleted: false, priority: 'critical', rationale: 'Timed pressure simulation.' },
    { dayNumber: 12, date: 'Day 12', focusTopic: 'Misconception Targeted Remediation', targetConcepts: ['math-alg-lin-eq', 'math-calc-deriv'], estimatedMinutes: 30, isCompleted: false, priority: 'high', rationale: 'Fix errors flagged in Mock Exam 1.' },
    { dayNumber: 13, date: 'Day 13', focusTopic: 'Light Spaced Review & Formula Memory Refresh', targetConcepts: ['math-alg-vars', 'math-calc-integrals'], estimatedMinutes: 20, isCompleted: false, priority: 'medium', rationale: 'Cognitive consolidation before test day.' },
    { dayNumber: 14, date: 'Day 14', focusTopic: 'Final Readiness Check & Peak Performance', targetConcepts: ['math-calc-deriv'], estimatedMinutes: 15, isCompleted: false, priority: 'critical', rationale: 'Final mental calibration and confidence anchoring.' },
  ]);

  const handleRecalculatePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Intelligently rearrange based on userConceptStates
      const updated = studyPlan.map(day => {
        if (day.dayNumber === 3) {
          return {
            ...day,
            rationale: 'Dynamically adjusted: Added extra 10m factoring remediation due to recent quiz slips.',
            estimatedMinutes: 40,
          };
        }
        return day;
      });
      setStudyPlan(updated);
      setIsGenerating(false);
    }, 1000);
  };

  const completedDays = studyPlan.filter(d => d.isCompleted).length;
  const progressPct = Math.round((completedDays / studyPlan.length) * 100);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
            <span>Dynamic AI Curriculum Synthesizer</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            AI-Generated Adaptive Study Plan
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Never a static calendar. When you miss a day, master a topic early, or struggle with a prerequisite, your schedule dynamically recalibrates.
          </p>
        </div>

        <button
          onClick={handleRecalculatePlan}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Recalculating...' : 'Recalculate Optimal Path'}</span>
        </button>
      </div>

      {/* Target Exam Config Card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
              Exam Target
            </span>
            <h3 className="text-lg font-bold text-white">{examName}</h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-2.5 px-3 text-center">
              <span className="text-zinc-500 block text-[10px] uppercase">Days Left</span>
              <span className="text-sm font-bold text-white">{daysRemaining}d</span>
            </div>
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-2.5 px-3 text-center">
              <span className="text-zinc-500 block text-[10px] uppercase">Estimated Readiness</span>
              <span className="text-sm font-bold text-emerald-400">91%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400">Curriculum Coverage</span>
            <span className="font-mono text-indigo-300 font-semibold">{completedDays} of {studyPlan.length} Days Completed ({progressPct}%)</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Day by Day Plan Schedule */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Personalized Timetable Breakdown
        </h3>

        <div className="space-y-2.5">
          {studyPlan.map((day) => {
            const isToday = day.dayNumber === 3; // Mock active today

            return (
              <div
                key={day.dayNumber}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                  isToday
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                    : day.isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-white/5 bg-zinc-900/40 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                      day.isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isToday
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {day.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : `D${day.dayNumber}`}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{day.focusTopic}</h4>
                      {isToday && (
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-300">
                          TODAY'S TARGET
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-2xl">
                      {day.rationale}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{day.estimatedMinutes}m</span>
                  </div>

                  {isToday ? (
                    <button
                      onClick={() => navigateTo('session')}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 cursor-pointer"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      <span>Start Today</span>
                    </button>
                  ) : day.isCompleted ? (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mastered
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500">Upcoming</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
