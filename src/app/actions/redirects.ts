"use server";

import { createClient } from "@/lib/supabase-server";

// =============================================
// TYPES
// =============================================

export type Redirect = {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  is_active: boolean;
  is_wildcard: boolean;
  hit_count: number;
  last_hit_at: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type Log404 = {
  id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  hit_count: number;
  first_seen_at: string;
  last_seen_at: string;
  is_resolved: boolean;
  redirect_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RedirectStats = {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
  total_hits: number;
};

export type Log404Stats = {
  total: number;
  unresolved: number;
  resolved: number;
  total_hits: number;
  avg_hits_per_log: number;
};

// =============================================
// RÉCUPÉRATION DES REDIRECTIONS
// =============================================

export async function getAllRedirects(showDeleted = false): Promise<Redirect[]> {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("redirects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!showDeleted) {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching redirects:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllRedirects:", error);
    return [];
  }
}

export async function getActiveRedirects(): Promise<Redirect[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("redirects")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("hit_count", { ascending: false });

    if (error) {
      console.error("Error fetching active redirects:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getActiveRedirects:", error);
    return [];
  }
}

export async function getRedirectById(id: string): Promise<Redirect | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("redirects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error fetching redirect:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getRedirectById:", error);
    return null;
  }
}

// =============================================
// STATISTIQUES REDIRECTIONS
// =============================================

export async function getRedirectStats(): Promise<RedirectStats> {
  const supabase = await createClient();

  try {
    const allRedirects = await getAllRedirects(true);

    const stats: RedirectStats = {
      total: allRedirects.length,
      active: allRedirects.filter((r) => r.is_active && !r.deleted_at).length,
      inactive: allRedirects.filter((r) => !r.is_active && !r.deleted_at).length,
      deleted: allRedirects.filter((r) => r.deleted_at !== null).length,
      total_hits: allRedirects.reduce((sum, r) => sum + r.hit_count, 0),
    };

    return stats;
  } catch (error) {
    console.error("Error in getRedirectStats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      deleted: 0,
      total_hits: 0,
    };
  }
}

// =============================================
// CRÉATION ET MODIFICATION REDIRECTIONS
// =============================================

export async function createRedirect(data: {
  from_path: string;
  to_path: string;
  status_code?: number;
  is_active?: boolean;
  notes?: string;
}) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: redirect, error } = await supabase
      .from("redirects")
      .insert({
        from_path: data.from_path,
        to_path: data.to_path,
        status_code: data.status_code || 301,
        is_active: data.is_active !== undefined ? data.is_active : true,
        notes: data.notes || null,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating redirect: ${error.message}`);
    }

    return { success: true, redirect };
  } catch (error) {
    console.error("Error in createRedirect:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateRedirect(
  id: string,
  data: {
    from_path?: string;
    to_path?: string;
    status_code?: number;
    is_active?: boolean;
    notes?: string;
  }
) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: redirect, error } = await supabase
      .from("redirects")
      .update({
        ...data,
        updated_by: user?.id || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating redirect: ${error.message}`);
    }

    return { success: true, redirect };
  } catch (error) {
    console.error("Error in updateRedirect:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function toggleRedirectActive(id: string, isActive: boolean) {
  return updateRedirect(id, { is_active: isActive });
}

// =============================================
// SUPPRESSION ET RESTAURATION REDIRECTIONS
// =============================================

export async function deleteRedirect(id: string, permanent = false) {
  const supabase = await createClient();

  try {
    if (permanent) {
      const { error } = await supabase.from("redirects").delete().eq("id", id);

      if (error) {
        throw new Error(`Error permanently deleting redirect: ${error.message}`);
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("redirects")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null,
        })
        .eq("id", id);

      if (error) {
        throw new Error(`Error soft deleting redirect: ${error.message}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteRedirect:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function restoreRedirect(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("redirects")
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Error restoring redirect: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in restoreRedirect:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function bulkDeleteRedirects(ids: string[], permanent = false) {
  const supabase = await createClient();

  try {
    if (permanent) {
      const { error } = await supabase.from("redirects").delete().in("id", ids);

      if (error) {
        throw new Error(`Error bulk deleting redirects: ${error.message}`);
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("redirects")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null,
        })
        .in("id", ids);

      if (error) {
        throw new Error(`Error bulk soft deleting redirects: ${error.message}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in bulkDeleteRedirects:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function bulkToggleRedirects(ids: string[], isActive: boolean) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("redirects")
      .update({ is_active: isActive })
      .in("id", ids);

    if (error) {
      throw new Error(`Error bulk toggling redirects: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in bulkToggleRedirects:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================
// LOGS 404
// =============================================

export async function getAll404Logs(): Promise<Log404[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("404_logs")
      .select("*")
      .order("last_seen_at", { ascending: false });

    if (error) {
      console.error("Error fetching 404 logs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAll404Logs:", error);
    return [];
  }
}

export async function getUnresolved404Logs(): Promise<Log404[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("404_logs")
      .select("*")
      .eq("is_resolved", false)
      .order("hit_count", { ascending: false });

    if (error) {
      console.error("Error fetching unresolved 404 logs:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUnresolved404Logs:", error);
    return [];
  }
}

export async function get404Stats(): Promise<Log404Stats> {
  const supabase = await createClient();

  try {
    const allLogs = await getAll404Logs();
    const totalHits = allLogs.reduce((sum, log) => sum + log.hit_count, 0);

    const stats: Log404Stats = {
      total: allLogs.length,
      unresolved: allLogs.filter((log) => !log.is_resolved).length,
      resolved: allLogs.filter((log) => log.is_resolved).length,
      total_hits: totalHits,
      avg_hits_per_log: allLogs.length > 0 ? totalHits / allLogs.length : 0,
    };

    return stats;
  } catch (error) {
    console.error("Error in get404Stats:", error);
    return {
      total: 0,
      unresolved: 0,
      resolved: 0,
      total_hits: 0,
      avg_hits_per_log: 0,
    };
  }
}

export async function resolve404(logId: string, redirectId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("404_logs")
      .update({
        is_resolved: true,
        redirect_id: redirectId,
      })
      .eq("id", logId);

    if (error) {
      throw new Error(`Error resolving 404: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in resolve404:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function delete404Log(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("404_logs").delete().eq("id", id);

    if (error) {
      throw new Error(`Error deleting 404 log: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in delete404Log:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
