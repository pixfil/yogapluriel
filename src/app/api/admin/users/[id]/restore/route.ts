import { NextRequest, NextResponse } from "next/server";
import { restoreUser } from "@/app/actions/users";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await restoreUser(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/admin/users/[id]/restore:", error);
    return NextResponse.json({ error: "Failed to restore user" }, { status: 500 });
  }
}
