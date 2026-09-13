import React, { useState, useRef, useEffect } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { PRELIMINARY_EXAM_QUESTIONS } from '../../data/preliminaryQuestions';
import { PreliminaryExamAttempt, PreliminaryExamResult } from '../../types/preliminaryExam';
import { ConfidenceRating } from '../../types/assessment';
import { MathText } from '../shared/MathText';
import { ConfidenceSelector } from '../shared/ConfidenceSelector';
import {
  Brain,
  Clock,
  ArrowRight,
  Bot,
  Zap,
  Target,
  Compass,
  Activity,
  Layers,
  ShieldCheck,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PreliminaryExamScreenProps {
  onComplete?: (result: PreliminaryExamResult) => void;
}

export const PreliminaryExamScreen: React.FC<PreliminaryExamScreenProps> = ({ onComplete }) => {
  const {
    submitPreliminaryAttempt,
    finishPreliminaryExam,
    preliminaryAttempts,
    preliminaryResult,
    navigateTo,
    profile,
  } = useAdaptive();

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [confidence, setConfidence] = useState<ConfidenceRating>('confident');
  const [responseTime, setResponseTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(Boolean(profile.preliminaryExamTaken && preliminaryResult));
  const [localResult, setLocalResult] = useState<PreliminaryExamResult | null>(preliminaryResult || null);

  const startTimeRef = useRef<number>(0);

  const activeQuestion = PRELIMINARY_EXAM_QUESTIONS[currentIdx];

  useEffect(() => {
    startTimeRef.current = Date.now();
    setResponseTime(0);
    setSelectedOption('');
    setConfidence('confident');

    const interval = window.setInterval(() => {
      setResponseTime(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIdx]);

  const handleNextQuestion = () => {
    if (!selectedOption || !activeQuestion) return;

    const opt = activeQuestion.options.find(o => o.id === selectedOption);
    const isCorrect = Boolean(opt?.isCorrect);
    const finalTime = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    const confScalar =
      confidence === 'very_confident' ? 0.98 :
      confidence === 'confident' ? 0.85 :
      confidence === 'somewhat_confident' ? 0.60 :
      confidence === 'unsure' ? 0.35 : 0.15;

    const attempt: PreliminaryExamAttempt = {
      questionId: activeQuestion.id,
      probeType: activeQuestion.probeType,
      userAnswer: selectedOption,
      isCorrect,
      confidenceRating: confidence,
      confidenceScalar: confScalar,
      responseTimeSeconds: finalTime,
    };

    submitPreliminaryAttempt(attempt);

    if (currentIdx + 1 < PRELIMINARY_EXAM_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      const result = finishPreliminaryExam();
      setLocalResult(result);
      setIsCompleted(true);
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      if (onComplete) {
        onComplete(result);
      }
    }
  };

  // If exam is completed, show the Empirical Findings & Calibrated Teaching Style
  if (isCompleted && (localResult || preliminaryResult)) {
    const res = localResult || preliminaryResult!;
    const style = res.empiricalTeachingStyle;

    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-12 animate-in zoom-in-95 duration-200">
        {/* Empirical Findings Card */}
        <div className="rounded-3xl border border-indigo-500/40 bg-zinc-900/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-xl shadow-indigo-600/30">
                <Brain className="h-7 w-7" />
              </div>
              <div>
                <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                  Empirical Cognitive Baseline Calibrated
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                  {style.personaName}
                </h2>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-right">
              <span className="text-[10px] uppercase text-zinc-400 block">Baseline Accuracy</span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {Math.round((preliminaryAttempts.filter(a => a.isCorrect).length / Math.max(1, preliminaryAttempts.length)) * 100)}%
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed font-medium">
            {style.personaTagline}
          </p>

          {/* Modality Spectrum Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Calculated Cognitive Modality Weights</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Visual & Spatial', val: res.modalityWeights.visual },
                { label: 'Socratic Inquiry', val: res.modalityWeights.socratic },
                { label: 'Step-by-Step Practice', val: res.modalityWeights.practice },
                { label: 'Intuitive Analogies', val: res.modalityWeights.analogies },
                { label: 'Formal Text & Proofs', val: res.modalityWeights.reading },
                { label: 'Interactive Synthesis', val: res.modalityWeights.interactive },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/5 bg-zinc-900/60 p-3">
                  <span className="text-[11px] text-zinc-400 block truncate">{m.label}</span>
                  <div className="mt-1 flex items-center justify-between font-mono">
                    <span className="text-sm font-bold text-white">{Math.round(m.val * 100)}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      style={{ width: `${Math.round(m.val * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tutor & Learning Runner Scaffolding Tuning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase">
                <Bot className="h-4 w-4 text-indigo-400" />
                <span>AI Socratic Mentor Tuning</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Default tutor mode calibrated to <strong className="text-indigo-300 uppercase">{style.defaultTutorMode}</strong>. {style.pedagogyDirective}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Epistemic Calibration & Scaffolding</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Brier score: <strong className="text-emerald-300">{Math.round((1 - style.brierScore) * 100)}%</strong> alignment. Scaffolding set to <strong className="capitalize text-zinc-200">{style.scaffoldingLevel}</strong> with initial difficulty calibrated to <strong className="text-indigo-300 font-mono">{(res.calibratedDifficulty * 100).toFixed(0)}%</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('dashboard')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer"
          >
            <span>Enter Your Tailored School Curriculum</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Assessment Header & Multi-Modal Probe Progress */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
              Cognitive Probe {currentIdx + 1} of {PRELIMINARY_EXAM_QUESTIONS.length}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {activeQuestion.probeTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>{responseTime}s</span>
          </div>
        </div>

        {/* 6 Probe Indicators */}
        <div className="grid grid-cols-6 gap-2">
          {PRELIMINARY_EXAM_QUESTIONS.map((q, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={q.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-500 shadow-md shadow-indigo-500/50'
                    : isDone
                    ? 'bg-emerald-400'
                    : 'bg-zinc-800'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 text-left">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
            {activeQuestion.probeDescription}
          </span>
          <div className="text-base sm:text-lg font-medium text-white leading-relaxed pt-1">
            <MathText content={activeQuestion.prompt} />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {activeQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/20 text-white ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/15'
                    : 'border-white/5 bg-zinc-950/40 text-zinc-300 hover:border-white/20 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500 text-white'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {opt.id.replace('opt-', '').toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <MathText content={opt.text} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confidence Calibration Selector */}
        <div className="pt-2 border-t border-white/5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Subjective Confidence Rating:
          </label>
          <ConfidenceSelector selected={confidence} onChange={setConfidence} />
        </div>

        <button
          type="button"
          disabled={!selectedOption}
          onClick={handleNextQuestion}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-40 cursor-pointer transition-all"
        >
          <span>{currentIdx + 1 === PRELIMINARY_EXAM_QUESTIONS.length ? 'Synthesize Epistemic Profile & Finish' : 'Submit & Next Cognitive Probe'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
