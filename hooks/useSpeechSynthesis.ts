import { useCallback, useState } from 'react';

interface UseSpeechSynthesisProps {
  voice?: string;
  pitch?: number;
  rate?: number;
}

export function useSpeechSynthesis({
  voice = 'echo',
  pitch = 0.95,
  rate = 1.05,
}: UseSpeechSynthesisProps = {}) {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(async (text: string) => {
    try {
      setSpeaking(true);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          voice,
        }),
      });

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setSpeaking(false);
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          setSpeaking(false);
          reject(error);
        };

        audio.play().catch((error) => {
          URL.revokeObjectURL(audioUrl);
          setSpeaking(false);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setSpeaking(false);
      throw error;
    }
  }, [voice]);

  const stop = useCallback(() => {
    setSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    speaking,
  };
}