import { ratelimitGenerations } from "@/lib/ratelimit";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { remaining } = await ratelimitGenerations.getRemaining(ip);

  return NextResponse.json({ remaining });
}
