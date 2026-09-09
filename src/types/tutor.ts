export type TutorMode = 
  | 'socratic'      // Guides with scaffolded questions
  | 'explain'       // Crisp, crystal-clear conceptual explanation
  | 'simplify'      // ELI5 / simple everyday language
  | 'deep_dive'     // Rigorous mathematical & technical proof/depth
  | 'example'       // Concrete worked real-world examples
  | 'analogy'       // Intuitive conceptual metaphors
  | 'challenge'     // Progressively harder diagnostic problems
  | 'debug'         // Step-by-step mistake dissection
  | 'teach_me';     // Learner explains concept; AI assesses epistemic depth

export interface TutorMessage {
  id: string;
  sender: 'user' | 'tutor' | 'system';
  mode: TutorMode;
  text: string;
  conceptId?: string;
  conceptName?: string;
  mathSnippets?: string[];
  suggestedFollowUps?: string[];
  socraticQuestions?: string[];
  evaluationScore?: {
    accuracy: number;
    depth: number;
    clarity: number;
    feedback: string;
  };
  timestamp: string;
  isStreaming?: boolean;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  voiceVolume: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceName?: string;
  autoSpeakResponses: boolean;
}
