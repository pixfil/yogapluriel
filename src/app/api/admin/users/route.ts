import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, getUserStats } from "@/app/actions/users";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showDeleted = searchParams.get("showDeleted") === "true";
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      const userStats = await getUserStats();
      return NextResponse.json({ stats: userStats });
    }

    const users = await getAllUsers(showDeleted);
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
