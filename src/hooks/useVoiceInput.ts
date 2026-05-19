import { useState, useRef, useCallback } from 'react';

interface UseVoiceInputResult {
  isListening: boolean;
  transcript: string;
  interimText: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
  supported: boolean;
}

export function useVoiceInput(onFinalText?: (text: string) => void): UseVoiceInputResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTextRef = useRef('');
  const onFinalTextRef = useRef(onFinalText);
  onFinalTextRef.current = onFinalText;

  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!supported) return;
    // Stop existing recognition if any
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }

    const SpeechRecognitionAPI = (window.SpeechRecognition ?? window.webkitSpeechRecognition) as typeof SpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let newFinal = '';
      let newInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          newFinal += text;
        } else {
          newInterim += text;
        }
      }

      if (newFinal) {
        finalTextRef.current = finalTextRef.current
          ? finalTextRef.current + ' ' + newFinal
          : newFinal;
        setTranscript(finalTextRef.current);
        setInterimText('');
        onFinalTextRef.current?.(finalTextRef.current);
      } else if (newInterim) {
        setInterimText(newInterim);
      }
    };

    recognition.onerror = (event) => {
      // Only stop on real errors, not on "no-speech" which is common
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
      }
      // For "no-speech" or "aborted", keep listening
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      // (continuous mode can stop unexpectedly)
      if (recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    finalTextRef.current = transcript; // preserve existing text
    recognition.start();
    setIsListening(true);
  }, [supported, transcript]);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    recognitionRef.current = null; // prevent auto-restart
    if (rec) {
      try { rec.stop(); } catch { /* ignore */ }
    }
    setInterimText('');
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      try { rec.stop(); } catch { /* ignore */ }
    }
    setTranscript('');
    setInterimText('');
    finalTextRef.current = '';
    setIsListening(false);
  }, []);

  return { isListening, transcript, interimText, start, stop, reset, supported };
}
