import { NextRequest, NextResponse } from "next/server";
import { getRedirectById, updateRedirect, deleteRedirect } from "@/app/actions/redirects";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redirect = await getRedirectById(id);

    if (!redirect) {
      return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
    }

    return NextResponse.json({ redirect });
  } catch (error) {
    console.error("Error in GET /api/admin/redirects/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch redirect" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateRedirect(id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, redirect: result.redirect });
  } catch (error) {
    console.error("Error in PUT /api/admin/redirects/[id]:", error);
    return NextResponse.json({ error: "Failed to update redirect" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    const result = await deleteRedirect(id, permanent);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/redirects/[id]:", error);
    return NextResponse.json({ error: "Failed to delete redirect" }, { status: 500 });
  }
}
