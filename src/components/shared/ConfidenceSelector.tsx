import React from 'react';
import { ConfidenceRating } from '../../types/assessment';
import { Sparkles, HelpCircle, CheckCircle2, ShieldQuestion } from 'lucide-react';

interface ConfidenceSelectorProps {
  selected: ConfidenceRating;
  onChange: (rating: ConfidenceRating) => void;
  disabled?: boolean;
}

const OPTIONS: { rating: ConfidenceRating; label: string; desc: string; icon: any; color: string }[] = [
  { rating: 'very_unsure', label: 'Very Unsure', desc: 'Mostly a wild guess (15%)', icon: ShieldQuestion, color: 'hover:border-zinc-500 text-zinc-400' },
  { rating: 'unsure', label: 'Unsure', desc: 'Partial intuition (35%)', icon: HelpCircle, color: 'hover:border-amber-500 text-amber-400' },
  { rating: 'somewhat_confident', label: 'Moderate', desc: 'Reasonably sure (60%)', icon: Sparkles, color: 'hover:border-blue-500 text-blue-400' },
  { rating: 'confident', label: 'Confident', desc: 'Solid derivation (85%)', icon: CheckCircle2, color: 'hover:border-indigo-500 text-indigo-400' },
  { rating: 'very_confident', label: 'Certain', desc: '100% verified (98%)', icon: Sparkles, color: 'hover:border-emerald-500 text-emerald-400' },
];

export const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({ selected, onChange, disabled }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Confidence Calibration Signal
        </span>
        <span className="text-[11px] text-zinc-500">
          Calibrates epistemic Bayesian weights
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.rating;
          const Icon = opt.icon;

          return (
            <button
              key={opt.rating}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.rating)}
              className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/15 shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                  : 'border-white/5 bg-zinc-950/40 hover:bg-zinc-800/50'
              } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <Icon className={`mb-1 h-4 w-4 ${isSelected ? 'text-indigo-300' : opt.color}`} />
              <span className={`text-xs font-medium ${isSelected ? 'text-white font-semibold' : 'text-zinc-300'}`}>
                {opt.label}
              </span>
              <span className="mt-0.5 text-[10px] text-zinc-500">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
