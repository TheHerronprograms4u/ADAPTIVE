import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { updateProfile, navigateTo, profile } = useAdaptive();

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState<string>(profile.name || 'Harron');
  const [email, setEmail] = useState<string>(profile.email || 'harron@adaptive.edu');
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      updateProfile({
        name: name.trim() || 'Learner',
        email: email.trim(),
      });
      setIsLoading(false);

      if (mode === 'signup') {
        // Go to personalized onboarding questionnaire
        navigateTo('onboarding');
      } else {
        // Go to dashboard directly
        navigateTo('dashboard');
      }
    }, 600);
  };

  const handleGuestContinue = () => {
    navigateTo('onboarding');
  };

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center py-6 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-500/30 animate-pulse-glow">
          <Zap className="h-7 w-7 fill-current" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {mode === 'signup' ? 'Create Your Learning Profile' : 'Welcome Back to Adaptive'}
        </h1>
        <p className="mt-1.5 text-xs text-zinc-400">
          {mode === 'signup'
            ? 'Initialize your personal AI learning operating system.'
            : 'Access your continuous knowledge galaxy and memory models.'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-5">
        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 rounded-xl bg-zinc-950/60 p-1 border border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-lg py-2 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`rounded-lg py-2 transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Social Authentication Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGuestContinue}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleGuestContinue}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4 fill-current text-zinc-200" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] uppercase font-semibold text-zinc-500">Or with email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Harron"
                  className="glass-input w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="glass-input w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input w-full rounded-xl pl-10 pr-10 py-2.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-indigo-700 transition-all cursor-pointer"
          >
            {isLoading ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account & Begin Diagnostic' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Demo Mode */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleGuestContinue}
            className="text-xs text-zinc-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Explore as Guest / Try Instant Demo →
          </button>
        </div>
      </div>
    </div>
  );
};
