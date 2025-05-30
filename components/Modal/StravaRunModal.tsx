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

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
        setShowManualLog(false);
        setShowSkipOptions(false);
        setShowSkipReasons(false);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

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

  // Mock Strava run data
  const runData = {
    title: "Morning Run",
    date: "Today, 7:15 AM",
    distance: "5.2",
    duration: "28:45",
    pace: "5'32\"",
    elevation: "86",
    location: "Central Park, New York",
    calories: "423",
    heartRate: "154",
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
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
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
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5 mb-6">
                <h4 className="text-lg font-semibold text-white mb-2">{runData.title}</h4>
                
                <div className="flex items-center mb-3 text-sm text-gray-400">
                  <Calendar size={14} className="mr-1" />
                  <span>{runData.date}</span>
                  <span className="mx-2">•</span>
                  <MapPin size={14} className="mr-1" />
                  <span>{runData.location}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">Distance</p>
                    <p className="text-lg font-semibold text-white">{runData.distance} <span className="text-sm font-normal text-gray-400">km</span></p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">Duration</p>
                    <p className="text-lg font-semibold text-white">{runData.duration}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">Pace</p>
                    <div className="flex items-baseline">
                      <Clock size={14} className="mr-1 text-orange-400" />
                      <p className="text-sm font-medium text-white">{runData.pace} <span className="text-xs font-normal text-gray-400">/km</span></p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">Elev</p>
                    <div className="flex items-baseline">
                      <TrendingUp size={14} className="mr-1 text-emerald-400" />
                      <p className="text-sm font-medium text-white">{runData.elevation} <span className="text-xs font-normal text-gray-400">m</span></p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">Calories</p>
                    <div className="flex items-baseline">
                      <Droplets size={14} className="mr-1 text-cyan-400" />
                      <p className="text-sm font-medium text-white">{runData.calories}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer - Buttons */}
            <div className="px-6 pb-6 space-y-3">
              <button 
                onClick={onImport}
                className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-700/20 transform transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[1px]"
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
  );
};

export default StravaRunModal;