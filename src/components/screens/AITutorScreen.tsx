import React, { useState, useRef, useEffect } from 'react';
import { useAdaptive } from '../../context/AdaptiveContext';
import { TutorMode, TutorMessage } from '../../types/tutor';
import { askGeminiTutor } from '../../lib/gemini';
import { speechService } from '../../lib/speech';
import { MathText } from '../shared/MathText';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  BookOpen,
  Zap,
  Lightbulb,
  Award,
  Layers,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

const TUTOR_MODES: { mode: TutorMode; label: string; desc: string; icon: any }[] = [
  { mode: 'socratic', label: 'Socratic Inquiry', desc: 'Guiding questions to deduce principles', icon: HelpCircle },
  { mode: 'explain', label: 'Clear Explanation', desc: 'Structured & intuitive theory', icon: BookOpen },
  { mode: 'simplify', label: 'Simplify (ELI5)', desc: 'Plain everyday language', icon: Sparkles },
  { mode: 'deep_dive', label: 'Deep Formal Rigor', desc: 'Mathematical proofs & mechanics', icon: Layers },
  { mode: 'analogy', label: 'Intuitive Analogy', desc: 'Physical metaphors & mental models', icon: Lightbulb },
  { mode: 'example', label: 'Worked Examples', desc: 'Step-by-step solved problems', icon: Zap },
  { mode: 'challenge', label: 'Challenge Problem', desc: 'Diagnostic testing questions', icon: Award },
  { mode: 'debug', label: 'Debug Mistakes', desc: 'Dissecting error root causes', icon: RefreshCw },
  { mode: 'teach_me', label: 'Teach Me Mode', desc: 'You teach the AI, AI grades depth', icon: Bot },
];

export const AITutorScreen: React.FC = () => {
  const {
    profile,
    concepts,
    selectedConceptId,
    setSelectedConceptId,
    userConceptStates,
  } = useAdaptive();

  const [activeMode, setActiveMode] = useState<TutorMode>('socratic');
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'init-msg',
      sender: 'tutor',
      mode: 'socratic',
      text: `Hello ${profile.name.split(' ')[0]}. I am your personalized Socratic tutor.\n\nI have access to your continuous Bayesian Knowledge graph and know your current mastery on **${
        concepts.find(c => c.id === selectedConceptId)?.name || 'Calculus Foundations'
      }** is **${Math.round((userConceptStates[selectedConceptId || 'math-alg-quad']?.masteryScore || 0.68) * 100)}%**.\n\nHow would you like to explore this concept today? You can ask a direct question, request an intuitive analogy, or test your reasoning in **Teach Me** mode.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Can you give me an intuitive analogy for the chain rule?',
        'Why does the derivative of e^x equal itself?',
        'Challenge me with a tricky boundary problem.',
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentConcept = concepts.find(c => c.id === selectedConceptId) || concepts[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice STT Toggle
  const handleToggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const started = speechService.startListening(
        (res) => {
          setInputPrompt(res.transcript);
          if (res.isFinal) {
            speechService.stopListening();
            setIsListening(false);
          }
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsListening(false);
        }
      );
      if (started) setIsListening(true);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMsg: TutorMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      mode: activeMode,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    const mastery = userConceptStates[currentConcept.id]?.masteryScore || 0.65;
    const misconceptions = currentConcept.misconceptions.map(m => m.name);

    try {
      const replyText = await askGeminiTutor({
        learnerName: profile.name,
        educationLevel: profile.educationLevel,
        conceptName: currentConcept.name,
        conceptSummary: currentConcept.summary,
        learnerMastery: mastery,
        knownMisconceptions: misconceptions,
        mode: activeMode,
        userMessage: text,
        conversationHistory: messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        })),
      });

      const tutorMsg: TutorMessage = {
        id: `tut-${Date.now()}`,
        sender: 'tutor',
        mode: activeMode,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps:
          activeMode === 'socratic'
            ? ['I think the boundary constraint shifts left.', 'What if the sign was negative?']
            : ['Explain with a different analogy.', 'Give me a practice problem on this.'],
      };

      setMessages(prev => [...prev, tutorMsg]);

      if (isAutoSpeak) {
        speechService.speak(replyText);
      }
    } catch (err) {
      console.warn('Tutor error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col rounded-3xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar: Mode Selector & Active Concept Focus */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-zinc-900/60 p-4">
        {/* Concept Dropdown */}
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-400" />
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Active Focus Concept
            </span>
            <select
              value={selectedConceptId || ''}
              onChange={(e) => setSelectedConceptId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {concepts.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-900 text-white">
                  {c.shortCode} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audio / Voice Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoSpeak(!isAutoSpeak)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
              isAutoSpeak
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-white/10 bg-zinc-900/80 text-zinc-400 hover:text-white'
            }`}
          >
            {isAutoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isAutoSpeak ? 'Voice Audio ON' : 'Voice Audio OFF'}</span>
          </button>
        </div>
      </div>

      {/* 9 Pedagogical Modes Scrollable Pill Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/5 bg-zinc-900/30 p-2.5 scrollbar-none">
        {TUTOR_MODES.map((tm) => {
          const isActive = activeMode === tm.mode;
          const Icon = tm.icon;

          return (
            <button
              key={tm.mode}
              onClick={() => setActiveMode(tm.mode)}
              className={`flex items-center gap-2 shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'border border-white/5 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tm.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2 px-1 text-[10px] text-zinc-500">
                <span>{isUser ? profile.name : 'ADAPTIVE Socratic AI'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {!isUser && (
                  <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] font-semibold text-indigo-300 uppercase">
                    {msg.mode}
                  </span>
                )}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'border border-white/10 bg-zinc-900/80 text-zinc-200 shadow-md backdrop-blur-xl'
                }`}
              >
                <MathText content={msg.text} />
              </div>

              {/* Follow-up suggestions if available */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && !isUser && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {msg.suggestedFollowUps.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(prompt)}
                      className="rounded-lg border border-white/5 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-indigo-300 hover:border-indigo-500/40 hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 max-w-sm">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
            <span className="text-xs text-zinc-400 font-medium">
              Socratic tutor synthesizing response...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="border-t border-white/10 bg-zinc-900/80 p-3 sm:p-4 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse'
                : 'border-white/10 bg-zinc-950/60 text-zinc-400 hover:text-white'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak to AI Tutor'}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              activeMode === 'teach_me'
                ? `Explain ${currentConcept.name} to the AI...`
                : activeMode === 'socratic'
                ? `Ask or deduce something about ${currentConcept.name}...`
                : `Ask any question...`
            }
            className="glass-input flex-1 rounded-xl px-4 py-3 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-40 transition-all cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
