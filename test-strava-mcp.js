import { NextResponse } from "next/server";

// const STRAVA_CLIENT_ID = "160986";
// const STRAVA_CLIENT_SECRET = "ec06b59ac354e1c8ec5818a22b35472a94aee895";
// const STRAVA_REFRESH_TOKEN = "d78f2472bcb71788ea5ac36784550a618c30b1f1";

// Manish credentials
const STRAVA_CLIENT_ID = "160989";
const STRAVA_CLIENT_SECRET="cc65256fa2bbdf73e92b97232fba1276846ca85b";
const STRAVA_ACCESS_TOKEN="0930f92b4367847f2be353177ad8904ff36609c1";
const STRAVA_REFRESH_TOKEN="10b64f968cd54fa80895e8f2c6ff8062204de15b";

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
  if (!response.ok) throw new Error("Failed to get access token");
  const data = await response.json();
  return data.access_token;
}

export async function GET() {
  try {
    const accessToken = await getStravaAccessToken();
    const activitiesRes = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=5&page=1",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!activitiesRes.ok) throw new Error("Failed to fetch activities");
    const activities = await activitiesRes.json();
    return NextResponse.json(activities);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}