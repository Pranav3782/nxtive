import { NextResponse } from "next/server";
import { getDashboardStats } from "@/features/admin-dashboard/server/actions";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}
