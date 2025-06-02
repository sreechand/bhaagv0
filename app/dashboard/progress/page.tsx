"use client";
import React, { useState, useRef } from "react";
import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from "recharts";
import { TrendingUp, Map, Clock, Flame, Award, Zap, Trophy, Star, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Confetti component (simple SVG burst)
function Confetti({ show }: { show: boolean }) {
  return show ? (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <svg width="200" height="200">
        {[...Array(20)].map((_, i) => (
          <circle
            key={i}
            cx={100}
            cy={100}
            r={6 + Math.random() * 6}
            fill={`hsl(${Math.random() * 360},90%,60%)`}
            style={{
              transform: `translate(${Math.cos((i / 20) * 2 * Math.PI) * 80}px,${Math.sin((i / 20) * 2 * Math.PI) * 80}px)`
            }}
          />
        ))}
      </svg>
    </div>
  ) : null;
}

const paceDataDay = [
  { date: "6am", pace: 6.4 },
  { date: "7am", pace: 6.2 },
  { date: "8am", pace: 6.1 },
  { date: "9am", pace: 6.0 },
  { date: "10am", pace: 5.9 },
  { date: "11am", pace: 5.8 },
  { date: "12pm", pace: 5.7 },
];
const distanceDataDay = [
  { date: "6am", distance: 1 },
  { date: "7am", distance: 1.2 },
  { date: "8am", distance: 1.5 },
  { date: "9am", distance: 1.1 },
  { date: "10am", distance: 1.3 },
  { date: "11am", distance: 1.7 },
  { date: "12pm", distance: 1.2 },
];
const paceDataWeek = [
  { date: "Mon", pace: 6.2 },
  { date: "Tue", pace: 6.0 },
  { date: "Wed", pace: 5.8 },
  { date: "Thu", pace: 5.9 },
  { date: "Fri", pace: 5.7 },
  { date: "Sat", pace: 5.6 },
  { date: "Sun", pace: 5.5 },
];
const distanceDataWeek = [
  { date: "Mon", distance: 5 },
  { date: "Tue", distance: 6 },
  { date: "Wed", distance: 7 },
  { date: "Thu", distance: 5 },
  { date: "Fri", distance: 8 },
  { date: "Sat", distance: 10 },
  { date: "Sun", distance: 12 },
];
const paceDataMonth = [
  { date: "W1", pace: 6.3 },
  { date: "W2", pace: 6.1 },
  { date: "W3", pace: 5.9 },
  { date: "W4", pace: 5.7 },
];
const distanceDataMonth = [
  { date: "W1", distance: 20 },
  { date: "W2", distance: 28 },
  { date: "W3", distance: 32 },
  { date: "W4", distance: 38 },
];

const achievementBadges = [
  { icon: <Trophy className="text-yellow-400" size={24} />, label: "First 10K" },
  { icon: <Star className="text-blue-400" size={24} />, label: "Consistency Champ" },
  { icon: <Flame className="text-red-500" size={24} />, label: "7-Day Streak" },
];

// Generate mock streak data for 35 days (calendar grid)
const daysInGrid = 35;
const todayIndex = daysInGrid - 1;
const streakCalendarGrid = Array.from({ length: daysInGrid }, (_, i) => {
  // Mock: last 7 days are runs, rest are random
  if (i > daysInGrid - 8) return 1;
  return Math.random() > 0.4 ? 1 : 0;
});
const daysOfWeekGrid = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const currentStreakCount = streakCalendarGrid.slice(-1 * (streakCalendarGrid.reverse().findIndex(d => d === 0) || daysInGrid)).length;
streakCalendarGrid.reverse(); // restore order

const streakRunInfo = [
  { date: 'Sun', run: true, km: 5 },
  { date: 'Mon', run: true, km: 6 },
  { date: 'Tue', run: true, km: 7 },
  { date: 'Wed', run: false, km: 0 },
  { date: 'Thu', run: true, km: 8 },
  { date: 'Fri', run: true, km: 5 },
  { date: 'Sat', run: true, km: 10 },
  { date: 'Sun', run: true, km: 6 },
  { date: 'Mon', run: false, km: 0 },
  { date: 'Tue', run: true, km: 7 },
  { date: 'Wed', run: true, km: 8 },
  { date: 'Thu', run: true, km: 5 },
  { date: 'Fri', run: true, km: 6 },
  { date: 'Sat', run: true, km: 12 },
];
const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const bestPaceDay = Math.min(...paceDataDay.map(d => d.pace));
const bestPaceWeek = Math.min(...paceDataWeek.map(d => d.pace));
const bestPaceMonth = Math.min(...paceDataMonth.map(d => d.pace));
const longestRunDay = Math.max(...distanceDataDay.map(d => d.distance));
const longestRunWeek = Math.max(...distanceDataWeek.map(d => d.distance));
const longestRunMonth = Math.max(...distanceDataMonth.map(d => d.distance));
const dailyGoal = 2; // km
const weeklyGoal = 40; // km
const monthlyGoal = 150; // km
const distanceToday = distanceDataDay.reduce((sum, d) => sum + d.distance, 0);
const distanceThisWeek = distanceDataWeek.reduce((sum, d) => sum + d.distance, 0);
const distanceThisMonth = distanceDataMonth.reduce((sum, d) => sum + d.distance, 0);
const probableTimingDay = "5:10 (1K Estimate)";
const probableTimingWeek = "24:30 (5K Estimate)";
const probableTimingMonth = "52:00 (10K Estimate)";
const motivationalQuotes = [
  "Every run brings you closer to your best.",
  "Consistency is the key to progress!",
  "You're stronger than you think.",
  "One run at a time, one step at a time.",
];
const quote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length];

function getTrendArrow(current: number, previous: number) {
  if (current < previous) return <ArrowUpRight className="text-green-400 inline ml-1 animate-bounce" size={18} aria-label="Improved!" />;
  if (current > previous) return <ArrowDownRight className="text-red-400 inline ml-1 animate-bounce" size={18} aria-label="Declined" />;
  return null;
}

// --- StreakCalendarCard component ---
function StreakCalendarCard({ streakCalendarGrid, todayIndex, currentStreakCount }: { streakCalendarGrid: number[], todayIndex: number, currentStreakCount: number }) {
  // Milestone logic
  const milestones = [7, 14, 30];
  const hitMilestone = milestones.find(m => currentStreakCount === m);
  const [showConfetti, setShowConfetti] = React.useState(false);
  React.useEffect(() => {
    if (hitMilestone) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(t);
    }
  }, [hitMilestone]);

  // Tooltip logic
  const [tooltip, setTooltip] = React.useState<{ x: number, y: number, text: string } | null>(null);
  const gridStartDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - (streakCalendarGrid.length - 1));
    return d;
  })();
  function getDateForCell(i: number) {
    const d = new Date(gridStartDate);
    d.setDate(d.getDate() + i);
    return d;
  }

  return (
    <Card className="w-full max-w-xs md:max-w-sm bg-gradient-to-br from-[#232526] to-[#414345] border-2 border-primary/40 shadow-2xl p-6 flex flex-col items-center rounded-3xl relative overflow-visible">
      {/* Confetti burst on milestone */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <svg width="180" height="120">
              {[...Array(24)].map((_, i) => (
                <circle
                  key={i}
                  cx={90}
                  cy={60}
                  r={6 + Math.random() * 6}
                  fill={`hsl(${Math.random() * 360},90%,60%)`}
                  style={{
                    transform: `translate(${Math.cos((i / 24) * 2 * Math.PI) * 70}px,${Math.sin((i / 24) * 2 * Math.PI) * 40}px)`
                  }}
                />
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Animated streak count */}
      <div className="flex flex-col items-center mb-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400/80 to-orange-500/80 shadow-lg border-2 border-yellow-300 text-black text-2xl font-extrabold animate-pulse mb-1"
        >
          <Flame className="w-7 h-7 text-red-500 animate-bounce" />
          {currentStreakCount} Day Streak
        </motion.div>
        {hitMilestone && (
          <span className="text-yellow-300 font-bold text-sm mt-1 flex items-center gap-1 animate-bounce">
            <Trophy className="w-4 h-4" /> {hitMilestone}-Day Milestone!
          </span>
        )}
      </div>
      {/* Calendar grid */}
      <div className="flex flex-col items-center w-full">
        {/* Day of week labels */}
        <div className="grid grid-cols-7 gap-2 mb-1 w-full">
          {daysOfWeekGrid.map((d, i) => (
            <div key={i} className="text-xs text-gray-400 text-center font-bold">{d}</div>
          ))}
        </div>
        {/* 5x7 grid */}
        <div className="grid grid-cols-7 gap-2 mb-2 w-full">
          {streakCalendarGrid.map((run, i) => {
            const isToday = i === todayIndex;
            const dateObj = getDateForCell(i);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return (
              <motion.div
                key={i}
                className={`relative flex items-center justify-center
                  ${isToday ? 'w-10 h-10 md:w-12 md:h-12 z-10 shadow-xl ring-4 ring-blue-400/80 bg-gradient-to-br from-blue-400 to-green-400 animate-pulse scale-110' :
                    run ? 'w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-400 to-blue-400 shadow-md' :
                      'w-8 h-8 md:w-10 md:h-10 bg-zinc-700 shadow-inner'}
                  rounded-2xl transition-all duration-200 cursor-pointer border-2 border-white/10 hover:scale-110`}
                onMouseEnter={e => setTooltip({ x: e.currentTarget.getBoundingClientRect().left, y: e.currentTarget.getBoundingClientRect().top, text: `${dateStr}: ${run ? 'Run' : 'Rest'}` })}
                onMouseLeave={() => setTooltip(null)}
                onTouchStart={e => setTooltip({ x: e.currentTarget.getBoundingClientRect().left, y: e.currentTarget.getBoundingClientRect().top, text: `${dateStr}: ${run ? 'Run' : 'Rest'}` })}
                onTouchEnd={() => setTooltip(null)}
                title={isToday ? 'Today' : run ? 'Run' : 'Rest'}
              >
                {isToday && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs text-blue-300 font-bold">Today</span>}
              </motion.div>
            );
          })}
        </div>
        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed z-50 px-3 py-2 rounded-lg bg-zinc-900/90 text-white text-xs shadow-xl border border-primary/30 pointer-events-none"
              style={{ left: tooltip.x + 30, top: tooltip.y - 10 }}
            >
              {tooltip.text}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Legend */}
        <div className="flex flex-row items-center gap-4 mt-2">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-blue-400" /> <span className="text-xs text-gray-400">Run</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-zinc-700" /> <span className="text-xs text-gray-400">Rest</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full ring-2 ring-blue-400" /> <span className="text-xs text-gray-400">Today</span></div>
        </div>
      </div>
    </Card>
  );
}

export default function ProgressPage() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [showConfetti, setShowConfetti] = useState(false);
  const paceData = view === 'day' ? paceDataDay : view === 'week' ? paceDataWeek : paceDataMonth;
  const distanceData = view === 'day' ? distanceDataDay : view === 'week' ? distanceDataWeek : distanceDataMonth;
  const goal = view === 'day' ? dailyGoal : view === 'week' ? weeklyGoal : monthlyGoal;
  const distance = view === 'day' ? distanceToday : view === 'week' ? distanceThisWeek : distanceThisMonth;
  const goalPercent = Math.min(100, Math.round((distance / goal) * 100));
  const bestPace = view === 'day' ? bestPaceDay : view === 'week' ? bestPaceWeek : bestPaceMonth;
  const longestRun = view === 'day' ? longestRunDay : view === 'week' ? longestRunWeek : longestRunMonth;
  const bestPacePoint = paceData.reduce((best, d) => (d.pace < best.pace ? d : best), paceData[0]);
  const longestRunPoint = distanceData.reduce((best, d) => (d.distance > best.distance ? d : best), distanceData[0]);
  const probableTiming = view === 'day' ? probableTimingDay : view === 'week' ? probableTimingWeek : probableTimingMonth;
  const newPB = bestPacePoint.pace === bestPace;
  const previousBestPace = view === 'day' ? 6.5 : view === 'week' ? 6.1 : 6.2; // mock previous
  const previousDistance = view === 'day' ? 6.0 : view === 'week' ? 38 : 120; // mock previous

  // Confetti on new PB or goal
  React.useEffect(() => {
    if (newPB || goalPercent === 100) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(t);
    }
  }, [newPB, goalPercent]);

  // Share button logic
  const shareRef = useRef<HTMLDivElement>(null);
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Running Progress',
        text: `My probable timing: ${probableTiming} and best pace: ${bestPace} min/km!`,
        url: window.location.href
      });
    } else {
      // fallback: copy to clipboard
      navigator.clipboard.writeText(`My probable timing: ${probableTiming} and best pace: ${bestPace} min/km!`);
      alert('Progress copied to clipboard!');
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isPace = payload[0].dataKey === 'pace';
      const value = payload[0].value;
      return (
        <div className="bg-zinc-900 border border-primary/30 rounded-lg px-3 py-2 text-xs text-white shadow-xl">
          <div className="font-bold mb-1">{label}</div>
          <div>
            {isPace ? (
              <>
                Pace: <span className="text-primary font-bold">{value} min/km</span>
                {value === bestPace && <span className="ml-2 text-yellow-400 font-bold">PB!</span>}
              </>
            ) : (
              <>
                Distance: <span className="text-orange-400 font-bold">{value} km</span>
                {value === longestRun && <span className="ml-2 text-yellow-400 font-bold">Longest!</span>}
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <Confetti show={showConfetti} />
      <Navbar onLoginClick={() => {}} />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-exo font-black mb-4 text-center tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-lg">
          Your Progress
        </h1>
        <div className="text-center text-lg text-gray-300 mb-8 italic flex flex-col items-center gap-2">
          <span>“{quote}”</span>
          {currentStreakCount >= 5 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/60 text-green-400 font-semibold animate-pulse">
              <Flame className="w-5 h-5" /> Streak: {currentStreakCount} days
            </span>
          )}
        </div>
        {/* Achievement Badges */}
        <div className="flex flex-row items-center justify-center gap-4 mb-8">
          {achievementBadges.map((badge, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="rounded-full bg-zinc-800 p-3 shadow-lg group-hover:scale-110 transition-transform duration-200">
                {badge.icon}
              </div>
              <span className="text-xs text-gray-400 mt-1 group-hover:text-primary transition-colors duration-200">{badge.label}</span>
            </div>
          ))}
        </div>
        {/* Main Progress Content + Vertical Streak Calendar */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Main Progress Content */}
          <div className="flex-1">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900/80 to-black/80 border border-primary/20 shadow-2xl p-6 group relative overflow-hidden">
                <TrendingUp className="text-primary mb-2" size={32} />
                <div className="text-lg font-semibold text-gray-300">Best Pace {getTrendArrow(bestPace, previousBestPace)}</div>
                <div className="text-3xl font-extrabold text-primary mb-1 flex items-center gap-2">
                  {bestPace} <span className="text-base font-normal">min/km</span>
                  {newPB && <span className="ml-2 px-2 py-1 rounded-full bg-yellow-400/90 text-black text-xs font-bold animate-bounce flex items-center gap-1"><Award className="w-4 h-4" /> New PB!</span>}
                </div>
                <div className="text-xs text-gray-400">Fastest pace {view === 'day' ? 'today' : view === 'week' ? 'this week' : 'this month'}</div>
                {newPB && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <span className="text-yellow-400 text-6xl animate-ping opacity-20">🏅</span>
                  </div>
                )}
              </Card>
              <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900/80 to-black/80 border border-orange-400/20 shadow-2xl p-6 group relative overflow-hidden">
                <Map className="text-orange-400 mb-2" size={32} />
                <div className="text-lg font-semibold text-gray-300">Longest Run {getTrendArrow(longestRun, previousDistance)}</div>
                <div className="text-3xl font-extrabold text-orange-400 mb-1">{longestRun} <span className="text-base font-normal">km</span></div>
                <div className="text-xs text-gray-400">Longest distance in a single run</div>
              </Card>
              <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900/80 to-black/80 border border-green-400/20 shadow-2xl p-6 group relative overflow-hidden">
                <Award className="text-green-400 mb-2" size={32} />
                <div className="text-lg font-semibold text-gray-300">Goal Progress</div>
                <div className="w-full bg-zinc-800 rounded-full h-4 mt-2 mb-2">
                  <div className="bg-green-400 h-4 rounded-full transition-all duration-700" style={{ width: `${goalPercent}%` }} />
                </div>
                <div className="text-base font-bold text-green-400">{distance} / {goal} km</div>
                <div className="text-xs text-gray-400">{view === 'day' ? 'Daily' : view === 'week' ? 'Weekly' : 'Monthly'} Distance Goal</div>
              </Card>
              {/* Streak Calendar Card as a stat card */}
              <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900/80 to-black/80 border border-primary/20 shadow-xl p-6 rounded-xl min-w-0">
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center gap-1 mb-1">
                    <CalendarIcon className="text-primary" size={20} />
                    <span className="font-semibold text-primary text-base">Streak</span>
                  </div>
                  {/* Streak count */}
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/60 text-green-400 font-semibold animate-pulse text-sm">
                      <Flame className="w-4 h-4" /> {currentStreakCount} days
                    </span>
                  </div>
                  {/* Day of week labels */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {daysOfWeekGrid.map((d, i) => (
                      <div key={i} className="text-[11px] text-gray-400 text-center font-bold">{d}</div>
                    ))}
                  </div>
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {streakCalendarGrid.map((run, i) => {
                      const isToday = i === todayIndex;
                      return (
                        <div
                          key={i}
                          className={`w-5 h-5 rounded-full flex items-center justify-center
                            ${run ? 'bg-green-400 animate-pulse' : 'bg-zinc-700'}
                            ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                          title={isToday ? 'Today' : ''}
                        />
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-row items-center gap-1 mt-2">
                    <div className="flex items-center gap-0.5"><div className="w-2 h-2 rounded-full bg-green-400" /> <span className="text-[10px] text-gray-400">Run</span></div>
                    <div className="flex items-center gap-0.5"><div className="w-2 h-2 rounded-full bg-zinc-700" /> <span className="text-[10px] text-gray-400">Rest</span></div>
                    <div className="flex items-center gap-0.5"><div className="w-2 h-2 rounded-full ring-2 ring-blue-400" /> <span className="text-[10px] text-gray-400">Today</span></div>
                  </div>
                </div>
              </Card>
            </div>
            {/* Charts */}
            <div className="flex flex-col md:flex-row gap-8 mb-10">
              <Card className="flex-[1.2] bg-gradient-to-br from-zinc-900/80 to-black/80 border border-primary/20 shadow-2xl p-10">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-primary" size={28} />
                  <h2 className="text-2xl font-bold">Pace Over Time</h2>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={paceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="paceGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#8884d8" />
                    <YAxis stroke="#8884d8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="pace" stroke="url(#paceGradient)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} isAnimationActive={true} />
                    <ReferenceDot x={bestPacePoint.date} y={bestPacePoint.pace} r={10} fill="#22d3ee" stroke="#fff" label={{ value: 'PB', position: 'top', fill: '#22d3ee', fontWeight: 700 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card className="flex-[1.2] bg-gradient-to-br from-zinc-900/80 to-black/80 border border-orange-400/20 shadow-2xl p-10">
                <div className="flex items-center gap-3 mb-4">
                  <Map className="text-orange-400" size={28} />
                  <h2 className="text-2xl font-bold">Distance Over Time</h2>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={distanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="distanceGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e42" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#f59e42" />
                    <YAxis stroke="#f59e42" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="distance" stroke="url(#distanceGradient)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} isAnimationActive={true} />
                    <ReferenceDot x={longestRunPoint.date} y={longestRunPoint.distance} r={10} fill="#f59e42" stroke="#fff" label={{ value: 'Longest', position: 'top', fill: '#f59e42', fontWeight: 700 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
            {/* Probable Timing */}
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-10">
              <Card ref={shareRef} className="w-full md:w-1/2 bg-gradient-to-br from-zinc-900/80 to-black/80 border border-green-400/20 shadow-2xl p-8 text-center flex flex-col items-center relative">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="text-green-400 animate-pulse" size={28} />
                  <h2 className="text-xl font-bold">Current Probable Timing</h2>
                  <Zap className="text-yellow-400 animate-bounce" size={22} />
                </div>
                <div className="text-4xl font-extrabold text-green-400 mb-1 animate-pulse drop-shadow-lg">{probableTiming}</div>
                <div className="text-gray-400 mb-2">Estimated based on your recent runs</div>
                <button onClick={handleShare} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-bold hover:bg-primary/80 transition mt-2">
                  <Share2 size={18} /> Share Progress
                </button>
              </Card>
            </div>
            {/* Encouragement */}
            <div className="flex flex-col md:flex-row gap-8 items-stretch">
              <Card className="flex-1 bg-gradient-to-br from-zinc-900/80 to-black/80 border border-white/10 shadow-xl p-6 flex flex-col justify-center items-center hover:scale-105 transition-transform duration-300">
                <h3 className="text-lg font-semibold mb-2 text-primary">Keep up the great work!</h3>
                <p className="text-gray-400 text-center">Your consistent training is paying off. Review your progress regularly and keep pushing towards your goals! Every step counts, and you're building a stronger you.</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 