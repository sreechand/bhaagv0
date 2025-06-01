"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Dumbbell, MonitorIcon as Running } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addDays, format } from 'date-fns';
import type { Database } from '@/types/supabase';
import { supabase } from "@/lib/supabaseClient";

const DAYS_ORDER = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];

type PlanSummary = {
  estimated_total_plan_mileage: number;
  estimated_plan_duration_weeks: number;
  block_run_mileage: number;
  strength_focus_summary: string;
};

type PlanWeek = Database['public']['Tables']['plan_weeks']['Row'];
type PlanSession = Database['public']['Tables']['plan_sessions']['Row'];
type WorkoutLogInsert = Database['public']['Tables']['workout_logs']['Insert'];
type PlanSessionUpdate = Database['public']['Tables']['plan_sessions']['Update'];

type WeeklyPlanProps = {
  planSummary: PlanSummary;
  weeks: PlanWeek[];
  sessions: PlanSession[];
  workoutLogs: any[];
  onNewPlan?: () => void;
  onActiveWeekDoubleClick?: () => void;
};

type WorkoutLogModalProps = {
  session: PlanSession;
  onClose: () => void;
  onLogged: () => void;
};

/** Remove any keys whose value is `undefined` */
function omitUndefined<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    if (v !== undefined) (acc as any)[k] = v;
    return acc;
  }, {} as Partial<T>);
}

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

function WorkoutLogModal({ session, onClose, onLogged }: WorkoutLogModalProps) {
  const [distance, setDistance] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [avgHeartRate, setAvgHeartRate] = useState<string>("");
  const [maxHeartRate, setMaxHeartRate] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Fetch current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Supabase user fetch error:', userError);
      setSaving(false);
      return;
    }
    // Build and log the raw workout log object
    const rawLog = {
      avg_heart_rate: avgHeartRate ? +avgHeartRate : undefined,
      created_at: undefined,
      date: new Date().toISOString().slice(0, 10),
      distance: distance ? +distance : undefined,
      elapsed_time: elapsedTime ? +elapsedTime : undefined,
      id: undefined,
      max_heart_rate: maxHeartRate ? +maxHeartRate : undefined,
      notes: notes ? notes : undefined,
      rpe: rpe ? +rpe : undefined,
      session_id: session.id,
      user_id: user.id,
    };
    console.log('Raw workout log object:', rawLog);

    const newLog = omitUndefined(rawLog);
    console.log('Workout log payload after omitUndefined:', newLog);

    const { error } = await supabase.from("workout_logs").insert([newLog]);
    if (error) {
      console.error('Supabase insert error:', error, 'Payload:', newLog);
    }
    setSaving(false);
    if (!error) onLogged();
    // Optionally show error
  };

  const handleSkip = async () => {
    setSkipping(true);
    // Fetch current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Supabase user fetch error:', userError);
      setSkipping(false);
      return;
    }
    const skipLog = {
      avg_heart_rate: undefined,
      created_at: undefined,
      date: new Date().toISOString().slice(0, 10),
      distance: undefined,
      elapsed_time: undefined,
      id: undefined,
      max_heart_rate: undefined,
      notes: 'SKIPPED',
      rpe: undefined,
      session_id: session.id,
      user_id: user.id,
      skipped: true,
    };
    const newLog = omitUndefined(skipLog);
    const { error } = await supabase.from("workout_logs").insert([newLog]);
    if (error) {
      console.error('Supabase insert error (skip):', error, 'Payload:', newLog);
    }
    setSkipping(false);
    if (!error) onLogged();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-primary/40">
        {/* Close button */}
        <button type="button" onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold focus:outline-none">
          ×
        </button>
        <h2 className="text-2xl font-exo font-bold mb-6 text-primary text-center">Log Workout</h2>
        <div className="mb-4">
          <label className="block text-sm font-barlow text-gray-300 mb-1">Distance (km)</label>
          <input type="number" value={distance} onChange={e => setDistance(e.target.value)} className="w-full bg-black/40 border border-primary/30 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 transition" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-barlow text-gray-300 mb-1">Elapsed Time (seconds)</label>
          <input type="number" value={elapsedTime} onChange={e => setElapsedTime(e.target.value)} className="w-full bg-black/40 border border-primary/30 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 transition" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-barlow text-gray-300 mb-1">RPE (1-10)</label>
          <input type="number" min={1} max={10} value={rpe} onChange={e => setRpe(e.target.value)} className="w-full bg-black/40 border border-primary/30 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 transition" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-barlow text-gray-300 mb-1">Average Heart Rate (bpm)</label>
          <input type="number" value={avgHeartRate} onChange={e => setAvgHeartRate(e.target.value)} className="w-full bg-black/40 border border-primary/30 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 transition" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-barlow text-gray-300 mb-1">Max Heart Rate (bpm)</label>
          <input type="number" value={maxHeartRate} onChange={e => setMaxHeartRate(e.target.value)} className="w-full bg-black/40 border border-primary/30 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 transition" />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-barlow text-gray-300 mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-black/40 border border-primary/30 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 transition min-h-[60px]" />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-700 text-gray-200 rounded-lg font-barlow hover:bg-gray-600 transition">Cancel</button>
          <button type="button" onClick={handleSkip} disabled={saving || skipping} className="px-5 py-2 bg-red-700 text-white rounded-lg font-barlow font-bold shadow hover:bg-red-800 transition disabled:opacity-60">
            {skipping ? "Skipping..." : "Skip Workout"}
          </button>
          <button type="submit" disabled={saving || skipping} className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-black rounded-lg font-barlow font-bold shadow hover:from-primary/80 hover:to-secondary/80 transition disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

const WeeklyPlan: React.FC<WeeklyPlanProps> = ({ planSummary, weeks, sessions, workoutLogs, onNewPlan, onActiveWeekDoubleClick }) => {
  const [currentWeekIdx, setCurrentWeekIdx] = useState<number>(0);
  const [logModalSession, setLogModalSession] = useState<PlanSession | null>(null);
  // Drag-and-drop state
  const [draggedSession, setDraggedSession] = useState<PlanSession | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  if (!weeks.length) return <div>No plan data available.</div>;

  const week = weeks[currentWeekIdx];
  const weekSessions = sessions.filter((s) => s.week_id === week.id);
  // Group by day
  const dayMap: Record<string, PlanSession[]> = {};
  DAYS_ORDER.forEach((day) => { dayMap[day] = []; });
  weekSessions.forEach((s) => {
    const day = s.day.charAt(0).toUpperCase() + s.day.slice(1, 3).toLowerCase();
    if (dayMap[day]) dayMap[day].push(s);
  });

  // Calculate the start date for the current week
  const startDate = (week as any).start_date ? new Date((week as any).start_date) : null;
  const weekStartDate = startDate ? addDays(startDate, currentWeekIdx * 7) : null;
  function getDateForDay(idx: number) {
    return weekStartDate ? format(addDays(weekStartDate, idx), 'EEE, yyyy-MM-dd') : '';
  }

  // Calculate weekly total distance (sum of all run distances in description)
  function extractDistance(desc: string): number {
    const match = typeof desc === 'string' ? desc.match(/(\d+(?:\.\d+)?)\s*km/) : null;
    return match ? parseFloat(match[1]) : 0;
  }
  const weeklyDistance = weekSessions
    .filter((s) => s.type === 'run' && typeof s.description === 'string')
    .reduce((sum, s) => sum + extractDistance(typeof s.description === 'string' ? s.description : ''), 0);

  // Drag-and-drop handlers
  const handleDragStart = (session: PlanSession) => {
    setDraggedSession(session);
  };
  const handleDragEnd = () => {
    setDraggedSession(null);
    setDragOverDay(null);
  };
  const handleDragOver = (day: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDay(day);
  };
  const handleDrop = async (day: string) => {
    if (!draggedSession || draggedSession.day === day) return;
    // Update session day in Supabase
    const updatePayload: Database['public']['Tables']['plan_sessions']['Update'] = { day };
    await supabase
      .from('plan_sessions')
      .update(updatePayload)
      .eq('id', draggedSession.id as string);
    setDraggedSession(null);
    setDragOverDay(null);
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-4xl md:text-5xl font-exo font-black mb-2">Your Training Plan</h1>
        <p className="text-xl text-gray-300 font-barlow">Below is your personalized weekly schedule.</p>
      </div>
      {/* Plan Summary */}
      {planSummary && (
        <div className="bg-black/30 rounded-lg p-4 border border-white/10 mb-6">
          <h3 className="text-xl font-exo font-bold mb-2">PLAN SUMMARY</h3>
          <div className="flex flex-wrap gap-6 text-gray-300 font-barlow">
            <div>Estimated Total Mileage: <span className="font-bold">{planSummary.estimated_total_plan_mileage} km</span></div>
            <div>Plan Duration: <span className="font-bold">{planSummary.estimated_plan_duration_weeks} weeks</span></div>
            <div>Block Run Mileage: <span className="font-bold">{planSummary.block_run_mileage} km</span></div>
            <div>Strength Focus: <span className="font-bold">{planSummary.strength_focus_summary}</span></div>
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
            onClick={() => setCurrentWeekIdx((w) => Math.max(0, w - 1))}
            disabled={currentWeekIdx === 0}
            className="rounded-full bg-black/30 border-white/20 hover:bg-black/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-barlow px-2">
            Week {currentWeekIdx + 1} of {weeks.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekIdx((w) => Math.min(weeks.length - 1, w + 1))}
            disabled={currentWeekIdx === weeks.length - 1}
            className="rounded-full bg-black/30 border-white/20 hover:bg-black/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
      {/* Daily Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-7 gap-4 w-full"
      >
        {DAYS_ORDER.map((day, idx) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`bg-black/30 rounded-lg border border-white/10 overflow-hidden min-h-[180px] flex flex-col w-full ${dragOverDay === day ? 'ring-2 ring-primary' : ''}`}
            style={{ minWidth: 0 }}
            onDragOver={e => handleDragOver(day, e)}
            onDrop={() => handleDrop(day)}
            onDragLeave={() => setDragOverDay(null)}
            onDoubleClick={() => {
              if (dayMap[day].length > 0 && onActiveWeekDoubleClick) {
                onActiveWeekDoubleClick();
              }
            }}
          >
            <div className="bg-black/50 p-2 text-center font-barlow font-semibold border-b border-white/10">
              {day}
              <div className="text-xs text-gray-400 font-barlow mt-1">{getDateForDay(idx)}</div>
            </div>
            <div className="p-3 space-y-3 flex-1">
              {dayMap[day].length === 0 ? (
                <div className="text-gray-500 text-sm font-barlow text-center">Rest / No workout</div>
              ) :
                dayMap[day].map((session, i) => {
                  // Check if session is logged or skipped
                  const log = workoutLogs.find(log => log.session_id === session.id);
                  const isLogged = !!log && !log.skipped;
                  const isSkipped = !!log && log.skipped;
                  const isClosed = !!log;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${getWorkoutColor(session.type, session.focus || '')} relative ${draggedSession?.id === session.id ? 'opacity-50' : ''}`}
                      draggable={!isClosed}
                      style={{ cursor: isClosed ? 'not-allowed' : 'grab', opacity: isClosed ? 0.6 : 1 }}
                      onDragStart={() => !isClosed && handleDragStart(session)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="font-barlow font-semibold text-sm mb-1 capitalize flex items-center gap-2">
                        {session.type} - {(session.focus || '')}
                        {isLogged && <span className="ml-2 text-green-400" title="Workout logged">✔</span>}
                        {isSkipped && <span className="ml-2 text-red-500" title="Workout skipped">❌</span>}
                      </div>
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
                        <div className="text-xs text-gray-300 font-barlow">{typeof session.description === 'string' ? session.description : ''}</div>
                      )}
                    </div>
                  );
                })
              }
            </div>
          </motion.div>
        ))}
      </div>
      {/* Weekly Tips and Distance */}
      {week.weekly_tips && (
        <div className="bg-black/30 rounded-lg p-4 border border-primary/30 mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-exo font-bold mb-2 text-primary">Tips for This Week</h3>
            <ul className="list-disc pl-6 text-primary font-barlow">
              {(week.weekly_tips as string[]).map((tip: string, idx: number) => (
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
      {/* Workout Log Modal */}
      {logModalSession && (
        <WorkoutLogModal
          session={logModalSession}
          onClose={() => setLogModalSession(null)}
          onLogged={() => {
            setLogModalSession(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default WeeklyPlan;
