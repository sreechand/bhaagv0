import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface VoiceCoachProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function VoiceCoach({ isOpen = true, onClose }: VoiceCoachProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'coach';
    message: string;
    timestamp: Date;
  }>>([]);

  const { speak, speaking, stop } = useSpeechSynthesis({
    voice: 'en-US-JennyNeural',
    pitch: 1,
    rate: 1.1,
  });

  // Reference to Web Speech API
  const recognitionRef = useRef<any>(null);
  
  // Sound effects
  const startSound = useRef<HTMLAudioElement | null>(null);
  const endSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize sound effects
    startSound.current = new Audio('/sounds/start-listening.mp3');
    endSound.current = new Audio('/sounds/stop-listening.mp3');
    
    return () => {
      startSound.current = null;
      endSound.current = null;
    };
  }, []);

  // Welcome message when component opens
  useEffect(() => {
    if (isOpen && !hasWelcomed && !isMuted) {
      const welcomeUser = async () => {
        const welcomeMessage = "Hi! I'm Bhaaggi, your running coach. How can I help you today?";
        setConversation(prev => [...prev, {
          role: 'coach',
          message: welcomeMessage,
          timestamp: new Date()
        }]);
        await speak(welcomeMessage);
        setHasWelcomed(true);
      };
      welcomeUser();
    }
  }, [isOpen, hasWelcomed, isMuted, speak]);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        startSound.current?.play().catch(console.error);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          endSound.current?.play().catch(console.error);
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setTranscript(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleListening = async () => {
    if (speaking) {
      stop(); // Stop any ongoing speech before starting to listen
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      await processTranscript();
    } else {
      setTranscript('');
      try {
        await recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start listening:', error);
      }
    }
  };

  const processTranscript = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    setIsListening(false);
    
    // Add user message to conversation
    setConversation(prev => [...prev, {
      role: 'user',
      message: transcript,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: transcript }),
      });

      const data = await response.json();

      if (data.message) {
        const newMessage = {
          role: 'coach' as const,
          message: data.message,
          timestamp: new Date()
        };

        setConversation(prev => [...prev, newMessage]);

        // Speak the response if not muted
        if (!isMuted) {
          await speak(data.message);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = "I'm sorry, I encountered an error. Please try again.";
      setConversation(prev => [...prev, {
        role: 'coach',
        message: errorMessage,
        timestamp: new Date()
      }]);
      if (!isMuted) {
        await speak(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMuteToggle = () => {
    if (!isMuted && speaking) {
      stop(); // Stop any ongoing speech when muting
    }
    setIsMuted(!isMuted);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-6 w-96 bg-black/90 rounded-xl border border-primary/20 shadow-xl backdrop-blur-xl z-[100]"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primary">Bhaaggi</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMuteToggle}
                  className={isMuted ? 'text-gray-500' : 'text-primary'}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {
                  stop(); // Stop any ongoing speech when closing
                  onClose?.();
                }}>
                  <MicOff className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conversation Display */}
            <div className="h-96 overflow-y-auto mb-4 space-y-4 p-2">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary/20 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Voice Input Section */}
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-800 rounded-lg p-3">
                <p className="text-gray-300">
                  {isListening ? transcript || 'Listening...' : 'Press the mic to speak'}
                </p>
              </div>
              <Button
                variant={isListening ? "destructive" : "default"}
                size="icon"
                className={`rounded-full ${isListening ? 'animate-pulse' : ''}`}
                onClick={toggleListening}
                disabled={speaking}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 