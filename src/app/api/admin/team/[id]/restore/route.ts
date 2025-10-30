import { NextRequest, NextResponse } from "next/server";
import { restoreTeamMember } from "@/app/actions/team";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await restoreTeamMember(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error restoring team member:', error);
    return NextResponse.json({ error: "Failed to restore team member" }, { status: 500 });
  }
}
