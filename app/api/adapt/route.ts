import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';

const SYSTEM_PROMPT = `You are an intelligent AI running coach. Given the user's current week, fatigue score, number of missed runs, skipped run reasons, time trial result, and whether the user requested to catch up, adapt the provided training sessions safely.

Use these rules:

- Fatigue 8-10 → reduce intensity & mileage ~20%
- Fatigue 4-7 → maintain current progression
- Fatigue 1-3 for 2+ weeks → slightly increase intensity
- If 2+ runs missed → reduce next week intensity
- If "Injured" reason → insert recovery run or recovery week
- If "Tired" → lower intensity
- If "No time" → minor reduction if 2+ runs missed
- If "Help me catch up" is Yes:
    - 3+ skipped & high fatigue → recovery week
    - 3+ skipped & normal fatigue → safely adapt current plan
    - 1-2 skipped → safely adapt current plan
- Respect mileage progression limit: do not exceed +10% unless >10 sec time trial improvement.
- Always adapt based on the provided runs JSON. Do not add extra runs not present in the input.
- Maintain workout variety and ensure safe recovery if needed.

Return only the UPDATED sessions in the same JSON format. Do not include explanations or extra text.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      user_id, 
      plan_id, 
      current_week_number, 
      current_week_id,
      help_me_catch_up, 
      fatigue, 
      runs,
      missedRunsLastWeek = 0,
      missedRunsCurrentWeek = 0,
      lastWeekMileage = 0,
      currentWeekMileage = 0,
      timeTrialResult = null,
      skippedRunReasons = []
    } = body;
    console.log('ADAPT API: Received body:', body);

    // Extract all unique week_ids from runs for traceability
    const affected_week_ids = Array.from(new Set((runs || []).map((r: any) => r.week_id)));
    console.log('ADAPT API: Affected week_ids:', affected_week_ids);

    // 2. Build user prompt
    const userPrompt = `
Fatigue (previous week): ${fatigue}
Missed runs last week: ${missedRunsLastWeek}
Missed runs current week: ${missedRunsCurrentWeek}
Last week's mileage: ${lastWeekMileage} km
Current week's mileage: ${currentWeekMileage} km
Time trial result: ${timeTrialResult ? JSON.stringify(timeTrialResult) : 'N/A'}
Skipped run reasons: ${JSON.stringify(skippedRunReasons)}
Help me catch up: ${help_me_catch_up}
Here are the sessions to adapt (JSON, with week_id):
${JSON.stringify(runs, null, 2)}
`;
    console.log('ADAPT API: User prompt:', userPrompt);

    // 3. Call OpenAI
    console.log('ADAPT API: Calling OpenAI...');
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
      })
    });
    console.log('ADAPT API: OpenAI response status:', openaiRes.status);

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      console.error('ADAPT API: OpenAI error', error);
      return NextResponse.json({ error: 'OpenAI error', details: error }, { status: 500 });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || '';
    let updatedRuns;
    try {
      updatedRuns = JSON.parse(text);
    } catch (e: any) {
      console.error('ADAPT API: OpenAI output parse error', e, text);
      return NextResponse.json({ error: 'OpenAI output parse error', details: e.message }, { status: 500 });
    }
    console.log('ADAPT API: Updated runs:', updatedRuns);

    // 4. Log the call to adapt_plan_calls
    const { error: logError } = await supabaseAdmin
      .from('adapt_plan_calls')
      .insert([{
        id: crypto.randomUUID(),
        user_id,
        week_id: current_week_id,
        help_me_catch_up,
        input_json: { ...body, missedRunsLastWeek, missedRunsCurrentWeek, lastWeekMileage, currentWeekMileage, timeTrialResult, skippedRunReasons },
        api_response: data,
        updated_runs: updatedRuns,
        status: 'success',
        error_message: null,
        prompt_version: 'v1',
        affected_week_ids
      }]);
    if (logError) {
      console.error('ADAPT API: Failed to log adapt call', logError);
      return NextResponse.json({ error: 'Failed to log adapt call', details: logError }, { status: 500 });
    }

    // 5. Update plan_sessions with the adapted runs
    const nowIso = new Date().toISOString();
    for (const run of updatedRuns) {
      if (run.id) {
        await supabaseAdmin
          .from('plan_sessions')
          .update({
            day: run.day,
            type: run.type,
            focus: run.focus,
            description: run.description,
            updated_at: nowIso
          })
          .eq('id', run.id);
      }
    }

    return NextResponse.json({ success: true, updatedRuns });
  } catch (error: any) {
    console.error('ADAPT API: Error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
