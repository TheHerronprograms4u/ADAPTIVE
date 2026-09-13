import React, { useState } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import {
  Search,
  Bell,
  Mic,
  Maximize2,
  Sparkles,
  Flame,
  X,
  User,
  LogOut,
  Settings,
  BookOpen,
  ChevronDown,
  Brain,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    profile,
    activeSubject,
    setIsCommandPaletteOpen,
    isFocusModeActive,
    toggleFocusMode,
    notifications,
    markNotificationAsRead,
    navigateTo,
    signOut,
    setIsSubjectSelectorOpen,
  } = useAdaptive();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Greeting and Subject Badge */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-white sm:text-base">
              Good morning, {profile.name.split(' ')[0]}
            </h1>
            <div className="hidden items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300 sm:flex border border-amber-500/20">
              <Flame className="h-3 w-3 fill-current text-amber-400" />
              <span>{profile.currentStreakDays}d streak</span>
            </div>

            {/* Teaching persona badge */}
            {profile.empiricalTeachingStyle ? (
              <button
                onClick={() => navigateTo('preliminary_exam')}
                title="View or retake preliminary cognitive diagnosis"
                className="hidden xl:flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/25 transition-all cursor-pointer"
              >
                <Brain className="h-3 w-3 text-indigo-400" />
                <span>{profile.empiricalTeachingStyle.personaName}</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('preliminary_exam')}
                title="Take preliminary cognitive diagnostic exam"
                className="hidden xl:flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/15 px-2.5 py-0.5 text-[11px] font-medium text-purple-300 hover:bg-purple-500/25 transition-all cursor-pointer animate-pulse"
              >
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span>Diagnose Modality</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[11px] text-zinc-400 hidden sm:inline">
              Calibrated for:
            </p>
            <button
              onClick={() => setIsSubjectSelectorOpen(true)}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[11px] font-medium text-indigo-300 transition-all cursor-pointer"
            >
              <BookOpen className="h-3 w-3 text-indigo-400" />
              <span className="max-w-[140px] truncate">{activeSubject.name}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle/Right: Actions & Search */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Omnibar / Search Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-400 hover:border-white/20 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Search concepts or ask AI...</span>
          <kbd className="hidden rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Voice Tutor Button */}
        <button
          onClick={() => navigateTo('tutor')}
          title="Open Voice AI Tutor"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer"
        >
          <Mic className="h-4 w-4" />
        </button>

        {/* Focus Mode Toggle */}
        <button
          onClick={toggleFocusMode}
          title="Distraction-Free Focus Mode"
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer ${
            isFocusModeActive
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
              : 'border-white/10 bg-zinc-900/70 text-zinc-400 hover:text-white'
          }`}
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/70 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Intelligent System Alerts
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="rounded p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.actionScreen) navigateTo(n.actionScreen, { conceptId: n.actionConceptId });
                      setShowNotifications(false);
                    }}
                    className={`rounded-xl border p-3 cursor-pointer transition-all ${
                      n.isRead
                        ? 'border-white/5 bg-zinc-950/40 text-zinc-400'
                        : 'border-indigo-500/30 bg-indigo-500/10 text-zinc-200 hover:bg-indigo-500/15'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-white">{n.title}</h4>
                      <span className="text-[10px] text-zinc-500 shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-300 leading-relaxed">{n.body}</p>
                    {n.actionScreen && (
                      <span className="mt-2 inline-block text-[11px] font-medium text-indigo-400 hover:underline">
                        Take targeted action →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-md hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer"
          >
            {profile.name.slice(0, 2).toUpperCase()}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="font-semibold text-white truncate">{profile.name || 'Learner'}</p>
                {profile.email && <p className="text-[10px] text-zinc-400 truncate">{profile.email}</p>}
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    navigateTo('profile');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Epistemic Profile</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('settings');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Settings & Preferences</span>
                </button>

                <div className="my-1 border-t border-white/5" />

                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    await signOut();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
