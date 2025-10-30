"use server";

import { getAdminClient } from "@/lib/supabase-server";

/**
 * Vérifie si un utilisateur a accès à l'interface admin
 * Utilise le service role pour bypasser les RLS
 */
export async function checkAdminAccess(userId: string) {
  try {
    const supabase = getAdminClient();

    // Récupérer le profil utilisateur avec le service role (bypass RLS)
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("roles, status, deleted_at")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return {
        hasAccess: false,
        error: "Erreur lors de la vérification du profil",
      };
    }

    // Vérifier que l'utilisateur n'est pas supprimé
    if (profile.deleted_at) {
      return {
        hasAccess: false,
        error: "Ce compte a été supprimé",
      };
    }

    // Vérifier que le compte est actif
    if (profile.status !== "active") {
      return {
        hasAccess: false,
        error: "Ce compte n'est pas actif",
      };
    }

    // Vérifier les rôles
    const allowedRoles = ["super_admin", "admin", "auteur"];

    // Cast roles de Json à string[] (le type BDD est Json mais contient un tableau)
    const roles = Array.isArray(profile.roles) ? profile.roles as string[] : [];
    const hasAdminRole = roles.some((role: string) =>
      allowedRoles.includes(role)
    );

    if (!hasAdminRole) {
      return {
        hasAccess: false,
        error: "Votre compte n'a pas les permissions nécessaires",
      };
    }

    // Mettre à jour le last_login
    await supabase
      .from("user_profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", userId);

    return {
      hasAccess: true,
      roles: roles,
      status: profile.status as string,
    };
  } catch (error) {
    console.error("Error in checkAdminAccess:", error);
    return {
      hasAccess: false,
      error: "Une erreur est survenue lors de la vérification",
    };
  }
}

// Note: Rate-limiting admin login géré par Supabase Auth (pas besoin de custom implementation)