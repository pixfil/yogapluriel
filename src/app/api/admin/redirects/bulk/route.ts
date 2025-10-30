import { NextRequest, NextResponse } from "next/server";
import { bulkDeleteRedirects, bulkToggleRedirects } from "@/app/actions/redirects";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action, value } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid ids array" }, { status: 400 });
    }

    let result;

    if (action === "delete") {
      result = await bulkDeleteRedirects(ids, false);
    } else if (action === "permanent-delete") {
      result = await bulkDeleteRedirects(ids, true);
    } else if (action === "toggle") {
      result = await bulkToggleRedirects(ids, value);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/admin/redirects/bulk:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}
