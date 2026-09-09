import React, { useState, useEffect, useRef } from 'react';
import { Question, ConfidenceRating } from '../../types/assessment';
import { MathText } from './MathText';
import { ConfidenceSelector } from './ConfidenceSelector';
import { MisconceptionAlert } from './MisconceptionAlert';
import { classifyUserError } from '../../lib/misconceptionClassifier';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Code2,
  Sparkles,
  HelpCircle,
  CheckSquare,
  Square,
  MoveUp,
  MoveDown,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface QuestionRendererProps {
  question: Question;
  onSubmitAnswer: (answer: any, isCorrect: boolean, confidence: ConfidenceRating, responseTimeSeconds: number) => void;
  onNextQuestion?: () => void;
  isLastQuestion?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onSubmitAnswer,
  onNextQuestion,
  isLastQuestion,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [numericalInput, setNumericalInput] = useState<string>('');
  const [explanationInput, setExplanationInput] = useState<string>('');
  const [orderedItems, setOrderedItems] = useState<{ id: string; text: string; correctIndex: number }[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [activeLeftMatch, setActiveLeftMatch] = useState<string | null>(null);

  const [confidence, setConfidence] = useState<ConfidenceRating>('confident');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [detectedError, setDetectedError] = useState<any>(null);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Reset state for new question
    setSelectedOption('');
    setSelectedMultiple([]);
    setNumericalInput('');
    setExplanationInput('');
    setMatchedPairs({});
    setActiveLeftMatch(null);
    setIsSubmitted(false);
    setIsCorrect(false);
    setDetectedError(null);
    setConfidence('confident');

    if (question.orderingItems) {
      // Shuffle ordering items initially
      const shuffled = [...question.orderingItems].sort(() => Math.random() - 0.5);
      setOrderedItems(shuffled);
    }

    startTimeRef.current = Date.now();
    setResponseTime(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setResponseTime(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question.id]);

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const finalTime = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setResponseTime(finalTime);

    let evaluatedCorrect = false;
    let finalAnswerPayload: any = null;

    if (question.type === 'multiple_choice' || question.type === 'code_challenge' || question.type === 'true_false') {
      finalAnswerPayload = selectedOption;
      const opt = question.options?.find(o => o.id === selectedOption || o.text === selectedOption);
      evaluatedCorrect = Boolean(opt?.isCorrect);
    } else if (question.type === 'multiple_response') {
      finalAnswerPayload = selectedMultiple;
      const correctOptionIds = question.options?.filter(o => o.isCorrect).map(o => o.id) || [];
      evaluatedCorrect =
        selectedMultiple.length === correctOptionIds.length &&
        selectedMultiple.every(id => correctOptionIds.includes(id));
    } else if (question.type === 'numerical' && question.numericalAnswer) {
      finalAnswerPayload = parseFloat(numericalInput);
      evaluatedCorrect =
        !isNaN(finalAnswerPayload) &&
        Math.abs(finalAnswerPayload - question.numericalAnswer.value) <= question.numericalAnswer.tolerance;
    } else if (question.type === 'ordering') {
      finalAnswerPayload = orderedItems.map(item => item.id);
      evaluatedCorrect = orderedItems.every((item, idx) => item.correctIndex === idx);
    } else if (question.type === 'matching' && question.matchingPairs) {
      finalAnswerPayload = matchedPairs;
      evaluatedCorrect = question.matchingPairs.every(pair => matchedPairs[pair.leftId] === pair.rightId);
    } else if (question.type === 'explanation_recall') {
      finalAnswerPayload = explanationInput;
      // Semantic keywords check
      const lower = explanationInput.toLowerCase();
      const hits = (question.acceptedKeywords || []).filter(kw => lower.includes(kw.toLowerCase()));
      evaluatedCorrect = hits.length >= 2 || explanationInput.length > 50;
    }

    setIsCorrect(evaluatedCorrect);
    setIsSubmitted(true);

    if (!evaluatedCorrect) {
      const confScalar = confidence === 'very_confident' ? 0.98 : confidence === 'confident' ? 0.85 : 0.4;
      const errorDiag = classifyUserError(
        question,
        finalAnswerPayload,
        finalTime,
        confScalar,
        false
      );
      setDetectedError(errorDiag);
    }

    onSubmitAnswer(finalAnswerPayload, evaluatedCorrect, confidence, finalTime);
  };

  // Ordering swap helpers
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (isSubmitted) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= orderedItems.length) return;
    const newItems = [...orderedItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setOrderedItems(newItems);
  };

  // Matching pair selector
  const handleSelectLeft = (leftId: string) => {
    if (isSubmitted) return;
    setActiveLeftMatch(leftId === activeLeftMatch ? null : leftId);
  };

  const handleSelectRight = (rightId: string) => {
    if (isSubmitted || !activeLeftMatch) return;
    setMatchedPairs(prev => ({
      ...prev,
      [activeLeftMatch]: rightId,
    }));
    setActiveLeftMatch(null);
  };

  const isSubmitDisabled = () => {
    if (question.type === 'multiple_choice' || question.type === 'code_challenge' || question.type === 'true_false') {
      return !selectedOption;
    }
    if (question.type === 'multiple_response') {
      return selectedMultiple.length === 0;
    }
    if (question.type === 'numerical') {
      return numericalInput.trim() === '';
    }
    if (question.type === 'matching') {
      return Object.keys(matchedPairs).length < (question.matchingPairs?.length || 1);
    }
    if (question.type === 'explanation_recall') {
      return explanationInput.trim().length < 5;
    }
    return false;
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 backdrop-blur-xl shadow-2xl transition-all">
      {/* Question Header & Meta */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold text-indigo-300">
            {question.conceptName || 'Core Concept'}
          </span>
          <span className="text-xs font-medium text-zinc-400">
            Difficulty: <span className="font-mono text-zinc-200">{(question.difficulty * 100).toFixed(0)}%</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-zinc-950/60 px-2.5 py-1">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-mono">{responseTime}s</span>
          </div>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300 uppercase">
            {question.type.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mb-6 text-base font-medium text-zinc-100 sm:text-lg">
        <MathText content={question.prompt} />
      </div>

      {/* Code Snippet if applicable */}
      {question.codeSnippet && (
        <div className="mb-6 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-xs text-indigo-200 shadow-inner">
          <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500 border-b border-white/5 pb-1">
            <div className="flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>{question.codeSnippet.language.toUpperCase()}</span>
            </div>
            <span>Diagnostic Sandbox</span>
          </div>
          <pre className="overflow-x-auto leading-relaxed">{question.codeSnippet.code}</pre>
        </div>
      )}

      {/* Question Formats Rendering */}
      {/* 1. Multiple Choice / Code Challenge */}
      {(question.type === 'multiple_choice' || question.type === 'code_challenge' || question.type === 'true_false') && question.options && (
        <div className="mb-6 space-y-2.5">
          {question.options.map((opt) => {
            const isSelected = selectedOption === opt.id || selectedOption === opt.text;
            let itemStyle = 'border-white/5 bg-zinc-950/40 hover:border-white/20 hover:bg-zinc-800/40 text-zinc-200';

            if (isSubmitted) {
              if (opt.isCorrect) {
                itemStyle = 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500/40';
              } else if (isSelected && !opt.isCorrect) {
                itemStyle = 'border-rose-500/60 bg-rose-950/30 text-rose-200 ring-1 ring-rose-500/40';
              } else {
                itemStyle = 'border-white/5 bg-zinc-950/20 text-zinc-500 opacity-60';
              }
            } else if (isSelected) {
              itemStyle = 'border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500/50';
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isSubmitted}
                onClick={() => setSelectedOption(opt.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${itemStyle}`}
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

                {isSubmitted && (
                  <div>
                    {opt.isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                    {isSelected && !opt.isCorrect && <XCircle className="h-5 w-5 text-rose-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Multiple Response (Checkboxes) */}
      {question.type === 'multiple_response' && question.options && (
        <div className="mb-6 space-y-2.5">
          <p className="mb-2 text-xs font-medium text-indigo-300">Select all statements that apply:</p>
          {question.options.map((opt) => {
            const isChecked = selectedMultiple.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isSubmitted}
                onClick={() => {
                  setSelectedMultiple(prev =>
                    prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id]
                  );
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                  isChecked
                    ? 'border-indigo-500 bg-indigo-500/15 text-white'
                    : 'border-white/5 bg-zinc-950/40 hover:bg-zinc-800/40 text-zinc-200'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="h-5 w-5 text-indigo-400 shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-zinc-500 shrink-0" />
                )}
                <div className="text-sm">
                  <MathText content={opt.text} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Numerical Problem */}
      {question.type === 'numerical' && (
        <div className="mb-6 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Enter Exact Value:
          </label>
          <div className="flex max-w-sm items-center gap-2">
            <input
              type="number"
              step="any"
              disabled={isSubmitted}
              value={numericalInput}
              onChange={(e) => setNumericalInput(e.target.value)}
              placeholder="e.g. 20"
              className="glass-input flex-1 rounded-xl px-4 py-3 text-base font-mono font-medium focus:ring-2 focus:ring-indigo-500"
            />
            {question.numericalAnswer?.unit && (
              <span className="text-sm font-medium text-zinc-400">{question.numericalAnswer.unit}</span>
            )}
          </div>
        </div>
      )}

      {/* 4. Matching Pairs */}
      {question.type === 'matching' && question.matchingPairs && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Items to Link</span>
            {question.matchingPairs.map((pair) => {
              const matchedRightId = matchedPairs[pair.leftId];
              const matchedRight = question.matchingPairs?.find(p => p.rightId === matchedRightId);
              const isActive = activeLeftMatch === pair.leftId;

              return (
                <button
                  key={pair.leftId}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handleSelectLeft(pair.leftId)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-500/20 ring-1 ring-indigo-500'
                      : matchedRightId
                      ? 'border-emerald-500/30 bg-emerald-950/20'
                      : 'border-white/5 bg-zinc-950/40 hover:bg-zinc-800/40'
                  }`}
                >
                  <span className="text-sm font-medium text-zinc-200">{pair.leftText}</span>
                  {matchedRight && (
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300 font-mono">
                      <MathText content={matchedRight.rightText} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Available Matches</span>
            {question.matchingPairs.map((pair) => {
              return (
                <button
                  key={pair.rightId}
                  type="button"
                  disabled={isSubmitted || !activeLeftMatch}
                  onClick={() => handleSelectRight(pair.rightId)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-zinc-950/30 p-3 text-left hover:border-indigo-500/40 hover:bg-zinc-800/50 transition-all"
                >
                  <span className="text-sm text-zinc-300">
                    <MathText content={pair.rightText} />
                  </span>
                  <span className="text-xs text-zinc-500">Tap to pair</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Ordering Items */}
      {question.type === 'ordering' && (
        <div className="mb-6 space-y-2">
          <p className="text-xs font-medium text-indigo-300">Arrange in correct sequential order:</p>
          {orderedItems.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950/60 p-3.5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-xs font-mono font-bold text-zinc-300">
                  {idx + 1}
                </span>
                <span className="text-sm text-zinc-200">
                  <MathText content={item.text} />
                </span>
              </div>

              {!isSubmitted && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, 'up')}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === orderedItems.length - 1}
                    onClick={() => moveItem(idx, 'down')}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 6. Explanation / Free Recall */}
      {question.type === 'explanation_recall' && (
        <div className="mb-6 space-y-2">
          <textarea
            rows={4}
            disabled={isSubmitted}
            value={explanationInput}
            onChange={(e) => setExplanationInput(e.target.value)}
            placeholder="Type your intuitive explanation here from first principles..."
            className="glass-input w-full rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Confidence Calibration Bar (Pre-submission) */}
      {!isSubmitted && (
        <div className="mb-6">
          <ConfidenceSelector selected={confidence} onChange={setConfidence} />
        </div>
      )}

      {/* Action Footer: Submit or Next */}
      {!isSubmitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-40 cursor-pointer"
        >
          <span>Submit & Calibrate Attempt</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <div className="space-y-4">
          {/* Post-submission Result Banner */}
          <div
            className={`flex items-center gap-3 rounded-xl border p-4 ${
              isCorrect
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                : 'border-amber-500/40 bg-amber-950/20 text-amber-300'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
            ) : (
              <HelpCircle className="h-6 w-6 text-amber-400 shrink-0" />
            )}
            <div className="flex-1">
              <h4 className="text-sm font-semibold">
                {isCorrect ? 'Concept Schema Verified Correct' : 'Concept Needs Reinforcement'}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isCorrect
                  ? 'Your response was accurate and updated your memory stability.'
                  : 'We have classified the specific misconception below to adjust your path.'}
              </p>
            </div>
          </div>

          {/* Misconception Diagnosis if incorrect */}
          {detectedError && (
            <MisconceptionAlert
              category={detectedError.category}
              diagnosis={detectedError.diagnosis}
              remediationAdvice={detectedError.remediationAction}
              prerequisiteRefId={detectedError.suggestedConceptToReview}
            />
          )}

          {/* Solution & Intuition takeaway */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/50 p-4 space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Step-by-Step Derivation & Intuition</span>
            </h5>
            <div className="text-xs leading-relaxed text-zinc-300">
              <MathText content={question.detailedSolution} />
            </div>
            {question.intuitionTakeaway && (
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2.5 text-xs text-indigo-200">
                <span className="font-semibold text-indigo-300">Intuition Anchor: </span>
                <MathText content={question.intuitionTakeaway} className="inline" />
              </div>
            )}
          </div>

          {onNextQuestion && (
            <button
              type="button"
              onClick={onNextQuestion}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-6 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg transition-all hover:bg-white cursor-pointer"
            >
              <span>{isLastQuestion ? 'Complete Assessment' : 'Continue Next Challenge'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
