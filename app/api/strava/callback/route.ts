import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  // DEBUG: Log the values being sent
  console.log("client_id:", process.env.STRAVA_CLIENT_ID);
  console.log("client_secret:", process.env.STRAVA_CLIENT_SECRET);
  console.log("code:", code);

  // Exchange code for access token
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();
  console.log("Strava response:", data);

  // If Strava returns an error, forward it
  if (data.errors || data.error) {
    return NextResponse.json(data, { status: 400 });
  }

  // Redirect to dashboard/plan
  return NextResponse.redirect(new URL('/dashboard/plan', req.nextUrl));
}