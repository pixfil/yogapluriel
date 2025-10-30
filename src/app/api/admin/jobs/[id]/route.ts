import { NextRequest, NextResponse } from "next/server";
import { updateJobOpening, deleteJobOpening } from "@/app/actions/team";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const job = await updateJobOpening(id, body);
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error updating job opening:', error);
    return NextResponse.json({ error: "Failed to update job opening" }, { status: 500 });
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
    await deleteJobOpening(id, permanent);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job opening:', error);
    return NextResponse.json({ error: "Failed to delete job opening" }, { status: 500 });
  }
}
