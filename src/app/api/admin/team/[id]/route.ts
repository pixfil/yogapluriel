import { NextRequest, NextResponse } from "next/server";
import { updateTeamMember, deleteTeamMember } from "@/app/actions/team";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const member = await updateTeamMember(id, body);
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const permanent = body?.permanent || false;
    await deleteTeamMember(id, permanent);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
