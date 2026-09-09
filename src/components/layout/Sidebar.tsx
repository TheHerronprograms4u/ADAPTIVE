import React from 'react';
import { useAdaptive, ScreenName } from '../../context/AdaptiveContext';
import {
  LayoutDashboard,
  Compass,
  PlayCircle,
  Bot,
  RotateCcw,
  Calendar,
  GraduationCap,
  BarChart3,
  FileUp,
  Award,
  Settings,
  Zap,
  Sigma,
  Cpu,
  Dna,
  Atom,
} from 'lucide-react';

interface NavItem {
  screen: ScreenName;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { screen: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
  { screen: 'knowledge_galaxy', label: 'Knowledge Galaxy', icon: Compass, badge: 'Live', badgeColor: 'bg-indigo-500/20 text-indigo-300' },
  { screen: 'session', label: 'Learning Session', icon: PlayCircle, badge: 'Adaptive', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
  { screen: 'tutor', label: 'AI Tutor Companion', icon: Bot },
  { screen: 'review_center', label: 'Review Center', icon: RotateCcw, badge: 'Spaced', badgeColor: 'bg-amber-500/20 text-amber-300' },
  { screen: 'study_planner', label: 'AI Study Planner', icon: Calendar },
  { screen: 'exam_mode', label: 'Exam Mode', icon: GraduationCap },
  { screen: 'analytics', label: 'Learning Science', icon: BarChart3 },
  { screen: 'document_import', label: 'Document Import', icon: FileUp },
  { screen: 'achievements', label: 'Milestones', icon: Award },
  { screen: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    currentScreen,
    navigateTo,
    profile,
    subjects,
    activeSubjectId,
    setActiveSubjectId,
  } = useAdaptive();

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sigma': return <Sigma className="h-4 w-4 text-indigo-400" />;
      case 'Cpu': return <Cpu className="h-4 w-4 text-cyan-400" />;
      case 'Dna': return <Dna className="h-4 w-4 text-emerald-400" />;
      case 'Atom': return <Atom className="h-4 w-4 text-amber-400" />;
      default: return <Sigma className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-zinc-950/90 p-4 backdrop-blur-2xl select-none z-30">
      {/* Brand Header */}
      <div className="mb-6 flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-base font-extrabold tracking-wider text-white">ADAPTIVE</span>
              <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] font-semibold text-indigo-300">OS</span>
            </div>
            <p className="text-[10px] font-medium text-zinc-400 tracking-tight">AI Personalized Learning</p>
          </div>
        </div>
      </div>

      {/* Active Subject Selector */}
      <div className="mb-4">
        <label className="mb-1.5 block px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Knowledge Domain
        </label>
        <div className="space-y-1">
          {subjects.map((sub) => {
            const isActive = activeSubjectId === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubjectId(sub.id)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800/90 text-white border border-white/10 shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getSubjectIcon(sub.icon)}
                  <span className="truncate">{sub.name}</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        <label className="mb-1.5 block px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Platform Architecture
        </label>
        {NAV_ITEMS.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;

          return (
            <button
              key={item.screen}
              onClick={() => navigateTo(item.screen)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Momentum Footer Card */}
      <div className="mt-3 rounded-xl border border-white/5 bg-zinc-950/80 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">Cognitive Momentum</span>
          <span className="font-mono font-bold text-indigo-400">{profile.learningMomentum}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${profile.learningMomentum}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
