import { NextRequest, NextResponse } from "next/server";
import { getAll404Logs, get404Stats, delete404Log } from "@/app/actions/redirects";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      const log404Stats = await get404Stats();
      return NextResponse.json({ stats: log404Stats });
    }

    const logs = await getAll404Logs();
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error in GET /api/admin/404-logs:", error);
    return NextResponse.json({ error: "Failed to fetch 404 logs" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing log ID" }, { status: 400 });
    }

    const result = await delete404Log(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/404-logs:", error);
    return NextResponse.json({ error: "Failed to delete 404 log" }, { status: 500 });
  }
}
