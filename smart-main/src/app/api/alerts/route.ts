import { NextResponse } from "next/server";
import { makeAlerts } from "@/lib/mock";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = makeAlerts()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 14);

  return NextResponse.json({ items }, { status: 200 });
}

