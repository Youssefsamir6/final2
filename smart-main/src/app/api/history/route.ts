import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://localhost:5000/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers: Record<string, string> = {};
  const auth = request.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const res = await fetch(`${API_BASE}/history`, { headers });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
