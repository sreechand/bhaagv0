import React from 'react';
import { X } from 'lucide-react';

interface ManualLogFormProps {
  onClose: () => void;
  onSubmit: (data: RunData) => void;
}

interface RunData {
  distance: number;
  elapsedTime: number;
  rpe: number;
  avgHeartRate: number;
  maxHeartRate: number;
  notes: string;
}

const ManualLogForm: React.FC<ManualLogFormProps> = ({ onClose, onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data: RunData = {
      distance: Number(formData.get('distance')),
      elapsedTime: Number(formData.get('elapsedTime')),
      rpe: Number(formData.get('rpe')),
      avgHeartRate: Number(formData.get('avgHeartRate')),
      maxHeartRate: Number(formData.get('maxHeartRate')),
      notes: formData.get('notes') as string
    };
    
    onSubmit(data);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Log Your Run</h3>
        <button 
          onClick={onClose}
          className="rounded-full p-1 bg-black/30 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="distance" className="block text-sm font-medium text-gray-300 mb-1">
            Distance (km)
          </label>
          <input
            type="number"
            id="distance"
            name="distance"
            step="0.01"
            required
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="5.0"
          />
        </div>

        <div>
          <label htmlFor="elapsedTime" className="block text-sm font-medium text-gray-300 mb-1">
            Elapsed Time (seconds)
          </label>
          <input
            type="number"
            id="elapsedTime"
            name="elapsedTime"
            required
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="1800"
          />
        </div>

        <div>
          <label htmlFor="rpe" className="block text-sm font-medium text-gray-300 mb-1">
            RPE (1-10)
          </label>
          <input
            type="number"
            id="rpe"
            name="rpe"
            min="1"
            max="10"
            required
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="7"
          />
        </div>

        <div>
          <label htmlFor="avgHeartRate" className="block text-sm font-medium text-gray-300 mb-1">
            Average Heart Rate (bpm)
          </label>
          <input
            type="number"
            id="avgHeartRate"
            name="avgHeartRate"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="150"
          />
        </div>

        <div>
          <label htmlFor="maxHeartRate" className="block text-sm font-medium text-gray-300 mb-1">
            Max Heart Rate (bpm)
          </label>
          <input
            type="number"
            id="maxHeartRate"
            name="maxHeartRate"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="175"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="How did your run feel?"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-700/20 transform transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[1px]"
        >
          Save Run
        </button>
      </form>
    </div>
  );
};

export default ManualLogForm;