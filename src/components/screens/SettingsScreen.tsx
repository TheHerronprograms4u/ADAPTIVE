import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { soundEffects } from '../../lib/audioEffects';
import { getGroqApiKey, getGroqModel } from '../../lib/groq';
import {
  Settings as SettingsIcon,
  Key,
  Volume2,
  Sliders,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Shield,
  Eye,
  Zap,
  Cpu,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { profile, resetAllData } = useAdaptive();

  const [groqKey, setGroqKey] = useState<string>(getGroqApiKey());
  const [groqModel, setGroqModel] = useState<string>(getGroqModel());
  const [groqKeySaved, setGroqKeySaved] = useState<boolean>(false);

  const [geminiKey, setGeminiKey] = useState<string>(
    localStorage.getItem('gemini_api_key') || 'AIzaSyAzGLvelFxhmrnJo36-KdmlIvZQiZoJ3-s'
  );
  const [geminiKeySaved, setGeminiKeySaved] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEffects.soundEnabled);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const handleSaveGroqConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('groq_api_key', groqKey.trim());
    localStorage.setItem('groq_model', groqModel);
    setGroqKeySaved(true);
    setTimeout(() => setGroqKeySaved(false), 2000);
  };

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', geminiKey.trim());
    setGeminiKeySaved(true);
    setTimeout(() => setGeminiKeySaved(false), 2000);
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
          Manage ultra-fast Groq LPU inference, AI models, audio cues, and state persistence.
        </p>
      </div>

      {/* Groq LPU Engine Config (Primary) */}
      <div className="rounded-3xl border border-indigo-500/30 bg-indigo-950/20 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Groq LPU AI Engine</h3>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
                  Primary
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                Ultra-fast 500+ tokens/sec inference powering the AI Tutor and Document Extraction
              </span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        </div>

        <form onSubmit={handleSaveGroqConfig} className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Groq API Key
            </label>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="glass-input w-full rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Model Selection
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', badge: 'Recommended', desc: 'Deepest pedagogical reasoning' },
                { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', badge: 'Fastest', desc: 'Instant sub-second replies' },
                { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B', badge: 'Reasoning', desc: 'Advanced math & proof deduction' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setGroqModel(m.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    groqModel === m.id
                      ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-sm'
                      : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      {m.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:from-indigo-600 hover:to-indigo-700 cursor-pointer"
            >
              {groqKeySaved ? 'Saved Preferences!' : 'Save Groq Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Google Gemini Backup Config */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="h-5 w-5 text-zinc-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Google Gemini API Key</h3>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  Fallback Provider
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">Secondary fallback engine if Groq reaches rate limits</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveGeminiKey} className="flex gap-2 pt-2">
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="glass-input flex-1 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-200"
          />
          <button
            type="submit"
            className="rounded-xl bg-zinc-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 cursor-pointer"
          >
            {geminiKeySaved ? 'Saved!' : 'Update Key'}
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
