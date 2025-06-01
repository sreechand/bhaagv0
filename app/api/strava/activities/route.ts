import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch user's Strava profile
  const { data: stravaProfile } = await supabase
    .from('strava_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!stravaProfile || !stravaProfile.access_token) {
    return NextResponse.json({ error: "Strava not connected" }, { status: 401 });
  }

  // Optionally: refresh token if expired (not implemented here)

  // Use user's access token
  const perPage = req.nextUrl.searchParams.get('per_page') || '1';
  const activitiesRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=1`,
    {
      headers: { Authorization: `Bearer ${stravaProfile.access_token}` },
    }
  );
  const activities = await activitiesRes.json();
  if (!activitiesRes.ok) {
    return NextResponse.json({ error: activities.message || "Failed to fetch activities" }, { status: 500 });
  }
  return NextResponse.json(activities);
}