import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const SYSTEM_PROMPT = `You are a personalized running coach AI. Your role is to generate a structured 4-week hybrid training plan combining running and strength training, tailored to the runner's goal, current training capacity, and selected schedule. Your job is to generate the **first block of a long-term training plan** using the inputs below.

---

## 🏃 RUNNING PLAN SETUP

You will generate the **first 4-week block** of a long-term training plan that typically spans 12–16 weeks. This block serves as the foundation toward the user's goal event.

You will receive:

1. Proficiency Level – Beginner / Intermediate / Advanced  
2. Average Weekly Mileage (last 4 weeks)  
3. Longest Run in Past 4 Weeks  
4. Recent Race Time (optional) – Distance + hh:mm:ss  
5. Target Goal & Time (optional) – Distance + hh:mm:ss  
6. Training Pace Zones (optional) – Tempo, Interval, Goal Pace  
7. Preferred Training Days (e.g., Tue/Thu/Sat)  
8. Preferred Long Run Day  
9. Plan Start Date  
10. Race Date

---

### ✅ WHAT YOU MUST DO FOR RUNNING:

- Create a **4-week adaptive block** assuming a 12–16 week progression
- Week 1 mileage = ~80–100% of user's average  
- Increase weekly mileage by 5–10%, except for **Week 4** (deload)
- Assign runs only on selected training days  
- **Easy runs should NOT include warm-up or cooldown segments**
- **All hard runs** (e.g., tempo, interval, time trial) MUST include:
  - Warm-up (1–2 km)
  - Main effort
  - Cooldown (1–2 km)
- Add a **Fitness Evaluation (Time Trial)** in Week 4:
  - Distance = 30–50% of longest run, capped at 60% of goal race distance
  - May extend to 80% of recent race if appropriate
  - Assign to a midweek selected training day

**Time Trial pacing rules:**
- If no pace data → "Run at your best sustainable effort"
- If goal pace is provided → use:  
  "Run at your intended half-marathon pace" or  
  "Hold goal pace steadily"

---

### ✅ PACING & INTENSITY RULES:

- **Tempo, Interval, Threshold Runs**:
  - Always include:
    - Warm-up (1–2 km)
    - Main effort
    - Cooldown (1–2 km)

- **If Pacing Zones Provided**:
  - Tempo (e.g., 5:20–5:40)
  - Interval (e.g., 400m @ 4:45–5:00)
  - Goal pace segments (e.g., 5:12)

- **If Pacing Not Provided**, use effort:
  - Relaxed – full sentences  
  - Moderate – short phrases  
  - Hard – talking is difficult

- **Long Runs**:
  - Scale each week
  - Allow progression or goal-pace finish segments for advanced runners

- **Workout Variety**:
  - Use intervals like 400m, 800m, 1K, ladders
  - Tempo sessions can be steady, broken, or cruise intervals

---

## 💪 STRENGTH TRAINING SETUP

You will receive:

1. Strength Level – Beginner / Intermediate / Advanced  
2. Training Environment – Home / Gym  
3. Preferred Strength Days  
4.  Available Equipment – A list of available equipment based on user input (e.g., Dumbbells, Resistance Bands, Cable Machine)
5. Include Recovery Sessions – true / false  

---

### ✅ WHAT YOU MUST DO FOR STRENGTH:

- Compare strength and run days:
  - Do NOT return "warnings" for conflicts. The UI will handle that.

- Use only the equipment listed in the "Available Equipment" input field.  
  Do not assume additional gear is present based on environment alone.  
  Design all strength sessions using combinations of this user-selected equipment.

- If "Available Equipment" is missing or empty, assume only Bodyweight + Yoga Mat.

- If user selects minimal gear (e.g., only Bodyweight or Resistance Band), focus on foundational movement patterns and body control.

- If user selects gym machines or free weights, use those tools to increase variety and progression.

- Match **number of strength days** to structure:
  - 1–2 days → Full-body or runner-focused  
  - 3–4 days → Add splits: upper/lower/core/mobility

- Match **proficiency level** to volume:
  - Beginner →  4 exercises, 2–3 sets × 10–12 reps  
  - Intermediate →  5 exercises, 3–4 sets × 8–10 reps  
  - Advanced → 6 exercises, 4–5 sets × 6–8 reps

- Allow reuse of muscle groups across week, but vary exercise types

- Assign a **focus** to each session: Full Body, Core, Mobility, etc.

- If recovery = true → include 1 Mobility/Yoga session per week (20–30 mins)

---

Only return the structured JSON. Do not include natural language responses, summaries, or explanations.

Ensure the "training_schedule" array is sorted by "week" and then by logical day order (Mon to Sun).

Do not include a "warnings" key. Any schedule conflicts will be handled externally in the UI.

Estimate the total mileage for the full 12–16 week plan using fuzzy logic. You may internally consider a range (e.g., 270–300 km), but only return the **upper bound** of that range as "estimated_total_plan_mileage" (rounded to the nearest integer).

Estimate the total training duration in weeks and return it as "estimated_plan_duration_weeks" (e.g., 12, 14, 16).

---

## 📊 OUTPUT FORMAT (RETURN ONLY THIS STRUCTURE)

{
  "plan_summary": {
    "estimated_total_plan_mileage": 300,
    "estimated_plan_duration_weeks": 16,
    "block_run_mileage": 92,
    "strength_focus_summary": "2x total body + 1 mobility"
  },
  "training_schedule": [
    {
      "type": "run",
      "week": 1,
      "day": "Tue",
      "focus": "Easy Run",
      "description": "4 km relaxed pace"
    },
    {
      "type": "strength",
      "week": 1,
      "day": "Wed",
      "focus": "Full Body Strength",
      "description": [
        { "name": "Goblet Squat", "equipment": "Dumbbell", "sets": 3, "reps": "10–12" },
        { "name": "Push-Up", "equipment": "Bodyweight", "sets": 3, "reps": "10–12" }
      ]
    }
  ],
  "weekly_tips": {
    "week_1": ["Hydrate well", "Focus on recovery after tempo days"]
  }
}
`;

export async function POST(req: NextRequest) {
  try {
    const cookiesStore = (await cookies()) as any;
    const supabase = createRouteHandlerClient({ cookies: () => cookiesStore });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      console.error('Not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received request body:', body);
    // Compose user prompt from input
    const userPrompt = `Proficiency Level: ${body.proficiency}\nAverage Weekly Mileage: ${body.weeklyMileage}\nLongest Run: ${body.longestRun}\nRecent Race Time: ${body.recentRace || 'N/A'}\nTarget Goal & Time: ${body.goal}${body.goalTime ? ' in ' + body.goalTime : ''}\nTraining Pace Zones: ${body.paceZones || 'N/A'}\nPreferred Training Days: ${body.preferredDays?.join(', ') || 'N/A'}\nPreferred Long Run Day: ${body.longRunDay || 'N/A'}\nPlan Start Date: ${body.planStartDate || 'N/A'}\nRace Date: ${body.raceDate || 'N/A'}\nStrength Level: ${body.strengthLevel || 'N/A'}\nTraining Environment: ${body.strengthEnvironment || 'N/A'}\nPreferred Strength Days: ${body.strengthDays?.join(', ') || 'N/A'}\nAvailable Equipment: ${body.availableEquipment?.join(', ') || 'N/A'}\nInclude Recovery Sessions: ${body.includeRecovery ? 'true' : 'false'}`;

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
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: 'OpenAI error', details: error }, { status: 500 });
    }

    const data = await openaiRes.json();
    console.log('OpenAI API response:', data);
    const text = data.choices?.[0]?.message?.content || '';
    let planJson;
    try {
      planJson = JSON.parse(text);
      console.log('Parsed planJson:', planJson);
    } catch (e: any) {
      console.error('OpenAI output parse error:', e, text);
      return NextResponse.json({ error: 'OpenAI output parse error', details: e.message }, { status: 500 });
    }

    // Cancel any existing active plan for this user
    console.log('Attempting to cancel active plans for user:', session.user.id);
    const { data: cancelData, error: cancelError } = await supabase
      .from('training_plans')
      .update({ status: 'cancelled' })
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .select();
    if (cancelError) {
      console.error('Supabase cancel error:', cancelError.message);
    }
    if (!cancelData || cancelData.length === 0) {
      console.warn('No active plans were cancelled for user:', session.user.id);
    } else {
      console.log(`Cancelled ${cancelData.length} plan(s) for user:`, session.user.id);
    }

    // Use planStartDate and raceDate from the request body
    let start_date = body.planStartDate;
    let end_date = body.raceDate;
    if (!start_date) {
      // fallback to today if not provided
      const today = new Date();
      start_date = today.toISOString().slice(0, 10);
    }
    if (!end_date) {
      // fallback to 4 weeks from start_date if raceDate not provided
      const start = new Date(start_date);
      end_date = new Date(start.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    }

    // Insert into training_plans
    const { data: planRow, error: planError } = await supabase
      .from('training_plans')
      .insert({
        user_id: session.user.id,
        block_number: 1,
        start_date,
        end_date,
        plan_summary: planJson.plan_summary,
        plan_data: planJson,
        status: 'active',
        generated_at: new Date().toISOString(),
        inputs_json: body
      })
      .select()
      .single();

    if (planError) {
      console.error('Supabase insert error (training_plans):', planError.message, planError.details);
      return NextResponse.json({ error: 'Supabase insert error', details: planError.message }, { status: 500 });
    }
    const planId = planRow.id;

    // Insert weeks and sessions
    const weeks = [...new Set(planJson.training_schedule.map((s: any) => s.week))].sort((a, b) => (a as number) - (b as number));
    const weekIds: string[] = [];
    for (const weekNum of weeks) {
      const weekTips = planJson.weekly_tips[`week_${weekNum}`] || [];
      const weekSessions = planJson.training_schedule.filter((s: any) => s.week === weekNum);
      const weeklyDistance = weekSessions
        .filter((s: any) => s.type === 'run' && typeof s.description === 'string')
        .reduce((sum: number, s: any) => {
          const match = s.description.match(/(\d+(?:\.\d+)?)\s*km/);
          return sum + (match ? parseFloat(match[1]) : 0);
        }, 0);

      const { data: weekRow, error: weekError } = await supabase
        .from('plan_weeks')
        .insert({
          plan_id: planId,
          week_number: weekNum,
          weekly_tips: weekTips,
          weekly_distance: weeklyDistance
        })
        .select()
        .single();

      if (weekError) {
        console.error('Supabase week insert error:', weekError.message, weekError.details);
        return NextResponse.json({ error: 'Supabase week insert error', details: weekError.message }, { status: 500 });
      }
      weekIds.push(weekRow.id);

      for (const [order, session] of weekSessions.entries()) {
        const { error: sessionError } = await supabase.from('plan_sessions').insert({
          week_id: weekRow.id,
          day: session.day,
          type: session.type,
          focus: session.focus,
          description: session.description,
          order_in_day: order
        });
        if (sessionError) {
          console.error('Supabase session insert error:', sessionError.message, sessionError.details, session);
          return NextResponse.json({ error: 'Supabase session insert error', details: sessionError.message }, { status: 500 });
        }
      }
    }

    // Fetch the plan weeks and sessions from Supabase
    const { data: weeksData, error: weeksFetchError } = await supabase
      .from('plan_weeks')
      .select('*')
      .eq('plan_id', planId)
      .order('week_number', { ascending: true });
    if (weeksFetchError) {
      console.error('Supabase fetch error (plan_weeks):', weeksFetchError.message, weeksFetchError.details);
      return NextResponse.json({ error: 'Supabase fetch error (plan_weeks)', details: weeksFetchError.message }, { status: 500 });
    }
    const { data: sessionsData, error: sessionsFetchError } = await supabase
      .from('plan_sessions')
      .select('*')
      .in('week_id', weekIds)
      .order('order_in_day', { ascending: true });
    if (sessionsFetchError) {
      console.error('Supabase fetch error (plan_sessions):', sessionsFetchError.message, sessionsFetchError.details);
      return NextResponse.json({ error: 'Supabase fetch error (plan_sessions)', details: sessionsFetchError.message }, { status: 500 });
    }

    // Return the new plan data from the DB
    console.log('Plan created successfully, plan_id:', planId);
    return NextResponse.json({
      plan_id: planId,
      planSummary: planRow.plan_summary,
      weeks: weeksData,
      sessions: sessionsData
    });
  } catch (err) {
    console.error('API /generatePlan error:', err);
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
} 