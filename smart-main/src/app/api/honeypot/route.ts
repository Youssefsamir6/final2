import { NextResponse } from "next/server";
import { makeHoneypotAlerts } from "@/lib/mock-honeypot";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = makeHoneypotAlerts();
  return NextResponse.json({ items }, { status: 200 });
}
