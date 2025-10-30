import { NextRequest, NextResponse } from "next/server";
import { toggleTeamMemberPublished } from "@/app/actions/team";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const member = await toggleTeamMemberPublished(id, body.is_published);
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error toggling team member:', error);
    return NextResponse.json({ error: "Failed to toggle team member" }, { status: 500 });
  }
}
