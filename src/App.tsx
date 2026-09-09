import React from 'react';
import { AdaptiveProvider, useAdaptive } from './context/AdaptiveContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { FocusModeOverlay } from './components/layout/FocusModeOverlay';

import { SplashScreen } from './components/screens/SplashScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { DiagnosticScreen } from './components/screens/DiagnosticScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { SessionRunnerScreen } from './components/screens/SessionRunnerScreen';
import { PracticeScreen } from './components/screens/PracticeScreen';
import { AITutorScreen } from './components/screens/AITutorScreen';
import { KnowledgeMapScreen } from './components/screens/KnowledgeMapScreen';
import { ReviewCenterScreen } from './components/screens/ReviewCenterScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { StudyPlannerScreen } from './components/screens/StudyPlannerScreen';
import { ExamModeScreen } from './components/screens/ExamModeScreen';
import { DocumentImportScreen } from './components/screens/DocumentImportScreen';
import { AchievementsScreen } from './components/screens/AchievementsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

import { Zap, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentScreen, isAuthenticated, isAuthChecking } = useAdaptive();

  if (isAuthChecking) {
    return (
      <main className="min-h-screen bg-zinc-950 p-4 sm:p-8 flex flex-col justify-center items-center text-white select-none">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30 animate-pulse-glow">
          <Zap className="h-8 w-8 fill-current text-white" />
        </div>
        <h2 className="font-mono text-xl font-bold tracking-wider text-white">ADAPTIVE OS</h2>
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-indigo-400">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          <span>Verifying session security...</span>
        </div>
      </main>
    );
  }

  // If user is not logged in, enforce login first before accessing platform features
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-zinc-950 p-4 sm:p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl">
          {currentScreen === 'welcome' ? <WelcomeScreen /> : <AuthScreen />}
        </div>
      </main>
    );
  }

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'auth':
        return <AuthScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'diagnostic':
        return <DiagnosticScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'session':
        return <SessionRunnerScreen />;
      case 'practice':
        return <PracticeScreen />;
      case 'tutor':
        return <AITutorScreen />;
      case 'knowledge_galaxy':
      case 'concept_detail':
        return <KnowledgeMapScreen />;
      case 'review_center':
        return <ReviewCenterScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'study_planner':
        return <StudyPlannerScreen />;
      case 'exam_mode':
      case 'exam_report':
        return <ExamModeScreen />;
      case 'document_import':
        return <DocumentImportScreen />;
      case 'achievements':
        return <AchievementsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const isFullscreenScreen =
    currentScreen === 'splash' ||
    currentScreen === 'welcome' ||
    currentScreen === 'auth' ||
    currentScreen === 'onboarding';

  if (isFullscreenScreen) {
    return (
      <main className="min-h-screen bg-zinc-950 p-4 sm:p-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl">
          {renderActiveScreen()}
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 pb-24 lg:pb-12">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Mobile Bottom Dock */}
      <MobileNav />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette />

      {/* Fullscreen Focus Mode Overlay */}
      <FocusModeOverlay />
    </div>
  );
};

export function App() {
  return (
    <AdaptiveProvider>
      <MainAppContent />
    </AdaptiveProvider>
  );
}

export default App;
