import { NextRequest, NextResponse } from "next/server";
import { bulkDeleteJobOpenings } from "@/app/actions/team";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, permanent } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid ids array" }, { status: 400 });
    }

    await bulkDeleteJobOpenings(ids, permanent || false);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error bulk deleting job openings:', error);
    return NextResponse.json({ error: "Failed to bulk delete job openings" }, { status: 500 });
  }
}
