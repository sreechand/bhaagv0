import { NextResponse } from "next/server";

const STRAVA_CLIENT_ID = "160986";
const STRAVA_CLIENT_SECRET = "ec06b59ac354e1c8ec5818a22b35472a94aee895";
const STRAVA_REFRESH_TOKEN = "6735c6bddb28b535e339e3e761f29c47e0b0c213";

async function getStravaAccessToken() {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: STRAVA_REFRESH_TOKEN,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Failed to get access token:", data);
    throw new Error(data.message || "Failed to get access token");
  }
  return data.access_token;
}

export async function GET() {
  try {
    const accessToken = await getStravaAccessToken();
    const activitiesRes = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=1&page=1",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const activities = await activitiesRes.json();
    if (!activitiesRes.ok) {
      console.error("Failed to fetch activities:", activities);
      throw new Error(activities.message || "Failed to fetch activities");
    }
    return NextResponse.json(activities[0] || {});
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}