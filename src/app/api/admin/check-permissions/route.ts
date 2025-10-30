import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { hasPermission, Resource, Action } from "@/lib/permissions";
import { getUserById } from "@/app/actions/users";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Récupérer l'utilisateur connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ hasPermission: false, error: "Not authenticated" }, { status: 401 });
    }

    // Récupérer le profil utilisateur avec ses rôles
    const userProfile = await getUserById(user.id);

    if (!userProfile) {
      return NextResponse.json({ hasPermission: false, error: "User profile not found" }, { status: 404 });
    }

    // Récupérer les paramètres de la requête
    const body = await request.json();
    const { resource, action } = body;

    if (!resource || !action) {
      return NextResponse.json({ error: "Missing resource or action" }, { status: 400 });
    }

    // Vérifier la permission
    const allowed = hasPermission(userProfile.roles, resource as Resource, action as Action);

    return NextResponse.json({
      hasPermission: allowed,
      roles: userProfile.roles,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/check-permissions:", error);
    return NextResponse.json({ hasPermission: false, error: "Failed to check permissions" }, { status: 500 });
  }
}
