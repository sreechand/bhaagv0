import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, X, Loader2, Volume2, VolumeX, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface VoiceCoachProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function VoiceCoach({ isOpen = true, onClose }: VoiceCoachProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'coach';
    message: string;
    timestamp: Date;
  }>>([]);
  const [pendingTranscript, setPendingTranscript] = useState('');
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);

  // Common phrases to preload
  const commonPhrases = [
    "{{PUNJABI:Chak de fatte!}} I'm Milkha, your running coach. Let's train together and push your limits!",
    "{{PUNJABI:Shabash!}} Great work! Keep pushing!",
    "Remember what I always say - success comes from dedication and {{PUNJABI:mehnat}}.",
    "I'm sorry, I encountered an error. Please try again."
  ];

  const { speak, speaking, stop } = useSpeechSynthesis({
    voice: 'onyx',
    pitch: 0.9,
    rate: 0.98,
  });

  // Preload common phrases
  useEffect(() => {
    if (isOpen) {
      commonPhrases.forEach(phrase => {
        fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: phrase, voice: 'onyx' })
        }).catch(console.error); // Silently cache phrases
      });
    }
  }, [isOpen]);

  // Reference to Web Speech API
  const recognitionRef = useRef<any>(null);
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sound effects with error handling
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const startSound = useRef<HTMLAudioElement | null>(null);
  const endSound = useRef<HTMLAudioElement | null>(null);

  // Initialize sound effects with error handling
  useEffect(() => {
    const loadSounds = () => {
      try {
        // Create audio elements
        startSound.current = new Audio('/sounds/start-listening.mp3');
        endSound.current = new Audio('/sounds/stop-listening.mp3');

        // Add load event listeners
        const loadStartSound = () => {
          console.log('Start sound loaded successfully');
        };
        const loadEndSound = () => {
          console.log('End sound loaded successfully');
        };
        const handleError = (e: ErrorEvent) => {
          console.warn('Sound effect failed to load:', e.message);
        };

        startSound.current.addEventListener('canplaythrough', loadStartSound);
        endSound.current.addEventListener('canplaythrough', loadEndSound);
        startSound.current.addEventListener('error', handleError);
        endSound.current.addEventListener('error', handleError);

        // Preload the sounds
        startSound.current.load();
        endSound.current.load();
        setSoundsLoaded(true);

        return () => {
          // Cleanup listeners
          startSound.current?.removeEventListener('canplaythrough', loadStartSound);
          endSound.current?.removeEventListener('canplaythrough', loadEndSound);
          startSound.current?.removeEventListener('error', handleError);
          endSound.current?.removeEventListener('error', handleError);
        };
      } catch (error) {
        console.warn('Failed to initialize sound effects:', error);
        setSoundsLoaded(false);
      }
    };

    loadSounds();
    
    return () => {
      // Cleanup audio elements
      if (startSound.current) {
        startSound.current.pause();
        startSound.current = null;
      }
      if (endSound.current) {
        endSound.current.pause();
        endSound.current = null;
      }
    };
  }, []);

  // Safe play function for sound effects
  const playSoundEffect = async (sound: HTMLAudioElement | null) => {
    if (!sound || !soundsLoaded) return;
    
    try {
      // Reset the audio to start
      sound.currentTime = 0;
      await sound.play();
    } catch (error) {
      console.warn('Failed to play sound effect:', error);
    }
  };

  // Welcome message when component opens
  useEffect(() => {
    if (isOpen && !hasWelcomed && !isMuted) {
      const welcomeUser = async () => {
        setIsSpeaking(true);
        const message = "{{PUNJABI:Sat sri akal!}} I'm Milkha Singh, your running coach. Let's train together and push your limits!";
        
        setConversation(prev => [...prev, {
          role: 'coach',
          message: message,
          timestamp: new Date()
        }]);
        
        try {
          await speak(message);
        } finally {
          setIsSpeaking(false);
          setHasWelcomed(true);
        }
      };
      welcomeUser();
    }
  }, [isOpen, hasWelcomed, isMuted, speak]);

  const toggleListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setConversation(prev => [...prev, {
        role: 'coach',
        message: "Your browser doesn't support voice recognition. Please use Chrome or Edge.",
        timestamp: new Date()
      }]);
      return;
    }

    try {
      // Check if microphone permission is granted
      const permissionResult = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the audio track immediately after getting permission
      permissionResult.getTracks().forEach(track => track.stop());

      if (speaking) {
        stop(); // Stop any ongoing speech before starting to listen
      }
      
      if (isListening) {
        setIsListening(false);
        setIsRecordingComplete(true);
        try {
          recognitionRef.current?.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      } else {
        setTranscript('');
        setPendingTranscript('');
        setIsRecordingComplete(false);
        try {
          // Reinitialize recognition if needed
          if (!recognitionRef.current) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';
          }

          await recognitionRef.current.start();
          setIsListening(true);
          
          // Show feedback that mic is active
          setConversation(prev => [...prev, {
            role: 'coach',
            message: "I'm listening! Go ahead and speak...",
            timestamp: new Date()
          }]);
        } catch (error) {
          console.error('Failed to start listening:', error);
          setConversation(prev => [...prev, {
            role: 'coach',
            message: "I couldn't access the microphone. Please check your microphone permissions and try again.",
            timestamp: new Date()
          }]);
        }
      }
    } catch (error) {
      console.error('Microphone permission error:', error);
      setConversation(prev => [...prev, {
        role: 'coach',
        message: "I need permission to use your microphone. Please allow access and try again.",
        timestamp: new Date()
      }]);
    }
  };

  // Handle audio errors in speak function
  const handleSpeak = async (text: string) => {
    setIsSpeaking(true);
    try {
      await speak(text);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      // Show error message in UI
      setConversation(prev => [...prev, {
        role: 'coach',
        message: "I'm having trouble speaking right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSendVoiceMessage = async () => {
    if (!pendingTranscript.trim()) return;

    setIsProcessing(true);
    setIsListening(false);
    
    // Add user message to conversation
    setConversation(prev => [...prev, {
      role: 'user',
      message: pendingTranscript,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch('/api/milkha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: pendingTranscript }),
      });

      const data = await response.json();

      if (data.message) {
        const newMessage = {
          role: 'coach' as const,
          message: data.message,
          timestamp: new Date()
        };

        setConversation(prev => [...prev, newMessage]);

        if (!isMuted) {
          await handleSpeak(data.message);
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
        await handleSpeak(errorMessage);
      }
    } finally {
      setIsProcessing(false);
      setPendingTranscript('');
      setIsRecordingComplete(false);
    }
  };

  const handleMuteToggle = () => {
    if (!isMuted && speaking) {
      stop(); // Stop any ongoing speech when muting
    }
    setIsMuted(!isMuted);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const messageText = textInput.trim();
    setTextInput(''); // Clear input immediately after getting the message
    setIsProcessing(true);
    
    // Add user message to conversation
    setConversation(prev => [...prev, {
      role: 'user',
      message: messageText,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch('/api/milkha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      if (data.message) {
        const newMessage = {
          role: 'coach' as const,
          message: data.message,
          timestamp: new Date()
        };

        setConversation(prev => [...prev, newMessage]);

        if (!isMuted) {
          await handleSpeak(data.message);
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
        await handleSpeak(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize Web Speech API
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setIsRecordingComplete(false);
          playSoundEffect(startSound.current);
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          playSoundEffect(endSound.current);
          
          // If we're supposed to be listening but recognition ended, restart it
          if (isListening) {
            console.log('Recognition ended while listening, attempting restart...');
            // Add a small delay before restarting to prevent rapid restarts
            setTimeout(() => {
              try {
                if (isListening) { // Double check we still want to listen
                  recognitionRef.current?.start();
                  console.log('Successfully restarted recognition');
                }
              } catch (error) {
                console.error('Error restarting speech recognition:', error);
                // If restart fails, reinitialize the recognition object
                const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';
                
                // Try starting again with new instance
                try {
                  recognitionRef.current?.start();
                  console.log('Successfully restarted with new recognition instance');
                } catch (secondError) {
                  console.error('Failed to restart even with new instance:', secondError);
                  setIsListening(false);
                  setIsRecordingComplete(true);
                  setConversation(prev => [...prev, {
                    role: 'coach',
                    message: "I lost the connection to your microphone. Please click the mic button to start again.",
                    timestamp: new Date()
                  }]);
                }
              }
            }, 300);
          }
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setPendingTranscript(prev => prev + finalTranscript);
            setTranscript(prev => prev + finalTranscript);
          } else if (interimTranscript) {
            setTranscript(interimTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // Handle specific error cases
          switch (event.error) {
            case 'not-allowed':
            case 'permission-denied':
              setIsListening(false);
              setConversation(prev => [...prev, {
                role: 'coach',
                message: "I need permission to use your microphone. Please allow access and try again.",
                timestamp: new Date()
              }]);
              break;
            case 'no-speech':
              // Don't stop listening for no speech, just log it
              console.log('No speech detected, continuing to listen...');
              break;
            case 'network':
              // Try to recover from network errors
              console.log('Network error, attempting to restart...');
              try {
                recognitionRef.current?.stop();
                setTimeout(() => {
                  if (isListening) {
                    recognitionRef.current?.start();
                  }
                }, 300);
              } catch (error) {
                console.error('Failed to recover from network error:', error);
                setIsListening(false);
              }
              break;
            case 'aborted':
              // If recognition was manually aborted, don't try to restart
              if (!isListening) {
                console.log('Recognition aborted intentionally');
                break;
              }
              // Otherwise fall through to default case
            default:
              // For other errors, try to restart recognition
              console.log('Attempting to restart after error:', event.error);
              try {
                recognitionRef.current?.stop();
                setTimeout(() => {
                  if (isListening) {
                    recognitionRef.current?.start();
                  }
                }, 300);
              } catch (error) {
                console.error('Failed to restart after error:', error);
                setIsListening(false);
                setConversation(prev => [...prev, {
                  role: 'coach',
                  message: "Something went wrong with the voice recognition. Please click the mic button to try again.",
                  timestamp: new Date()
                }]);
              }
          }
        };
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, [isListening]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100]"
        >
          <motion.div 
            className="relative w-full max-w-lg bg-gradient-to-b from-gray-900/90 to-black/90 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Milkha Singh
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setInputMode(inputMode === 'voice' ? 'text' : 'voice')}
                  className="text-primary"
                >
                  {inputMode === 'voice' ? (
                    <span className="text-sm">Aa</span>
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMuteToggle}
                  className={isMuted ? 'text-gray-500' : 'text-primary'}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    stop();
                    onClose?.();
                  }}
                  className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Conversation Display */}
            <div className="h-[60vh] overflow-y-auto p-6 space-y-6">
              {conversation.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-800/80 text-gray-100'
                    }`}
                  >
                    <p className="text-lg">{msg.message}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isProcessing && (
                <motion.div 
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center space-x-2 bg-gray-800/50 rounded-full px-6 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-gray-300">Processing...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Section */}
            <div className="p-6 border-t border-white/10">
              {inputMode === 'voice' ? (
                // Voice Input UI
                <div className="relative">
                  {/* Animated Waves */}
                  {isListening && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="absolute w-32 h-32 bg-primary/20 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 0.1, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <motion.div
                        className="absolute w-24 h-24 bg-primary/30 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0.2, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.3,
                        }}
                      />
                      <motion.div
                        className="absolute w-16 h-16 bg-primary/40 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.7, 0.3, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.6,
                        }}
                      />
                    </div>
                  )}

                  {/* Central AI Interface */}
                  <div className="flex flex-col items-center">
                    <motion.button
                      className="relative z-10 h-24 w-24 rounded-full flex items-center justify-center bg-black/40 border border-primary/30 backdrop-blur-sm shadow-lg transition-all duration-300 group hover:border-primary/50"
                      onClick={toggleListening}
                      disabled={speaking || isProcessing}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* AI Core */}
                      <div className="absolute inset-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
                      </div>

                      {/* Animated Particles */}
                      {isListening && (
                        <>
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-primary rounded-full"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.7, 0.3, 0.7],
                                x: [0, Math.cos(i * 30 * Math.PI / 180) * 30],
                                y: [0, Math.sin(i * 30 * Math.PI / 180) * 30],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </>
                      )}

                      {/* Central Orb */}
                      <div className="relative z-10 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary"
                          animate={isListening ? {
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          } : {}}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <motion.div
                          className="h-8 w-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm"
                          animate={isListening ? {
                            rotate: 360,
                          } : {}}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <div className="h-4 w-4 rounded-full bg-primary/80" />
                        </motion.div>
                      </div>

                      {/* Ripple Effect */}
                      {isListening && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-primary/30"
                            animate={{
                              scale: [1, 1.5],
                              opacity: [0.3, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-primary/20"
                            animate={{
                              scale: [1, 2],
                              opacity: [0.2, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: 0.3,
                            }}
                          />
                        </>
                      )}
                    </motion.button>

                    {/* Status Text and Send Button */}
                    <div className="mt-6 flex items-center gap-4">
                      <motion.p 
                        className="text-sm text-gray-400"
                        animate={isListening ? {
                          opacity: [0.5, 1, 0.5],
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {isListening ? (
                          <span className="flex items-center gap-2">
                            {transcript || 'Listening...'}
                            <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"/>
                          </span>
                        ) : isRecordingComplete ? (
                          <span className="flex items-center gap-2">
                            {pendingTranscript}
                          </span>
                        ) : (
                          'Tap to speak'
                        )}
                      </motion.p>
                      
                      {isRecordingComplete && pendingTranscript && (
                        <Button
                          onClick={handleSendVoiceMessage}
                          disabled={isProcessing}
                          className="rounded-full bg-primary hover:bg-primary/90 p-2"
                          size="icon"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Text Input UI
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800/50 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={isProcessing}
                  />
                  <Button 
                    type="submit" 
                    disabled={isProcessing || !textInput.trim()}
                    className="rounded-xl bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 