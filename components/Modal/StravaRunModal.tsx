import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Calendar, X, TrendingUp, Droplets } from 'lucide-react';
import ManualLogForm from './ManualLogForm';

interface StravaRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  onManualLog: () => void;
  onSkip: () => void;
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
  onSkip
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

  // Handler for submitting the imported log
  const handleImportLogSubmit = (data: any) => {
    setShowImportLogForm(false);
    onClose();
    // You can add your save logic here
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

  const handleSkipReason = (reason: string) => {
    console.log('Skip reason:', reason);
    onClose();
  };

  const handleUpdatePlan = () => {
    console.log('Update plan requested');
    onClose();
  };

  const handleManualLogSubmit = (data: RunData) => {
    console.log('Manual log data:', data);
    onClose();
  };

  const renderSkipReasons = () => (
    <div className="px-6 pb-6 space-y-3">
      <h3 className="text-xl font-bold text-white mb-4">Why did you skip your run?</h3>
      <button 
        onClick={() => handleSkipReason('tired')}
        className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
      >
        I was tired
      </button>
      <button 
        onClick={() => handleSkipReason('no-time')}
        className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
      >
        I did not get the time
      </button>
      <button 
        onClick={() => handleSkipReason('injured')}
        className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
      >
        I was injured
      </button>
    </div>
  );

  const renderSkipOptions = () => (
    <div className="px-6 pb-6 space-y-3">
      <h3 className="text-xl font-bold text-white mb-4">What would you like to do?</h3>
      <button 
        onClick={handleLogSkip}
        className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
      >
        Log my skipped run
      </button>
      <button 
        onClick={handleUpdatePlan}
        className="w-full py-3 rounded-lg font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-all duration-200 hover:border-white/20"
      >
        I'd like to catch up, help me create an updated plan
      </button>
    </div>
  );

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
                      <h3 className="text-xl font-bold text-white">Strava Activity</h3>
                      <p className="text-sm text-gray-400">Would you like to import this run?</p>
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
                  Import
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
    </>
  );
};

export default StravaRunModal;