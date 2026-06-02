import { NextResponse } from "next/server";
import { makeUsers } from "@/lib/mock";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = makeUsers().sort((a, b) => (a.lastActiveAt < b.lastActiveAt ? 1 : -1));
  return NextResponse.json({ items }, { status: 200 });
}

