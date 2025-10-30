"use server";

import { createClient, getAdminClient } from "@/lib/supabase-server";
import { UserRole, sanitizeRoles } from "@/lib/permissions";

// =============================================
// TYPES
// =============================================

export type UserProfile = {
  id: string;
  email?: string;
  name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
  last_login: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type UserStats = {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  deleted: number;
  by_role: {
    super_admin: number;
    admin: number;
    auteur: number;
    visiteur: number;
  };
};

// =============================================
// RÉCUPÉRATION DES UTILISATEURS
// =============================================

export async function getAllUsers(showDeleted = false): Promise<UserProfile[]> {
  // Utiliser le client admin pour bypasser les RLS
  const supabase = getAdminClient();

  try {
    // Récupérer les profils utilisateurs (sans RLS grâce au service role)
    let query = supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!showDeleted) {
      query = query.is("deleted_at", null);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      return [];
    }

    // Récupérer les emails depuis auth.users (avec admin API)
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      // Continue sans les emails si l'erreur vient de l'admin API
    }

    // Créer une map des emails par user ID
    const emailMap = new Map<string, string>();
    authUsers?.forEach(user => {
      if (user.email) {
        emailMap.set(user.id, user.email);
      }
    });

    // Combiner les données
    return profiles.map((profile: any) => ({
      ...profile,
      email: emailMap.get(profile.id) || null,
      roles: sanitizeRoles(profile.roles || ["visiteur"]),
    }));
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return [];
  }
}

export async function getActiveUsers(): Promise<UserProfile[]> {
  const allUsers = await getAllUsers(false);
  return allUsers.filter(user => user.status === "active");
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  // Utiliser le client admin pour bypasser les RLS
  const supabase = getAdminClient();

  try {
    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return null;
    }

    // Récupérer l'email depuis auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(id);

    return {
      ...profile,
      email: authUser?.email || null,
      roles: sanitizeRoles(profile.roles || ["visiteur"]),
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const allUsers = await getAllUsers(true); // Include deleted to search all
  return allUsers.find(user => user.email === email) || null;
}

// =============================================
// STATISTIQUES
// =============================================

export async function getUserStats(): Promise<UserStats> {
  const supabase = await createClient();

  try {
    // Récupérer tous les utilisateurs pour calculer les stats
    const allUsers = await getAllUsers(true);

    const stats: UserStats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.status === "active" && !u.deleted_at).length,
      inactive: allUsers.filter(u => u.status === "inactive" && !u.deleted_at).length,
      suspended: allUsers.filter(u => u.status === "suspended" && !u.deleted_at).length,
      deleted: allUsers.filter(u => u.deleted_at !== null).length,
      by_role: {
        super_admin: allUsers.filter(u => u.roles.includes("super_admin") && !u.deleted_at).length,
        admin: allUsers.filter(u => u.roles.includes("admin") && !u.deleted_at).length,
        auteur: allUsers.filter(u => u.roles.includes("auteur") && !u.deleted_at).length,
        visiteur: allUsers.filter(u => u.roles.includes("visiteur") && !u.deleted_at).length,
      },
    };

    return stats;
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      suspended: 0,
      deleted: 0,
      by_role: {
        super_admin: 0,
        admin: 0,
        auteur: 0,
        visiteur: 0,
      },
    };
  }
}

// =============================================
// CRÉATION ET MODIFICATION
// =============================================

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    avatar_url?: string;
    roles?: UserRole[];
    status?: "active" | "inactive" | "suspended";
  }
) {
  const supabase = await createClient();

  try {
    // Sanitize roles si fournis
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.roles !== undefined) {
      updateData.roles = sanitizeRoles(data.roles);
      // S'assurer qu'il y a au moins un rôle
      if (updateData.roles.length === 0) {
        updateData.roles = ["visiteur"];
      }
    }

    const { data: updatedUser, error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateUserRoles(userId: string, roles: UserRole[]) {
  // Use admin client to bypass RLS (avoid infinite recursion in policies)
  const supabase = getAdminClient();

  try {
    // Sanitize et valider les rôles
    const sanitizedRoles = sanitizeRoles(roles);

    if (sanitizedRoles.length === 0) {
      throw new Error("At least one role is required");
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .update({ roles: sanitizedRoles })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user roles: ${error.message}`);
    }

    return {
      success: true,
      user: data,
    };
  } catch (error) {
    console.error("Error in updateUserRoles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "inactive" | "suspended"
) {
  return updateUserProfile(userId, { status });
}

// =============================================
// SUPPRESSION ET RESTAURATION
// =============================================

export async function deleteUser(userId: string, permanent = false) {
  const supabase = await createClient();

  try {
    if (permanent) {
      // Suppression définitive (hard delete)
      const { error } = await supabase.from("user_profiles").delete().eq("id", userId);

      if (error) {
        throw new Error(`Error permanently deleting user: ${error.message}`);
      }
    } else {
      // Soft delete
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("user_profiles")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null,
        })
        .eq("id", userId);

      if (error) {
        throw new Error(`Error soft deleting user: ${error.message}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function restoreUser(userId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Error restoring user: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in restoreUser:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function bulkDeleteUsers(userIds: string[], permanent = false) {
  const supabase = await createClient();

  try {
    if (permanent) {
      const { error } = await supabase.from("user_profiles").delete().in("id", userIds);

      if (error) {
        throw new Error(`Error bulk deleting users: ${error.message}`);
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("user_profiles")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null,
        })
        .in("id", userIds);

      if (error) {
        throw new Error(`Error bulk soft deleting users: ${error.message}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in bulkDeleteUsers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function bulkRestoreUsers(userIds: string[]) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .in("id", userIds);

    if (error) {
      throw new Error(`Error bulk restoring users: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in bulkRestoreUsers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================
// LOGS D'ACTIVITÉ
// =============================================

export async function logUserActivity(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("user_activity_logs").insert({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId || null,
      details: details || null,
    });

    if (error) {
      console.error("Error logging user activity:", error);
    }
  } catch (error) {
    console.error("Error in logUserActivity:", error);
  }
}

export async function getUserActivityLogs(userId: string, limit = 50) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("user_activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching user activity logs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserActivityLogs:", error);
    return [];
  }
}

// =============================================
// UPDATE LAST LOGIN
// =============================================

export async function updateLastLogin(userId: string) {
  const supabase = await createClient();

  try {
    await supabase
      .from("user_profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", userId);
  } catch (error) {
    console.error("Error updating last login:", error);
  }
}
