import React from 'react';

interface ProgressRingProps {
  percentage: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  bgColorClass?: string;
  label?: string;
  subLabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 110,
  strokeWidth = 8,
  colorClass = 'text-indigo-500',
  bgColorClass = 'text-zinc-800',
  label,
  subLabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={bgColorClass}
        />
        {/* Animated progress fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className={`${colorClass} transition-all duration-700 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold tracking-tight text-white font-mono">
          {label !== undefined ? label : `${Math.round(clamped)}%`}
        </span>
        {subLabel && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
};
