"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPES
// =============================================

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  project_categories?: { project_id: string }[];
};

// =============================================
// CREATE
// =============================================

export async function createCategory(data: {
  name: string;
  description?: string;
}) {
  const supabase = await createClient();

  try {
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        name: data.name,
        slug,
        description: data.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      throw new Error(`Erreur lors de la création: ${error.message}`);
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/projects");

    return { success: true, data: category };
  } catch (error) {
    console.error("Error in createCategory:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================
// UPDATE
// =============================================

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
  }
) {
  const supabase = await createClient();

  try {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      // Regenerate slug if name changes
      updateData.slug = data.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    const { data: category, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/projects");

    return { success: true, data: category };
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================
// DELETE
// =============================================

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  try {
    // Check if category has associated projects
    const { data: projectCategories } = await supabase
      .from("project_categories")
      .select("project_id")
      .eq("category_id", id);

    if (projectCategories && projectCategories.length > 0) {
      return {
        success: false,
        error: `Impossible de supprimer: ${projectCategories.length} projet(s) utilisent cette catégorie`,
      };
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/projects");

    return { success: true };
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================
// READ
// =============================================

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        created_at,
        project_categories(project_id)
      `
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        created_at,
        project_categories(project_id)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching category:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    return null;
  }
}
