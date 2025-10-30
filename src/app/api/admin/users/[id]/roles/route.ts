import { NextRequest, NextResponse } from "next/server";
import { updateUserRoles } from "@/app/actions/users";
import { UserRole } from "@/lib/permissions";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { roles } = body;

    if (!Array.isArray(roles)) {
      return NextResponse.json({ error: "Roles must be an array" }, { status: 400 });
    }

    const result = await updateUserRoles(id, roles as UserRole[]);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    console.error("Error in PUT /api/admin/users/[id]/roles:", error);
    return NextResponse.json({ error: "Failed to update user roles" }, { status: 500 });
  }
}
