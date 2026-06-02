import { NextResponse } from "next/server";
import { makeStats } from "@/lib/mock";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(makeStats(), { status: 200 });
}

