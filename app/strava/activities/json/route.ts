import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('http://localhost:3000/api/strava/activities?per_page=5');
  const data = await res.json();
  return NextResponse.json(data);
} 