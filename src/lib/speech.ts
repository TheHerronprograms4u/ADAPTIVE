// Web Speech API Wrapper for Voice Learning

export interface SpeechRecognitionResultEvent {
  transcript: string;
  isFinal: boolean;
}

class SpeechController {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((result: SpeechRecognitionResultEvent) => void) | null = null;
  private onErrorCallback: ((err: string) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (this.onResultCallback) {
            this.onResultCallback({
              transcript: finalTranscript || interimTranscript,
              isFinal: Boolean(finalTranscript),
            });
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition event error:', event.error);
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
          }
          this.isListening = false;
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    onResult: (res: SpeechRecognitionResultEvent) => void,
    onError?: (err: string) => void
  ): boolean {
    if (!this.recognition) return false;
    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  public speak(text: string, onEnd?: () => void, voiceName?: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Strip markdown & LaTeX symbols for clean spoken narration
    const cleanText = text
      .replace(/\$\$[\s\S]*?\$\$/g, ' mathematical equation ')
      .replace(/\$([^\$]+)\$/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/[*_`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voiceName) {
      const matched = voices.find(v => v.name === voiceName);
      if (matched) utterance.voice = matched;
    } else {
      // Prefer calm, clear English voice
      const preferred = voices.find(v => v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google US English') || v.lang === 'en-US');
      if (preferred) utterance.voice = preferred;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  }
}

export const speechService = new SpeechController();
