import { NextResponse } from "next/server";
import { makeCameras } from "@/lib/mock";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = makeCameras();
  return NextResponse.json({ items }, { status: 200 });
}

