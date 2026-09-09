import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { QuestionRenderer } from '../shared/QuestionRenderer';
import { ConfidenceRating } from '../../types/assessment';
import { PlayCircle, ArrowLeft, Sparkles, Award } from 'lucide-react';

export const PracticeScreen: React.FC = () => {
  const {
    questions,
    selectedConceptId,
    concepts,
    submitAttempt,
    navigateTo,
  } = useAdaptive();

  const activeConcept = concepts.find(c => c.id === selectedConceptId) || concepts[0];
  const conceptQuestions = questions.filter(q => q.conceptId === activeConcept.id);

  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const activeQuestion = conceptQuestions[questionIdx] || questions[0];

  const handleAnswerSubmit = (answer: any, isCorrect: boolean, confidence: ConfidenceRating, timeSec: number) => {
    submitAttempt({
      questionId: activeQuestion.id,
      conceptId: activeQuestion.conceptId,
      userAnswer: answer,
      isCorrect,
      score: isCorrect ? 1.0 : 0.0,
      confidenceRating: confidence,
      confidenceScalar: confidence === 'very_confident' ? 0.98 : confidence === 'confident' ? 0.85 : 0.4,
      responseTimeSeconds: timeSec,
      difficultyAtTime: activeQuestion.difficulty,
    });
    setCompletedCount(prev => prev + 1);
  };

  const handleNext = () => {
    if (questionIdx + 1 < conceptQuestions.length) {
      setQuestionIdx(prev => prev + 1);
    } else {
      navigateTo('dashboard');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span>Question {questionIdx + 1} of {Math.max(1, conceptQuestions.length)}</span>
        </div>
      </div>

      {/* Target Concept Info */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase">
          <PlayCircle className="h-4 w-4" />
          <span>Targeted Practice Session</span>
        </div>
        <h2 className="mt-1 text-lg font-bold text-white">{activeConcept.name}</h2>
        <p className="text-xs text-zinc-400 mt-1">{activeConcept.summary}</p>
      </div>

      {/* Question Renderer */}
      {activeQuestion && (
        <QuestionRenderer
          question={activeQuestion}
          onSubmitAnswer={handleAnswerSubmit}
          onNextQuestion={handleNext}
          isLastQuestion={questionIdx + 1 === conceptQuestions.length}
        />
      )}
    </div>
  );
};
