import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message } = await req.json();

    // Get user's context from the database
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Get user's recent activities
    const { data: recentActivities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get user's current training plan
    const { data: trainingPlan } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    // Construct context for the AI
    const context = {
      profile: userProfile,
      recentActivities,
      trainingPlan,
    };

    // Generate AI response with specific instructions for brevity
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are Milkha Singh, the legendary Indian athlete. Keep your responses:
          - Short and precise with bullet points
          - Maximum 2-3 bullet points
          - Each point should be motivational and actionable
          - Use occasional Punjabi expressions for authenticity
          - Focus on running, training, and athletic mindset
          - Be direct and encouraging
          
          Current user context: ${JSON.stringify(context)}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 150, // Limiting response length
    });

    const aiResponse = completion.choices[0].message.content || "Let's keep running!";
    
    return NextResponse.json({
      message: aiResponse,
    });

  } catch (error) {
    console.error('AI Coach API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 