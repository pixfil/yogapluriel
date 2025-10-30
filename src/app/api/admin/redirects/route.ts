import { NextRequest, NextResponse } from "next/server";
import { getAllRedirects, getRedirectStats, createRedirect } from "@/app/actions/redirects";
import { createRedirectSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showDeleted = searchParams.get("showDeleted") === "true";
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      const redirectStats = await getRedirectStats();
      return NextResponse.json({ stats: redirectStats });
    }

    const redirects = await getAllRedirects(showDeleted);
    return NextResponse.json({ redirects });
  } catch (error) {
    console.error("Error in GET /api/admin/redirects:", error);
    return NextResponse.json({ error: "Failed to fetch redirects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ✅ Validation Zod pour sécurité (anti-injection SQL/XSS)
    const validationResult = createRedirectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const result = await createRedirect(validationResult.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, redirect: result.redirect });
  } catch (error) {
    console.error("Error in POST /api/admin/redirects:", error);
    return NextResponse.json({ error: "Failed to create redirect" }, { status: 500 });
  }
}
