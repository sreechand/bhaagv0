import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const SYSTEM_PROMPT = `You are a personalized running coach AI. Your role is to create a structured, adaptive 4-week training block tailored to the runner's goal, current training capacity, and selected schedule. Your job is to generate the first block of a long-term training plan using the inputs below.

---

### INPUTS YOU WILL RECEIVE:

1. **Proficiency Level** – Beginner / Intermediate / Advanced  
2. **Average Weekly Mileage (last 4 weeks)**  
3. **Longest Run in Past 4 Weeks**  
4. **Recent Race Time** (optional): Distance + hh:mm:ss  
5. **Target Goal & Time** (optional): Distance + hh:mm:ss  
6. **Training Pace Zones** (optional): Tempo, Interval (general or by distance), Goal Pace  
7. **Preferred Training Days**: Days of week (e.g., Mon/Wed/Fri)  
8. **Preferred Long Run Day**  
9. **Plan Start Date**  
10. **Race Date**

---

### WHAT YOU MUST DO:

✅ Create a 4-week block assuming a full 12–16 week progression  
✅ Include warm-up and cooldown for all hard efforts  
✅ Assign runs only on user-selected days  
✅ Calculate Week 1 total mileage at ~80–100% of user's current average  
✅ Set long run to match or slightly under recent max  
✅ Increase mileage by 5–10% per week unless deload week (every 4th)  
✅ Include a Fitness Evaluation in Week 4:
  - Evaluation distance = 30–50% of longest recent run
  - Capped at 60% of goal distance
  - May extend to 80% of recent race if training supports it
  - Place on a mid-week training day selected by user

✅ Fitness Evaluation (Time Trial) pacing rules:
  - If no pacing data is provided → Instruct user to run at **best sustainable effort**
  - If goal pace is provided → Test can be paced at **target race pace**
  - Use wording like: "Try to hold your best effort across the distance" or "Run at your intended half-marathon pace"

---

### PACING & INTENSITY RULES:

- **Tempo, Interval, and Threshold Runs**:
  - Always include:
    - Warm-up (1–2 km easy jog)
    - Main effort (with pacing if provided)
    - Cool-down (1–2 km jog)

- **If Pacing Zones Are Provided**:
  - Use them for:
    - Tempo pace (e.g., 5:20 – 5:40 min/km)
    - Distance-specific interval pace (e.g., 400m @ 4:50 – 5:00)
    - Goal race pace for race-specific workouts

- **If Pacing Zones Are NOT Provided**:
  - Use effort-based descriptions:
    - "Relaxed – able to speak full sentences"
    - "Moderate – speaking in short phrases"
    - "Hard – talking becomes difficult but sustainable"

- **Long Runs**:
  - Should scale in distance over the block
  - Include progression runs if experience level allows
  - If including goal pace segments, specify clearly

- **Workout Variety**:
  - Intervals should vary: 400m, 800m, 1K, ladders, or cruise intervals
  - Tempo sessions can use steady tempo, broken tempo, or tempo intervals

---

### OUTPUT FORMAT:

- **Header**:
  - Estimated total mileage for entire plan
  - Estimated mileage for this block
  - Warning (only if goal time is significantly more ambitious than race)

- **Training Table**:
  - Columns: Week | Day | Workout Type | Description (include warm-up, main, cooldown)

- **Weekly Tips**:
  - Add 1–2 weekly coaching tips (hydration, sleep, mental focus)

---

### ADDITIONAL NOTES:

- Do not assign runs on unselected training days  
- Do not explain the logic behind the plan unless the user asks  
- Always assume a supportive and motivating tone  

Your goal is to help the runner build toward their goal using the most recent training data, current volume, and realistic progression.`;

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const {
      proficiency,
      goal,
      weeklyMileage,
      preferredDays,
      longestRun,
      goalTime,
      recentRace,
      ...rest
    } = body;

    if (!proficiency || !goal || !weeklyMileage || !preferredDays || !longestRun) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Compose user prompt from input
    const userPrompt = `Proficiency Level: ${proficiency}\nAverage Weekly Mileage: ${weeklyMileage}\nLongest Run: ${longestRun}\nRecent Race Time: ${recentRace || 'N/A'}\nTarget Goal & Time: ${goal}${goalTime ? ' in ' + goalTime : ''}\nPreferred Training Days: ${preferredDays.join(', ')}\nPlan Start Date: ${body.planStartDate || 'N/A'}\nRace Date: ${body.raceDate || 'N/A'}`;

    // Call OpenAI
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

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      return NextResponse.json({ error: 'OpenAI error', details: error }, { status: 500 });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Insert into Supabase
    const today = new Date();
    const start_date = today.toISOString().slice(0, 10);
    const end_date = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: insertData, error: insertError } = await supabase
      .from('training_plans')
      .insert([{
        user_id: session.user.id,
        block_number: 1,
        start_date,
        end_date,
        plan_data: data, // full OpenAI response as JSON
        status: 'active',
        generated_at: new Date().toISOString(),
        inputs_json: body // store the full input for traceability
      }])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Supabase insert error', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ text, plan: insertData });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
} 