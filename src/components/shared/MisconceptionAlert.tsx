import React from 'react';
import { AlertTriangle, Lightbulb, ArrowRight, BookOpen } from 'lucide-react';
import { MisconceptionCategory } from '../../types/subject';
import { MISCONCEPTION_LABELS } from '../../lib/misconceptionClassifier';
import { MathText } from './MathText';

interface MisconceptionAlertProps {
  category: MisconceptionCategory;
  diagnosis: string;
  remediationAdvice: string;
  prerequisiteRefId?: string;
  onReviewPrerequisite?: () => void;
}

export const MisconceptionAlert: React.FC<MisconceptionAlertProps> = ({
  category,
  diagnosis,
  remediationAdvice,
  prerequisiteRefId,
  onReviewPrerequisite,
}) => {
  const meta = MISCONCEPTION_LABELS[category] || {
    title: 'Diagnostic Misconception',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 backdrop-blur-md transition-all">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-rose-500/20 p-2 text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-rose-200">
              Targeted Misconception Diagnostic
            </h4>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${meta.badgeColor}`}>
              {meta.title}
            </span>
          </div>

          <div className="mt-2 text-sm text-zinc-300">
            <MathText content={diagnosis} />
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-200">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Actionable Remediation: </span>
              <MathText content={remediationAdvice} className="inline" />
            </div>
          </div>

          {prerequisiteRefId && onReviewPrerequisite && (
            <button
              onClick={onReviewPrerequisite}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-all hover:bg-indigo-500/25"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Reinforce Prerequisite Concept First</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
