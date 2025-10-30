import { NextRequest, NextResponse } from "next/server";
import { restoreJobOpening } from "@/app/actions/team";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await restoreJobOpening(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error restoring job opening:', error);
    return NextResponse.json({ error: "Failed to restore job opening" }, { status: 500 });
  }
}
