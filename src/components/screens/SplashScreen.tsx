import React, { useEffect } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { Zap, Sparkles } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigateTo } = useAdaptive();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateTo('dashboard');
    }, 1200);
    return () => clearTimeout(timer);
  }, [navigateTo]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white animate-in fade-in duration-300">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/50 animate-pulse-glow">
        <Zap className="h-10 w-10 fill-current" />
      </div>

      <h1 className="font-mono text-3xl font-extrabold tracking-wider">
        ADAPTIVE
      </h1>
      <p className="mt-2 text-xs font-medium text-zinc-400 tracking-tight">
        Personalized AI Learning Operating System
      </p>

      <div className="mt-8 flex items-center gap-2 text-[11px] text-indigo-400 font-mono">
        <Sparkles className="h-3.5 w-3.5 animate-spin" />
        <span>Synthesizing continuous knowledge manifold...</span>
      </div>
    </div>
  );
};
