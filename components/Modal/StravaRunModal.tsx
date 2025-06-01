import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Calendar, X, TrendingUp, Droplets } from 'lucide-react';
import ManualLogForm from './ManualLogForm';
import { supabase } from "@/lib/supabaseClient";
import type { Database } from '@/types/supabase';
import Confetti from 'react-confetti';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

type WorkoutLogInsert = Database['public']['Tables']['workout_logs']['Insert'];

interface StravaRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  onManualLog: () => void;
  onSkip: () => void;
  sessionId: string;
  currentWeekIdx: number;
  weeks: any[];
  sessions: any[];
  workoutLogs: any[];
}

interface RunData {
  distance: number;
  elapsedTime: number;
  rpe: number;
  avgHeartRate: number;
  maxHeartRate: number;
  notes: string;
}

const StravaRunModal: React.FC<StravaRunModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onManualLog,
  onSkip,
  sessionId,
  currentWeekIdx,
  weeks,
  sessions,
  workoutLogs
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showManualLog, setShowManualLog] = useState(false);
  const [showSkipOptions, setShowSkipOptions] = useState(false);
  const [showSkipReasons, setShowSkipReasons] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [showStravaImportModal, setShowStravaImportModal] = useState(false);
  const [showImportLogForm, setShowImportLogForm] = useState(false);
  const [importInitialValues, setImportInitialValues] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [skipReason, setSkipReason] = useState<string | null>(null);
  const [showUpdatePlanModal, setShowUpdatePlanModal] = useState(false);
  const [showRestartWarning, setShowRestartWarning] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingAdapt, setLoadingAdapt] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [inAppMessage, setInAppMessage] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
        setShowManualLog(false);
        setShowSkipOptions(false);
        setShowSkipReasons(false);
        setLoading(false);
        setError(null);
        setActivities([]);
        setShowStravaImportModal(false);
        setShowImportLogForm(false);
        setImportInitialValues(null);
        setSelectedActivity(null);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  // Helper: check if user is authorized to Strava (by trying to fetch activities)
  const checkStravaAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strava/activities?per_page=5");
      const data = await res.json();
      if (res.status === 401 || data.error) {
        // Not authorized
        return false;
      }
      if (Array.isArray(data)) {
        setActivities(data.slice(0, 5));
        return true;
      } else if (data && typeof data === 'object') {
        setActivities([data]);
        return true;
      }
      setError("Unexpected response from Strava API");
      return false;
    } catch (err: any) {
      setError("Failed to fetch Strava activities");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handler for Import button
  const handleImport = async () => {
    setLoading(true);
    setError(null);
    // Try to fetch activities to check auth
    const isAuthed = await checkStravaAuth();
    if (!isAuthed) {
      // Not authorized, redirect to Strava OAuth
      window.location.href = `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/api/strava/callback&approval_prompt=force&scope=read,activity:read_all`;
      return;
    }
    setShowStravaImportModal(true);
  };

  // Handler for clicking a Strava activity (open log form directly)
  const handleSelectActivity = (activity: any) => {
    setImportInitialValues({
      distance: activity.distance ? (activity.distance / 1000).toFixed(2) : '',
      elapsedTime: activity.elapsed_time || '',
      rpe: '', // Strava does not provide RPE
      avgHeartRate: activity.average_heartrate || '',
      maxHeartRate: activity.max_heartrate || '',
      notes: activity.name || activity.title || '',
    });
    setShowStravaImportModal(false);
    setShowImportLogForm(true);
  };

  // Save log to Supabase (used for both manual and imported logs)
  const saveWorkoutLog = async (logData: any) => {
    if (!sessionId) {
      setError('Session ID is missing. Cannot save workout log.');
      return;
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('User not authenticated.');
      return;
    }
    if (!sessionId || !user.id) {
      setError('Session ID or User ID missing. Cannot save workout log.');
      return;
    }
    // Only include fields you want to set, never include undefined or extra keys
    const log: WorkoutLogInsert = {
      avg_heart_rate: typeof logData?.avgHeartRate === 'number' ? Math.round(logData.avgHeartRate) : null,
      date: new Date().toISOString().slice(0, 10),
      distance: typeof logData?.distance === 'number' ? logData.distance : (logData?.distance ? Number(logData.distance) : null),
      elapsed_time: typeof logData?.elapsedTime === 'number' ? logData.elapsedTime : (logData?.elapsedTime ? Number(logData.elapsedTime) : null),
      max_heart_rate: typeof logData?.maxHeartRate === 'number' ? Math.round(logData.maxHeartRate) : null,
      notes: typeof logData?.notes === 'string' && logData.notes !== '' ? String(logData.notes) : null,
      rpe: typeof logData?.rpe === 'number' ? Math.round(logData.rpe) : null,
      session_id: String(sessionId),
      skipped: null,
      user_id: String(user.id),
    };
    const { error } = await supabase.from("workout_logs").insert([log] as any);
    if (error) {
      console.error('Supabase insert error:', error);
    }
    if (!error) {
      onClose();
      window.location.reload();
    } else {
      setError('Failed to save workout log.');
    }
  };

  // Handler for submitting the imported log
  const handleImportLogSubmit = async (data: any) => {
    setShowImportLogForm(false);
    await saveWorkoutLog(data);
  };

  const handleManualLog = () => {
    setShowManualLog(true);
  };

  const handleSkip = () => {
    setShowSkipOptions(true);
  };

  const handleLogSkip = () => {
    setShowSkipReasons(true);
  };

  // Save skipped run log to Supabase
  const saveSkippedRun = async (reason: string) => {
    if (!sessionId) {
      setError('Session ID is missing. Cannot save skipped run.');
      return;
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('User not authenticated.');
      return;
    }
    // Only include fields you want to set, never include undefined or extra keys
    const log: WorkoutLogInsert = {
      avg_heart_rate: null,
      date: new Date().toISOString().slice(0, 10),
      distance: null,
      elapsed_time: null,
      max_heart_rate: null,
      notes: typeof reason === 'string' && reason !== '' ? String(reason) : null,
      rpe: null,
      session_id: String(sessionId),
      skipped: true,
      user_id: String(user.id),
    };
    const { error } = await supabase.from("workout_logs").insert([log] as any);
    if (error) {
      setError('Failed to save skipped run.');
    } else {
      onClose();
      window.location.reload();
    }
  };

  const handleSkipReason = (reason: string) => {
    setSkipReason(reason);
    saveSkippedRun(reason);
  };

  const handleUpdatePlan = () => {
    console.log('Update plan requested');
    onClose();
  };

  // Handler for manual log
  const handleManualLogSubmit = async (data: RunData) => {
    setShowManualLog(false);
    await saveWorkoutLog(data);
  };

  // Helper: count skipped runs in a week
  function countSkippedRuns(weekIdx: number) {
    if (!weeks || !sessions || !workoutLogs) return 0;
    const week = weeks[weekIdx];
    if (!week) return 0;
    const weekSessions = sessions.filter((s) => s.week_id === week.id && s.type === 'run');
    return weekSessions.filter((s) => {
      const log = workoutLogs.find((log) => log.session_id === s.id);
      return log && log.skipped;
    }).length;
  }
  const currentSkipped = countSkippedRuns(currentWeekIdx);
  const prevSkipped = countSkippedRuns(currentWeekIdx - 1);
  const showMultiSkipButton = currentSkipped > 1 || prevSkipped > 1;

  // --- Update Plan Modal ---
  const renderUpdatePlanModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-primary/40 p-6 relative">
        <h3 className="text-xl font-bold text-white mb-4">Update Plan Options</h3>
        <button
          className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20 mb-3"
          onClick={() => setShowUpdatePlanModal(false)}
        >
          Continue Current Plan
        </button>
        <button
          className="w-full py-3 rounded-lg font-medium text-white bg-orange-700 hover:bg-orange-800 border border-white/10 transition-all duration-200 hover:border-white/20 mb-3"
          type="button"
          onClick={async () => {
            const planId = weeks?.[currentWeekIdx]?.plan_id || weeks?.[0]?.plan_id || null;
            const currentWeekNumber = weeks?.[currentWeekIdx]?.week_number || null;
            const fatigue = weeks?.[currentWeekIdx - 1]?.fatigue || null; // previous week fatigue
            const helpMeCatchUp = true;
            const currentWeekId = weeks?.[currentWeekIdx]?.id;
            const nextWeekId = weeks?.[currentWeekIdx + 1]?.id;
            const runs = sessions.filter(s =>
              (s.week_id === currentWeekId || s.week_id === nextWeekId) &&
              (!workoutLogs.find(log => log.session_id === s.id))
            );
            // Calculate previous week stats
            const prevWeekIdx = currentWeekIdx - 1;
            const prevWeekId = weeks?.[prevWeekIdx]?.id;
            const prevWeekSessions = sessions.filter(s => s.week_id === prevWeekId && s.type === 'run');
            const prevWeekLogs = workoutLogs.filter(log => prevWeekSessions.some(s => s.id === log.session_id));
            const missedRunsLastWeek = prevWeekLogs.filter(log => log.skipped).length;
            const lastWeekMileage = prevWeekLogs.reduce((sum, log) => sum + (log.distance || 0), 0);
            const skippedRunReasons = prevWeekLogs.filter(log => log.skipped && log.notes).map(log => log.notes);
            // Calculate current week stats
            const currWeekSessions = sessions.filter(s => s.week_id === currentWeekId && s.type === 'run');
            const currWeekLogs = workoutLogs.filter(log => currWeekSessions.some(s => s.id === log.session_id));
            const currentWeekMileage = currWeekLogs.reduce((sum, log) => sum + (log.distance || 0), 0);
            const missedRunsCurrentWeek = currWeekLogs.filter(log => log.skipped).length;
            // Optional: Time trial result
            const ttSession = currWeekSessions.find(s => s.focus === 'Time Trial');
            let timeTrialResult = null;
            if (ttSession) {
              const ttLog = workoutLogs.find(log => log.session_id === ttSession.id);
              if (ttLog) {
                timeTrialResult = { distance: ttLog.distance, elapsed_time: ttLog.elapsed_time };
              }
            }
            console.log({ userId, planId, currentWeekNumber, runs, missedRunsLastWeek, missedRunsCurrentWeek, lastWeekMileage, currentWeekMileage, timeTrialResult, skippedRunReasons });
            if (!userId || !planId || !currentWeekNumber || !runs.length) {
              alert('Missing required data for adaptation.');
              return;
            }
            setLoadingAdapt(true);
            setInAppMessage(null);
            try {
              const res = await fetch('/api/adapt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: userId,
                  plan_id: planId,
                  current_week_number: currentWeekNumber,
                  current_week_id: currentWeekId,
                  help_me_catch_up: helpMeCatchUp,
                  fatigue,
                  runs,
                  missedRunsLastWeek,
                  missedRunsCurrentWeek,
                  lastWeekMileage,
                  currentWeekMileage,
                  timeTrialResult,
                  skippedRunReasons
                })
              });
              const data = await res.json();
              if (res.ok) {
                setLoadingAdapt(false);
                setShowCelebration(true);
                setInAppMessage('Plan adapted successfully!');
                setTimeout(() => {
                  setShowCelebration(false);
                  setInAppMessage(null);
                  onClose();
                  window.location.reload();
                }, 2000);
              } else {
                setLoadingAdapt(false);
                setInAppMessage('Adaptation failed: ' + (data.error || 'Unknown error'));
              }
            } catch (err) {
              setLoadingAdapt(false);
              setInAppMessage('Adaptation failed: ' + err);
            }
          }}
        >
          I want to catch up - Update Plan
        </button>
        <button
          className="w-full py-3 rounded-lg font-medium text-white bg-red-700 hover:bg-red-800 border border-white/10 transition-all duration-200 hover:border-white/20"
          onClick={() => setShowRestartWarning(true)}
        >
          Restart Plan
        </button>
      </div>
    </div>
  );

  // --- Restart Warning Modal ---
  const renderRestartWarning = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-red-500/40 p-6 relative">
        <h3 className="text-xl font-bold text-red-500 mb-4">Are you sure?</h3>
        <p className="text-white mb-6">This will reset all your progress. This action cannot be undone.</p>
        <div className="flex gap-4 justify-end">
          <button
            className="px-5 py-2 bg-gray-700 text-gray-200 rounded-lg font-barlow hover:bg-gray-600 transition"
            onClick={() => setShowRestartWarning(false)}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 bg-red-700 text-white rounded-lg font-barlow font-bold shadow hover:bg-red-800 transition"
            onClick={() => { setShowRestartWarning(false); setShowUpdatePlanModal(false); /* TODO: Add reset logic here */ }}
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );

  // --- Patch skip options modal to show multi-skip button and remove default second button ---
  const renderSkipOptions = () => (
    <div className="px-6 pb-6 space-y-3">
      <div className="flex items-center mb-4">
        <button onClick={() => { setShowSkipOptions(false); }} className="mr-2 text-gray-400 hover:text-primary text-xl font-bold focus:outline-none">←</button>
        <h3 className="text-xl font-bold text-white">Run Skip Options menu</h3>
      </div>
      <button 
        onClick={handleLogSkip}
        className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
      >
        Log my skipped run
      </button>
      {showMultiSkipButton && (
        <button
          onClick={() => setShowUpdatePlanModal(true)}
          className="w-full py-3 rounded-lg font-medium text-white bg-orange-700 hover:bg-orange-800 border border-white/10 transition-all duration-200 hover:border-white/20"
        >
          Multiple Workouts Skipped - Go to Update Plan Menu
        </button>
      )}
    </div>
  );

  // --- Render skip reasons modal ---
  const renderSkipReasons = () => (
    <div className="px-6 pb-6 space-y-3">
      <div className="flex items-center mb-4">
        <button onClick={() => { setShowSkipReasons(false); setShowSkipOptions(true); }} className="mr-2 text-gray-400 hover:text-primary text-xl font-bold focus:outline-none">←</button>
        <h3 className="text-xl font-bold text-white">Why did you skip your run?</h3>
      </div>
      <button 
        onClick={() => handleSkipReason('I was tired')}
        className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
      >
        I was tired
      </button>
      <button 
        onClick={() => handleSkipReason('I did not get the time')}
        className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
      >
        I did not get the time
      </button>
      <button 
        onClick={() => handleSkipReason('I was injured')}
        className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
      >
        I was injured
      </button>
    </div>
  );

  // Set window size for confetti
  useEffect(() => {
    function updateSize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    if (showCelebration) {
      updateSize();
      window.addEventListener('resize', updateSize);
    }
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [showCelebration]);

  return (
    <>
      {/* Main Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        style={{ display: showStravaImportModal ? 'none' : undefined }}
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div 
          className={`relative max-w-md w-full overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-white/10 shadow-xl transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {showManualLog ? (
            <ManualLogForm 
              onClose={() => setShowManualLog(false)}
              onSubmit={handleManualLogSubmit}
            />
          ) : showSkipReasons ? (
            renderSkipReasons()
          ) : showSkipOptions ? (
            renderSkipOptions()
          ) : (
            <>
              {/* Modal Header */}
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-orange-600/20 to-red-500/30 opacity-70"></div>
                <div className="relative p-6">
                  <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 bg-black/30 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 mr-3">
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white"
                      >
                        <path d="M13.5 5.5C12.1193 5.5 11 4.38071 11 3V2.5H7C5.89543 2.5 5 3.39543 5 4.5V19.5C5 20.6046 5.89543 21.5 7 21.5H17C18.1046 21.5 19 20.6046 19 19.5V4.5C19 3.39543 18.1046 2.5 17 2.5H13V3C13 4.38071 11.8807 5.5 10.5 5.5H13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 10L10 12L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Log a Run</h3>
                    </div>
                  </div>
                </div>
              </div>
              {/* Modal Body */}
              <div className="px-6 pb-2">
                {error && <div className="text-red-500 mb-2">{error}</div>}
                {loading && <div className="text-gray-400">Loading...</div>}
                {/* You can show a preview or instructions here */}
              </div>
              {/* Modal Footer - Buttons */}
              <div className="px-6 pb-6 space-y-3">
                <button 
                  onClick={handleImport}
                  className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-700/20 transform transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[1px]"
                  disabled={loading}
                >
                  Import from Strava
                </button>
                <button 
                  onClick={handleManualLog}
                  className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
                >
                  Manually log your run
                </button>
                <button 
                  onClick={handleSkip}
                  className="w-full py-2 rounded-lg font-medium text-gray-400 hover:text-white bg-transparent hover:bg-zinc-800/50 transition-all duration-200"
                >
                  I skipped my run
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Strava Activities Import Modal */}
      {showStravaImportModal && !showImportLogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-primary/40 p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Import Strava Activity</h3>
              <button onClick={() => setShowStravaImportModal(false)} className="rounded-full p-1 bg-black/30 text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
              {loading && <div className="text-gray-400">Loading activities...</div>}
              {error && <div className="text-red-500 mb-2">{error}</div>}
              {activities.map((act, idx) => {
                const distanceKm = act.distance ? (act.distance / 1000).toFixed(2) : '-';
                const elapsed = act.elapsed_time ? `${Math.floor(act.elapsed_time / 60)}:${String(act.elapsed_time % 60).padStart(2, '0')}` : '-';
                const date = act.start_date ? new Date(act.start_date).toLocaleDateString() : '-';
                return (
                  <div
                    key={act.id || idx}
                    className={`border rounded-lg p-4 bg-black/30 flex flex-col gap-2 cursor-pointer transition-all border-white/10 hover:border-primary/60 hover:bg-zinc-800/60`}
                    onClick={() => handleSelectActivity(act)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-base">{act.name || act.title || 'Untitled Activity'}</div>
                      <div className="text-xs text-gray-400">{date}</div>
                    </div>
                    <div className="flex flex-row gap-6 text-sm text-gray-300 mt-1">
                      <div><span className="font-semibold">{distanceKm}</span> km</div>
                      <div><span className="font-semibold">{elapsed}</span> min</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowStravaImportModal(false)} className="px-5 py-2 bg-gray-700 text-gray-200 rounded-lg font-barlow hover:bg-gray-600 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* ManualLogForm for imported Strava activity */}
      {showImportLogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-primary/40 p-0 relative">
            <ManualLogForm
              onClose={() => setShowImportLogForm(false)}
              onSubmit={handleImportLogSubmit}
              initialValues={importInitialValues}
            />
          </div>
        </div>
      )}
      {showUpdatePlanModal && renderUpdatePlanModal()}
      {showRestartWarning && renderRestartWarning()}
      {/* Loading overlay */}
      {loadingAdapt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          <span className="ml-4 text-white text-xl font-bold">Adapting your plan...</span>
        </div>
      )}
      {/* Celebration confetti */}
      {showCelebration && windowSize.width > 0 && windowSize.height > 0 &&
        createPortal(
          <Confetti width={windowSize.width} height={windowSize.height} />, document.body
        )
      }
      {/* In-app message */}
      {inAppMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[101] bg-zinc-900 text-white px-6 py-3 rounded-xl shadow-lg border border-orange-500 font-bold text-lg">
          {inAppMessage}
        </div>
      )}
    </>
  );
};

export default StravaRunModal;