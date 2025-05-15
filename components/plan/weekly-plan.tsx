"use client"

import React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Dumbbell, MonitorIcon as Running } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addDays, format } from 'date-fns';

function parseWeeklyPlan(markdown: string) {
  const weekBlocks = markdown.split(/#### Week /).slice(1);
  const weeks = weekBlocks.map((block) => {
    const [weekHeader, ...rest] = block.split('\n');
    const weekNum = weekHeader.match(/^(\d+)/)?.[1] || '';
    const totalMileage = block.match(/Total Mileage:\*\* ([0-9]+) miles/)?.[1] || '';
    const tableMatch = block.match(/\| Day.*\|([\s\S]*?)\n\n/);
    const tableRows = tableMatch
      ? tableMatch[1]
          .split('\n')
          .map((row) => row.trim())
          .filter((row) => row && !row.startsWith('|---'))
          .map((row) => {
            const cols = row.split('|').map((c) => c.trim());
            return {
              day: cols[1],
              type: cols[2],
              desc: cols[3],
            };
          })
      : [];
    return {
      weekNum,
      totalMileage,
      workouts: tableRows,
    };
  });

  // Extract weekly tips
  const tipsBlock = markdown.split('### Weekly Tips')[1] || '';
  const tips = tipsBlock
    .split('\n- ')
    .slice(1)
    .map((tip) => {
      const [week, ...rest] = tip.split(':');
      return { week: week.replace(/\*\*/g, '').trim(), tip: rest.join(':').trim() };
    });

  return { weeks, tips };
}

const DAYS_ORDER = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];

function getWorkoutColor(type: string, desc: string) {
  const t = type.toLowerCase();
  const d = desc.toLowerCase();
  if (t.includes('easy') || t.includes('long')) return 'bg-green-900/40 border-green-400';
  if (t.includes('interval')) return 'bg-yellow-900/40 border-yellow-400';
  if (t.includes('tempo')) return 'bg-red-900/40 border-red-400';
  if (t.includes('strength')) return 'bg-purple-900/40 border-purple-400';
  if (t.includes('rest')) return 'bg-blue-900/40 border-blue-400';
  if (t.includes('fitness') || t.includes('assessment') || d.includes('evaluation') || d.includes('time trial')) return 'bg-red-950 border-red-700';
  return 'bg-gray-800/50 border-white/10';
}

export default function WeeklyPlan({ planData, planStartDate }: { planData: any, planStartDate: string }) {
  const markdown = planData?.choices?.[0]?.message?.content || "";
  const { weeks, tips } = parseWeeklyPlan(markdown);
  const [currentWeek, setCurrentWeek] = React.useState(0);

  if (!weeks.length) {
    return <div className="text-center text-gray-400">No plan data available.</div>;
  }

  // Calculate the start date for the current week
  const startDate = planStartDate ? new Date(planStartDate) : null;
  const weekStartDate = startDate ? addDays(startDate, currentWeek * 7) : null;

  // Group workouts by day for the current week
  const dayMap: Record<string, { type: string; desc: string }[]> = {};
  weeks[currentWeek].workouts.forEach((w) => {
    if (!dayMap[w.day]) dayMap[w.day] = [];
    dayMap[w.day].push({ type: w.type, desc: w.desc });
  });

  // Helper to get the date for a given day index (0=Mon, 6=Sun)
  function getDateForDay(idx: number) {
    return weekStartDate ? format(addDays(weekStartDate, idx), 'EEE, yyyy-MM-dd') : '';
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-exo font-black mb-2">Your Training Plan</h1>
          <p className="text-xl text-gray-300 font-barlow">Below is your personalized weekly schedule.</p>
        </div>
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
            Week {weeks[currentWeek].weekNum} of {weeks.length}
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
      {/* Weekly Summary */}
      <div className="bg-black/30 rounded-lg p-4 border border-white/10 mb-6">
        <h3 className="text-xl font-exo font-bold mb-2">Week {weeks[currentWeek].weekNum} Summary</h3>
        <div className="text-gray-400 mb-2">Total Distance: <span className="font-bold">{weeks[currentWeek].totalMileage} km</span></div>
        {tips[currentWeek] && (
          <div className="text-sm text-primary mt-2">
            <span className="font-bold">{tips[currentWeek].week}:</span> {tips[currentWeek].tip}
          </div>
        )}
      </div>
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
              {(dayMap[day] || []).length === 0 ? (
                <div className="text-gray-500 text-sm font-barlow text-center">Rest / No workout</div>
              ) : (
                dayMap[day].map((workout, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${getWorkoutColor(workout.type, workout.desc)}`}
                  >
                    <div className="font-barlow font-semibold text-sm mb-1">{workout.type}</div>
                    <div className="text-xs text-gray-300 font-barlow">{workout.desc}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
