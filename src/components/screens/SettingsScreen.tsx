import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { soundEffects } from '../../lib/audioEffects';
import { speechService } from '../../lib/speech';
import {
  Settings as SettingsIcon,
  Key,
  Volume2,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Shield,
  Eye,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { profile, resetAllData } = useAdaptive();

  const [apiKey, setApiKey] = useState<string>(
    localStorage.getItem('gemini_api_key') || 'AIzaSyAzGLvelFxhmrnJo36-KdmlIvZQiZoJ3-s'
  );
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEffects.soundEnabled);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const handleToggleSound = () => {
    soundEffects.soundEnabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      soundEffects.playCorrectChime();
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ profile, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adaptive_learning_profile_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
          <SettingsIcon className="h-3.5 w-3.5 text-indigo-400" />
          <span>System & Intelligence Preferences</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Platform Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage AI endpoints, audio cues, accessibility parameters, and data persistence.
        </p>
      </div>

      {/* AI Key Config */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Google Gemini 2.5 API Key</h3>
              <span className="text-[11px] text-zinc-400">Powering Socratic multi-mode AI tutoring & document extraction</span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Connected
          </span>
        </div>

        <form onSubmit={handleSaveApiKey} className="flex gap-2 pt-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="glass-input flex-1 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-200"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 cursor-pointer"
          >
            {apiKeySaved ? 'Saved!' : 'Update Key'}
          </button>
        </form>
      </div>

      {/* Audio & Synthesizer Feedback */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Volume2 className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Web Audio Feedback Chimes</h3>
              <span className="text-[11px] text-zinc-400">Subtle harmonic chimes on correct answer and mastery breakthroughs</span>
            </div>
          </div>
          <button
            onClick={handleToggleSound}
            className={`rounded-full px-4 py-1 text-xs font-semibold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>
      </div>

      {/* Accessibility & Display Controls */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <Eye className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Accessibility & Display Ergonomics</h3>
            <span className="text-[11px] text-zinc-400">High contrast mode and reduced motion preferences</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300">High Contrast Status Borders</span>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                highContrast ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {highContrast ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300">Reduced Motion Mode</span>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                reducedMotion ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {reducedMotion ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management & Privacy */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Privacy & Local Storage Export</h3>
            <span className="text-[11px] text-zinc-400">Export your continuous epistemic profile or reset test records</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Epistemic Profile (JSON)</span>
          </button>

          <button
            onClick={resetAllData}
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-2.5 text-xs font-medium text-rose-300 hover:bg-rose-950/40 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Curriculum & Clear Local State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
