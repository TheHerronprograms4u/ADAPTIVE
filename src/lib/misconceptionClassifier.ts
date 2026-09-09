import { MisconceptionCategory, MisconceptionPattern } from '../types/subject';
import { Question, OptionDistractor } from '../types/assessment';

export interface ClassifiedError {
  category: MisconceptionCategory;
  categoryTitle: string;
  badgeColor: string;
  diagnosis: string;
  remediationAction: string;
  suggestedConceptToReview?: string;
}

export const MISCONCEPTION_LABELS: Record<MisconceptionCategory, { title: string; badgeColor: string }> = {
  calculation_error: { title: 'Calculation Slip', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  conceptual_misunderstanding: { title: 'Conceptual Gap', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  vocabulary_confusion: { title: 'Terminology Confusion', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  misapplied_formula: { title: 'Misapplied Formula', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  incorrect_prerequisite: { title: 'Prerequisite Bottleneck', badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30' },
  pattern_recognition_failure: { title: 'Non-linear Fallacy', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  careless_error: { title: 'Execution Slip', badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  misinterpretation: { title: 'Constraint Misread', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  guessing: { title: 'Uncalibrated Guess', badgeColor: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
};

export function classifyUserError(
  question: Question,
  userAnswer: string | number | string[] | Record<string, string>,
  responseTimeSecs: number,
  confidenceScalar: number,
  wasGuess: boolean
): ClassifiedError {
  // Check if distractor contains an explicit misconception tag
  if (question.type === 'multiple_choice' && typeof userAnswer === 'string' && question.options) {
    const chosenOption = question.options.find(o => o.id === userAnswer || o.text === userAnswer);
    if (chosenOption && chosenOption.misconceptionCategory) {
      const info = MISCONCEPTION_LABELS[chosenOption.misconceptionCategory];
      return {
        category: chosenOption.misconceptionCategory,
        categoryTitle: info.title,
        badgeColor: info.badgeColor,
        diagnosis: chosenOption.misconceptionExplanation || `Selected choice exhibits ${info.title.toLowerCase()}.`,
        remediationAction: getRemediationAdvice(chosenOption.misconceptionCategory, question.conceptName || 'this concept'),
        suggestedConceptToReview: question.prerequisiteRefId,
      };
    }
  }

  // Fast response with low confidence -> Guessing
  if (wasGuess || (responseTimeSecs < 4 && confidenceScalar < 0.35)) {
    return {
      category: 'guessing',
      categoryTitle: MISCONCEPTION_LABELS.guessing.title,
      badgeColor: MISCONCEPTION_LABELS.guessing.badgeColor,
      diagnosis: "Rapid attempt submitted without sufficient deliberation or confidence calibration.",
      remediationAction: "Pause for 30 seconds. Write down the known values and state what rule connects them before answering.",
    };
  }

  // High confidence but wrong -> Deep conceptual misunderstanding or misapplied formula
  if (confidenceScalar > 0.8) {
    return {
      category: 'conceptual_misunderstanding',
      categoryTitle: MISCONCEPTION_LABELS.conceptual_misunderstanding.title,
      badgeColor: MISCONCEPTION_LABELS.conceptual_misunderstanding.badgeColor,
      diagnosis: `Overconfident mistake detected in ${question.conceptName || 'core reasoning'}. The chosen model contradicts the fundamental boundary conditions.`,
      remediationAction: "Let's review an intuitive physical analogy to re-anchor your mental model.",
      suggestedConceptToReview: question.prerequisiteRefId,
    };
  }

  // Long response time with near miss -> Calculation or execution slip
  if (responseTimeSecs > 18) {
    return {
      category: 'calculation_error',
      categoryTitle: MISCONCEPTION_LABELS.calculation_error.title,
      badgeColor: MISCONCEPTION_LABELS.calculation_error.badgeColor,
      diagnosis: "Good conceptual navigation, but a sign flip or algebraic arithmetic slip occurred during step execution.",
      remediationAction: "Double check negative multipliers and fractional denominators step by step.",
    };
  }

  // Default intelligent classification
  return {
    category: 'careless_error',
    categoryTitle: MISCONCEPTION_LABELS.careless_error.title,
    badgeColor: MISCONCEPTION_LABELS.careless_error.badgeColor,
    diagnosis: "Minor execution deviation. The foundational premise was close, but constraints were not fully satisfied.",
    remediationAction: "Review the step-by-step worked derivation to see where the divergence began.",
  };
}

function getRemediationAdvice(category: MisconceptionCategory, conceptName: string): string {
  switch (category) {
    case 'calculation_error':
      return 'Track algebraic terms explicitly on scratchpad. Watch for minus signs distributed over parentheses.';
    case 'conceptual_misunderstanding':
      return `Step back to the Socratic derivation of ${conceptName}. Avoid memorizing the final formula without understanding the invariant.`;
    case 'vocabulary_confusion':
      return 'Pay close attention to semantic distinction between rate of change versus total accumulated amount.';
    case 'misapplied_formula':
      return 'Verify whether the formula requires the radius or diameter, and check whether constant acceleration applies.';
    case 'incorrect_prerequisite':
      return `Let us strengthen the foundational prerequisite before tackling multi-step ${conceptName} problems.`;
    case 'pattern_recognition_failure':
      return 'Beware of applying linear superposition to quadratic or non-linear functions.';
    case 'misinterpretation':
      return 'Underline given conditions and the exact unit requested before starting calculations.';
    default:
      return 'Practice active recall to cement the correct procedural schema.';
  }
}
