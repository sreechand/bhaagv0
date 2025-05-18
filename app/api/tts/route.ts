import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache for audio
const audioCache = new Map<string, Buffer>();

async function generateSpeech(text: string, voice: string): Promise<Buffer> {
  // Handle special Punjabi phrases marked with {{PUNJABI:...}}
  text = text.replace(/{{PUNJABI:(.*?)}}/g, (match, phrase) => phrase);

  // Check audio cache first
  const cacheKey = `${text}-${voice}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voice || 'onyx', // Default to onyx for Milkha Singh's voice
    input: text,
    speed: 1.1,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  
  // Cache the audio
  audioCache.set(cacheKey, buffer);
  
  return buffer;
}

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const buffer = await generateSpeech(text, voice);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Text-to-speech failed' },
      { status: 500 }
    );
  }
} 