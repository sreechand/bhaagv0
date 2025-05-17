"use client"

import React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Dumbbell, MonitorIcon as Running } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addDays, format } from 'date-fns';

function parsePlanJson(planData: any) {
  // If planData is a string, try to parse JSON (strip code block if needed)
  let json: any = planData;
  if (typeof planData === 'string') {
    const match = planData.match(/\{[\s\S]*\}/);
    try {
      json = JSON.parse(match ? match[0] : planData);
    } catch (e) {
      return null;
    }
  }
  // If planData is OpenAI response, extract content
  if (planData?.choices?.[0]?.message?.content) {
    const match = planData.choices[0].message.content.match(/\{[\s\S]*\}/);
    try {
      json = JSON.parse(match ? match[0] : planData.choices[0].message.content);
    } catch (e) {
      return null;
    }
  }
  return json;
}

const DAYS_ORDER = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];

function getWorkoutColor(type: string, focus?: string) {
  if (!type) return 'bg-gray-800/50 border-white/10';
  const t = type.toLowerCase();
  const f = (focus || '').toLowerCase();
  if (t === 'run') {
    if (f.includes('easy')) return 'bg-green-900/40 border-green-400';
    if (f.includes('tempo')) return 'bg-red-900/40 border-red-400';
    if (f.includes('interval')) return 'bg-yellow-900/40 border-yellow-400';
    if (f.includes('long')) return 'bg-blue-900/40 border-blue-400';
    if (f.includes('time trial') || f.includes('fitness')) return 'bg-pink-900/40 border-pink-400';
    return 'bg-primary/10 border-primary/30';
  }
  if (t === 'strength') return 'bg-purple-900/40 border-purple-400';
  return 'bg-gray-800/50 border-white/10';
}

export default function WeeklyPlan({ planData, planStartDate, onNewPlan }: { planData: any, planStartDate: string, onNewPlan?: () => void }) {
  const parsed = parsePlanJson(planData);
  if (!parsed) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 mb-4">No plan data available.</div>
        <div className="text-sm text-gray-500">Please try generating a new plan.</div>
      </div>
    );
  }
  const { plan_summary, training_schedule, weekly_tips } = parsed;
  // Find all unique weeks
  const weeks = (Array.from(new Set(training_schedule.map((s: any) => s.week))) as number[]).sort((a, b) => a - b);
  const [currentWeek, setCurrentWeek] = useState(0);

  // Clamp currentWeek to valid range
  React.useEffect(() => {
    setCurrentWeek(0);
  }, [planData]);
  React.useEffect(() => {
    if (currentWeek < 0) setCurrentWeek(0);
    if (currentWeek > weeks.length - 1) setCurrentWeek(weeks.length - 1);
  }, [currentWeek, weeks.length]);

  // Group sessions by day for the current week
  const weekNum = weeks[currentWeek];
  const weekSessions = training_schedule.filter((s: any) => s.week === weekNum);
  const dayMap: Record<string, any[]> = {};
  DAYS_ORDER.forEach(day => { dayMap[day] = []; });
  weekSessions.forEach((s: any) => {
    const day = (s.day.charAt(0).toUpperCase() + s.day.slice(1,3).toLowerCase());
    if (dayMap[day]) dayMap[day].push(s);
  });

  // Calculate the start date for the current week
  const startDate = planStartDate ? new Date(planStartDate) : null;
  const weekStartDate = startDate ? addDays(startDate, currentWeek * 7) : null;
  function getDateForDay(idx: number) {
    return weekStartDate ? format(addDays(weekStartDate, idx), 'EEE, yyyy-MM-dd') : '';
  }

  // Calculate weekly total distance (sum of all run distances in description)
  function extractDistance(desc: string): number {
    // Try to extract the first number (km) from the string
    const match = desc.match(/(\d+(?:\.\d+)?)\s*km/);
    return match ? parseFloat(match[1]) : 0;
  }
  const weeklyDistance = weekSessions
    .filter((s: any) => s.type === 'run' && typeof s.description === 'string')
    .reduce((sum: number, s: any) => sum + extractDistance(s.description), 0);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-4xl md:text-5xl font-exo font-black mb-2">Your Training Plan</h1>
        <p className="text-xl text-gray-300 font-barlow">Below is your personalized weekly schedule.</p>
      </div>
      {/* Plan Summary */}
      {plan_summary && (
        <div className="bg-black/30 rounded-lg p-4 border border-white/10 mb-6">
          <h3 className="text-xl font-exo font-bold mb-2">PLAN SUMMARY</h3>
          <div className="flex flex-wrap gap-6 text-gray-300 font-barlow">
            <div>Estimated Total Mileage: <span className="font-bold">{plan_summary.estimated_total_plan_mileage} km</span></div>
            <div>Plan Duration: <span className="font-bold">{plan_summary.estimated_plan_duration_weeks} weeks</span></div>
            <div>Block Run Mileage: <span className="font-bold">{plan_summary.block_run_mileage} km</span></div>
            <div>Strength Focus: <span className="font-bold">{plan_summary.strength_focus_summary}</span></div>
          </div>
        </div>
      )}
      {/* Week Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek((w) => Math.max(0, w - 1))}
            disabled={currentWeek === 0}
            className="rounded-full bg-black/30 border-white/20 hover:bg-black/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-barlow px-2">
            Week {currentWeek + 1} of {weeks.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeek((w) => Math.min(weeks.length - 1, w + 1))}
            disabled={currentWeek === weeks.length - 1}
            className="rounded-full bg-black/30 border-white/20 hover:bg-black/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
      {/* Daily Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 w-full">
        {DAYS_ORDER.map((day, idx) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`bg-black/30 rounded-lg border border-white/10 overflow-hidden min-h-[180px] flex flex-col w-full`}
            style={{ minWidth: 0 }}
          >
            <div className="bg-black/50 p-2 text-center font-barlow font-semibold border-b border-white/10">
              {day}
              <div className="text-xs text-gray-400 font-barlow mt-1">{getDateForDay(idx)}</div>
            </div>
            <div className="p-3 space-y-3 flex-1">
              {dayMap[day].length === 0 ? (
                <div className="text-gray-500 text-sm font-barlow text-center">Rest / No workout</div>
              ) : (
                dayMap[day].map((session, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${getWorkoutColor(session.type, session.focus)}`}
                  >
                    <div className="font-barlow font-semibold text-sm mb-1 capitalize">{session.type} - {session.focus}</div>
                    {Array.isArray(session.description) ? (
                      <ul className="text-xs text-gray-300 font-barlow list-disc pl-4">
                        {(session.description as any[]).map((ex: any, j: number) => (
                          <li key={j}>
                            {ex.name ? <span className="font-bold">{ex.name}</span> : null}
                            {ex.equipment ? ` (${ex.equipment})` : ''}
                            {ex.sets ? ` - ${ex.sets} sets` : ''}
                            {ex.reps ? ` x ${ex.reps}` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-300 font-barlow">{session.description as string}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Weekly Tips and Distance */}
      {(weekly_tips && weekly_tips[`week_${weekNum}`]) && (
        <div className="bg-black/30 rounded-lg p-4 border border-primary/30 mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-exo font-bold mb-2 text-primary">Tips for Week {weekNum}</h3>
            <ul className="list-disc pl-6 text-primary font-barlow">
              {(weekly_tips[`week_${weekNum}`] as string[]).map((tip: string, idx: number) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
          <div className="text-lg font-barlow text-primary mt-4 md:mt-0 md:text-right">
            <span className="font-bold">Weekly Total Distance: {weeklyDistance} km</span>
          </div>
        </div>
      )}
      {/* New Plan Button at the bottom */}
      {onNewPlan && (
        <div className="flex justify-center mt-10">
          <Button
            onClick={onNewPlan}
            className="px-8 py-4 text-xl font-exo font-bold rounded-lg bg-gradient-to-r from-primary to-secondary text-black hover:from-primary/80 hover:to-secondary/80 transition-all duration-200 shadow-lg"
          >
            New Plan
          </Button>
        </div>
      )}
    </div>
  );
}
