import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { ExamPreparationPlan } from '../../types/document';
import {
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  PlayCircle,
} from 'lucide-react';

export const StudyPlannerScreen: React.FC = () => {
  const { concepts, userConceptStates, activeSubject, profile, navigateTo } = useAdaptive();

  const activeConcepts = concepts.filter(c => c.subjectId === activeSubject.id);

  const examName = profile.examName || `${activeSubject.name} Comprehensive Mastery`;
  const daysRemaining = Math.max(7, activeConcepts.length + 2);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate dynamic plan from active subject concepts
  const generateDynamicPlan = (): ExamPreparationPlan['dailyBreakdown'] => {
    const list = activeConcepts.map((c, idx) => {
      const state = userConceptStates[c.id];
      const mastery = state?.masteryScore ?? 0;
      const retention = state?.retentionScore ?? 1.0;
      const isCompleted = mastery >= 0.8;

      let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      let rationale = `Core concept progression in ${activeSubject.name}.`;

      if (retention < 0.65) {
        priority = 'critical';
        rationale = 'Urgent memory consolidation: Spaced retrieval decay alert.';
      } else if (mastery < 0.3) {
        priority = 'high';
        rationale = 'Foundational building block: Establish core procedural intuition.';
      } else if (isCompleted) {
        priority = 'low';
        rationale = 'Mastered concept: Retained in long-term memory lattice.';
      }

      return {
        dayNumber: idx + 1,
        date: `Day ${idx + 1}`,
        focusTopic: `${c.name} (${c.shortCode})`,
        targetConcepts: [c.id],
        estimatedMinutes: Math.round(15 + c.difficultyBase * 20),
        isCompleted,
        priority,
        rationale,
      };
    });

    // Add final synthesis review day
    list.push({
      dayNumber: list.length + 1,
      date: `Day ${list.length + 1}`,
      focusTopic: `${activeSubject.name} Comprehensive Synthesis & Mock Exam`,
      targetConcepts: activeConcepts.map(c => c.id),
      estimatedMinutes: 45,
      isCompleted: profile.overallMastery >= 0.9,
      priority: 'critical',
      rationale: 'Timed interleaved diagnostic across all curriculum units.',
    });

    return list;
  };

  const [studyPlan, setStudyPlan] = useState<ExamPreparationPlan['dailyBreakdown']>(generateDynamicPlan);

  const handleRecalculatePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setStudyPlan(generateDynamicPlan());
      setIsGenerating(false);
    }, 600);
  };

  const completedDays = studyPlan.filter(d => d.isCompleted).length;
  const progressPct = studyPlan.length > 0 ? Math.round((completedDays / studyPlan.length) * 100) : 0;
  const firstIncomplete = studyPlan.find(d => !d.isCompleted);
  const activeTodayDayNumber = firstIncomplete ? firstIncomplete.dayNumber : (studyPlan[0]?.dayNumber || 1);

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
              <span className="text-sm font-bold text-emerald-400">{Math.round((profile.overallMastery ?? 0) * 100)}%</span>
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
            const isToday = day.dayNumber === activeTodayDayNumber;

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
