import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

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

  // Get the current user
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Upsert tokens into strava_profiles
  await supabase.from('strava_profiles').upsert({
    user_id: user.id,
    strava_athlete_id: data.athlete?.id,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  // Redirect to dashboard/plan
  return NextResponse.redirect(new URL('/dashboard/plan', req.nextUrl));
}