import { GoogleGenAI } from '@google/genai';
import { TutorMode } from '../types/tutor';
import { askGroqTutor, generateGroqDocumentStudyMap, getGroqApiKey, generateDeterministicTutorResponse } from './groq';

// Export TutorPromptContext from groq
export type { TutorPromptContext } from './groq';

// Initialize Gemini Client as alternative/fallback
const geminiApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
try {
  if (geminiApiKey) {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  }
} catch (err) {
  console.warn('Gemini client initialization error:', err);
}

export async function askGeminiTutor(context: import('./groq').TutorPromptContext): Promise<string> {
  // 1. Primary: Use ultra-fast Groq LPU inference if available
  const groqKey = getGroqApiKey();
  if (groqKey) {
    try {
      const groqReply = await askGroqTutor(context);
      if (groqReply) return groqReply;
    } catch (err) {
      console.warn('Groq failed, falling back to Gemini/deterministic:', err);
    }
  }

  // 2. Fallback: Google Gemini API
  if (aiClient && geminiApiKey) {
    try {
      const mode = context.mode;
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `You are an adaptive AI tutor. Mode: ${mode}.\nLearner Concept: ${context.conceptName}.\nLearner message: "${context.userMessage}"` }] }
        ],
        config: {
          temperature: mode === 'deep_dive' ? 0.2 : mode === 'socratic' ? 0.7 : 0.4,
          maxOutputTokens: 1000,
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (apiError) {
      console.warn('Gemini API call error:', apiError);
    }
  }

  // 3. Fallback: Deterministic cognitive engine
  return generateDeterministicTutorResponse(context);
}

export async function generateDocumentStudyMap(docText: string, docTitle: string): Promise<{
  summary: string;
  concepts: { name: string; summary: string; prerequisites: string[]; difficulty: number }[];
}> {
  // Use Groq fast JSON structure generator
  return generateGroqDocumentStudyMap(docText, docTitle);
}
