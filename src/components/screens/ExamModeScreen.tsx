import React, { useState, useEffect } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { QuestionRenderer } from '../shared/QuestionRenderer';
import { ConfidenceRating, UserAttempt } from '../../types/assessment';
import {
  GraduationCap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ExamModeScreen: React.FC = () => {
  const { questions, activeSubject, navigateTo, submitAttempt, profile } = useAdaptive();

  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [examQuestions] = useState(() => questions.slice(0, 5));
  const [examAttempts, setExamAttempts] = useState<UserAttempt[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);

  useEffect(() => {
    let timer: any = null;
    if (examStarted && !examFinished && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examStarted, examFinished, secondsLeft]);

  const activeQ = examQuestions[currentIdx];

  const handleAnswer = (answer: any, isCorrect: boolean, confidence: ConfidenceRating, timeSec: number) => {
    submitAttempt({
      questionId: activeQ.id,
      conceptId: activeQ.conceptId,
      userAnswer: answer,
      isCorrect,
      score: isCorrect ? 1.0 : 0.0,
      confidenceRating: confidence,
      confidenceScalar: confidence === 'very_confident' ? 0.98 : confidence === 'confident' ? 0.85 : 0.4,
      responseTimeSeconds: timeSec,
      difficultyAtTime: activeQ.difficulty,
    });

    const newAttempt: UserAttempt = {
      id: `exam-${Date.now()}`,
      userId: profile.id || 'learner',
      questionId: activeQ.id,
      conceptId: activeQ.conceptId,
      userAnswer: answer,
      isCorrect,
      score: isCorrect ? 1.0 : 0.0,
      confidenceRating: confidence,
      confidenceScalar: confidence === 'very_confident' ? 0.98 : confidence === 'confident' ? 0.85 : 0.4,
      responseTimeSeconds: timeSec,
      wasGuessEstimated: false,
      timestamp: new Date().toISOString(),
      difficultyAtTime: activeQ.difficulty,
    };

    setExamAttempts(prev => [...prev, newAttempt]);
  };

  const handleNext = () => {
    if (currentIdx + 1 < examQuestions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setExamFinished(true);
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {
        // ignore
      }
    }
  };

  const formatTimer = () => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // If exam is not yet started, show pre-exam briefing
  if (!examStarted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/80 p-8 text-center backdrop-blur-2xl shadow-2xl space-y-6 animate-in fade-in duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/20">
          <GraduationCap className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Adaptive Exam Simulation
          </h2>
          <p className="mt-2 text-xs text-zinc-300 leading-relaxed max-w-lg mx-auto">
            Simulate realistic exam pressure with strict time limits and multi-topic question distributions. Your performance will generate an actionable <strong>Exam Intelligence Report</strong>.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-zinc-950/60 p-4 font-mono text-xs text-zinc-300">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Duration</span>
            <span className="text-base font-bold text-white">15 Minutes</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Questions</span>
            <span className="text-base font-bold text-indigo-400">5 Adaptive Items</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Domain</span>
            <span className="text-base font-bold text-emerald-400">{activeSubject.name}</span>
          </div>
        </div>

        <button
          onClick={() => setExamStarted(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <span>Begin Timed Exam Simulation</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // If exam finished, render the EXAM INTELLIGENCE REPORT
  if (examFinished) {
    const totalItems = Math.max(1, examAttempts.length);
    const correctCount = examAttempts.filter(a => a.isCorrect).length;
    const scorePct = Math.round((correctCount / totalItems) * 100);
    const estimatedReadiness = Math.min(99, Math.max(10, Math.round(scorePct * 0.95 + 5)));

    // Dynamic calibration gap
    const totalGap = examAttempts.reduce((acc, att) => {
      const actualScore = att.isCorrect ? 1.0 : 0.0;
      return acc + Math.abs(att.confidenceScalar - actualScore);
    }, 0);
    const avgGapPct = Math.round((totalGap / totalItems) * 100);

    // Concept stats from exam attempts
    const conceptStats: Record<string, { name: string; total: number; correct: number }> = {};
    examAttempts.forEach(att => {
      const q = questions.find(item => item.id === att.questionId);
      const name = q?.conceptName || att.conceptId;
      if (!conceptStats[att.conceptId]) {
        conceptStats[att.conceptId] = { name, total: 0, correct: 0 };
      }
      conceptStats[att.conceptId].total += 1;
      if (att.isCorrect) conceptStats[att.conceptId].correct += 1;
    });

    const statList = Object.values(conceptStats);
    const strongest = [...statList].sort((a, b) => (b.correct / b.total) - (a.correct / a.total))[0];
    const weakest = [...statList].sort((a, b) => (a.correct / a.total) - (b.correct / b.total))[0];

    const strongestDomain = strongest ? `${strongest.name}` : activeSubject.name;
    const weakestArea = weakest && weakest.correct < weakest.total
      ? `${weakest.name}`
      : 'None (Perfect Accuracy)';

    // Misconceptions detected
    const misconceptionsFound = examAttempts
      .filter(a => !a.isCorrect && a.detectedMisconception)
      .map(a => a.detectedMisconception!);

    // Dynamic Action Items
    const actionItems: string[] = [];
    if (weakest && weakest.correct < weakest.total) {
      actionItems.push(`Complete a focused review session on ${weakest.name} to reinforce core mechanisms.`);
    }
    if (misconceptionsFound.length > 0) {
      actionItems.push(`Review the ${misconceptionsFound[0].title} remediation advice before the next exam.`);
    }
    if (actionItems.length === 0) {
      actionItems.push(`Maintain your high mastery with regular spaced retrieval sessions across ${activeSubject.name}.`);
    }

    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-12 animate-in zoom-in-95 duration-200">
        {/* Exam Report Card */}
        <div className="rounded-3xl border border-indigo-500/30 bg-zinc-900/90 p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase">
                Diagnostic Analysis
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-white">
                EXAM INTELLIGENCE REPORT
              </h2>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-3 text-center font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block">Score</span>
              <span className="text-2xl font-bold text-white">{scorePct}%</span>
            </div>
          </div>

          {/* Diagnostic Metrics Matrix */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-xs">
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3">
              <span className="text-zinc-500 block text-[10px] uppercase">Estimated Readiness</span>
              <span className="text-lg font-bold text-emerald-400">{estimatedReadiness}%</span>
            </div>
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3">
              <span className="text-zinc-500 block text-[10px] uppercase">Strongest Domain</span>
              <span className="text-sm font-bold text-indigo-300 truncate block">{strongestDomain}</span>
            </div>
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3">
              <span className="text-zinc-500 block text-[10px] uppercase">Weakest Area</span>
              <span className="text-sm font-bold text-amber-300 truncate block">{weakestArea}</span>
            </div>
            <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-3">
              <span className="text-zinc-500 block text-[10px] uppercase">Calibration Gap</span>
              <span className="text-lg font-bold text-cyan-400">{avgGapPct}%</span>
            </div>
          </div>

          {/* High-Risk Misconception Flag if any */}
          {misconceptionsFound.length > 0 ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Misconception Detected: {misconceptionsFound[0].title}</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {misconceptionsFound[0].explanation}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Clean Epistemic Execution</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                No high-risk misconceptions or persistent error patterns were triggered during this assessment.
              </p>
            </div>
          )}

          {/* Recommended Action Plan */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Recommended Action Items</span>
            </div>
            <div className="space-y-2 text-xs text-zinc-300">
              {actionItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigateTo('dashboard')}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg hover:bg-indigo-700 cursor-pointer"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => navigateTo('knowledge_galaxy')}
              className="flex-1 rounded-xl border border-white/10 bg-zinc-900 py-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800 cursor-pointer"
            >
              View Updated Knowledge Galaxy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Exam In Progress
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Active Exam Header with Clock */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/80 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-400" />
          <span className="text-xs font-bold text-white">Exam Simulation in Progress</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-mono">
            Item {currentIdx + 1} of {examQuestions.length}
          </span>
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTimer()}</span>
          </div>
        </div>
      </div>

      {activeQ && (
        <QuestionRenderer
          key={activeQ.id}
          question={activeQ}
          onSubmitAnswer={handleAnswer}
          onNextQuestion={handleNext}
          isLastQuestion={currentIdx + 1 === examQuestions.length}
        />
      )}
    </div>
  );
};
