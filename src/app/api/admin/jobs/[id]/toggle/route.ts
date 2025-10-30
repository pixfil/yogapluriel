import { NextRequest, NextResponse } from "next/server";
import { toggleJobOpeningActive } from "@/app/actions/team";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const job = await toggleJobOpeningActive(id, body.is_active);
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error toggling job opening:', error);
    return NextResponse.json({ error: "Failed to toggle job opening" }, { status: 500 });
  }
}
