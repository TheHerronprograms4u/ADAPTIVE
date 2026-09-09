import React from 'react';
import { useAdaptive, ScreenName } from '../../context/AdaptiveContext';
import {
  LayoutDashboard,
  Compass,
  PlayCircle,
  Bot,
  RotateCcw,
  BarChart3,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentScreen, navigateTo } = useAdaptive();

  const NAV_LINKS: { screen: ScreenName; label: string; icon: any }[] = [
    { screen: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { screen: 'knowledge_galaxy', label: 'Galaxy', icon: Compass },
    { screen: 'session', label: 'Session', icon: PlayCircle },
    { screen: 'tutor', label: 'AI Tutor', icon: Bot },
    { screen: 'review_center', label: 'Review', icon: RotateCcw },
    { screen: 'analytics', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-white/10 bg-zinc-950/90 px-2 backdrop-blur-2xl lg:hidden">
      {NAV_LINKS.map((link) => {
        const isActive = currentScreen === link.screen;
        const Icon = link.icon;

        return (
          <button
            key={link.screen}
            onClick={() => navigateTo(link.screen)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-1.5 transition-all ${
              isActive ? 'text-indigo-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400 scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">{link.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
