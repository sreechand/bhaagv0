import React, { useState } from 'react';
import { supabase } from "@/lib/supabaseClient";

interface StrengthLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onLogged: () => void;
}

const StrengthLogModal: React.FC<StrengthLogModalProps> = ({ isOpen, onClose, sessionId, onLogged }) => {
  const [elapsedTime, setElapsedTime] = useState("");
  const [avgHeartRate, setAvgHeartRate] = useState("");
  const [maxHeartRate, setMaxHeartRate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipping, setSkipping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('User not authenticated.');
      setSaving(false);
      return;
    }
    if (!sessionId) {
      setError('Session ID missing.');
      setSaving(false);
      return;
    }
    const log = {
      elapsed_time: elapsedTime !== "" ? Number(elapsedTime) : undefined,
      avg_heart_rate: avgHeartRate !== "" ? Math.round(Number(avgHeartRate)) : undefined,
      max_heart_rate: maxHeartRate !== "" ? Math.round(Number(maxHeartRate)) : undefined,
      notes: notes ? String(notes) : undefined,
      session_id: String(sessionId),
      user_id: String(user.id),
      date: new Date().toISOString().slice(0, 10),
    };
    const { error } = await supabase.from("workout_logs").insert([log as any]);
    setSaving(false);
    if (!error) {
      onClose();
      onLogged();
    } else {
      setError('Failed to save strength workout log.');
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    setError(null);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('User not authenticated.');
      setSkipping(false);
      return;
    }
    if (!sessionId) {
      setError('Session ID missing.');
      setSkipping(false);
      return;
    }
    const skipLog = {
      date: new Date().toISOString().slice(0, 10),
      session_id: String(sessionId),
      user_id: String(user.id),
      notes: 'SKIPPED',
      skipped: true,
    };
    const { error } = await supabase.from("workout_logs").insert([skipLog]);
    setSkipping(false);
    if (!error) {
      onClose();
      onLogged();
    } else {
      setError('Failed to save skipped workout log.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="relative bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-primary/40">
        <button type="button" onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl font-bold focus:outline-none">
          ×
        </button>
        <h2 className="text-2xl font-exo font-bold mb-6 text-primary text-center">Log Strength Activity</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-barlow text-gray-300 mb-1">Elapsed Time (seconds)</label>
          <input type="number" value={elapsedTime} onChange={e => setElapsedTime(e.target.value)} className="w-full bg-black/40 border border-primary/30 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 transition" />
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
          <button type="button" onClick={handleSkip} disabled={saving || skipping} className="px-5 py-2 bg-red-700 text-white rounded-lg font-barlow font-bold shadow hover:bg-red-800 transition disabled:opacity-60">
            {skipping ? "Skipping..." : "Skip Workout"}
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-700 text-gray-200 rounded-lg font-barlow hover:bg-gray-600 transition">Cancel</button>
          <button type="submit" disabled={saving || skipping} className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-black rounded-lg font-barlow font-bold shadow hover:from-primary/80 hover:to-secondary/80 transition disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StrengthLogModal; 