import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://localhost:5000/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers: Record<string, string> = {};
  const auth = request.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const res = await fetch(`${API_BASE}/people`, { headers });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const auth = request.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const body = await request.json();
  const res = await fetch(`${API_BASE}/people`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
