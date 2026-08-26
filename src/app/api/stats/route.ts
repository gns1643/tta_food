import { NextResponse } from "next/server";
import { getStats } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get stats" },
      { status: 500 }
    );
  }
}