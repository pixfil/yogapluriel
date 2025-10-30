import { NextRequest, NextResponse } from "next/server";
import { bulkDeleteUsers, bulkRestoreUsers } from "@/app/actions/users";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid ids array" }, { status: 400 });
    }

    let result;

    if (action === "restore") {
      result = await bulkRestoreUsers(ids);
    } else if (action === "permanent") {
      result = await bulkDeleteUsers(ids, true);
    } else {
      result = await bulkDeleteUsers(ids, false);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/admin/users/bulk-delete:", error);
    return NextResponse.json({ error: "Failed to bulk delete users" }, { status: 500 });
  }
}
