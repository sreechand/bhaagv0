"use client";
import React, { useEffect, useState } from "react";

const StravaActivitiesPage = () => {
  const [activities, setActivities] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/strava/activities?per_page=5");
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        setError("Failed to fetch activities");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Strava Activities (JSON)</h1>
      <pre style={{ background: "#222", color: "#fff", padding: 16, borderRadius: 8 }}>
        {JSON.stringify(activities, null, 2)}
      </pre>
    </div>
  );
};

export default StravaActivitiesPage; 