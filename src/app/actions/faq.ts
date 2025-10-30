"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPES
// =============================================

export type FAQCategory = {
  id: string;
  title: string;
  icon: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type FAQQuestion = {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type FAQCategoryWithQuestions = FAQCategory & {
  questions: FAQQuestion[];
  question_count?: number;
};

// =============================================
// CATEGORIES - READ
// =============================================

export async function getAllCategories(showDeleted = false): Promise<FAQCategory[]> {
  const supabase = await createClient();

  let query = supabase
    .from("faq_categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching FAQ categories:", error);
    throw new Error("Failed to fetch FAQ categories");
  }

  return data || [];
}

export async function getCategoriesWithQuestions(showDeleted = false): Promise<FAQCategoryWithQuestions[]> {
  const categories = await getAllCategories(showDeleted);
  const questions = await getAllQuestions(showDeleted);

  return categories.map((category) => ({
    ...category,
    questions: questions.filter((q) => q.category_id === category.id),
    question_count: questions.filter((q) => q.category_id === category.id).length,
  }));
}

export async function getCategoryStats() {
  const supabase = await createClient();

  const [categoriesResult, questionsResult, deletedCategoriesResult, deletedQuestionsResult] = await Promise.all([
    supabase.from("faq_categories").select("id", { count: "exact" }).is("deleted_at", null),
    supabase.from("faq_questions").select("id", { count: "exact" }).is("deleted_at", null),
    supabase.from("faq_categories").select("id", { count: "exact" }).not("deleted_at", "is", null),
    supabase.from("faq_questions").select("id", { count: "exact" }).not("deleted_at", "is", null),
  ]);

  return {
    totalCategories: categoriesResult.count || 0,
    totalQuestions: questionsResult.count || 0,
    deletedCategories: deletedCategoriesResult.count || 0,
    deletedQuestions: deletedQuestionsResult.count || 0,
  };
}

// =============================================
// CATEGORIES - WRITE
// =============================================

export async function createCategory(data: {
  title: string;
  icon: string;
  display_order?: number;
  published?: boolean;
}): Promise<{ success: boolean; error?: string; category?: FAQCategory }> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("faq_categories")
    .insert({
      title: data.title,
      icon: data.icon,
      display_order: data.display_order ?? 0,
      published: data.published ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true, category };
}

export async function updateCategory(
  id: string,
  data: Partial<FAQCategory>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("faq_categories")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}

export async function reorderCategories(
  categoryIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updates = categoryIds.map((id, index) => ({
    id,
    display_order: index + 1,
  }));

  for (const update of updates) {
    await supabase
      .from("faq_categories")
      .update({ display_order: update.display_order })
      .eq("id", update.id);
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}

// =============================================
// QUESTIONS - READ
// =============================================

export async function getAllQuestions(showDeleted = false): Promise<FAQQuestion[]> {
  const supabase = await createClient();

  let query = supabase
    .from("faq_questions")
    .select("*")
    .order("display_order", { ascending: true });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching FAQ questions:", error);
    throw new Error("Failed to fetch FAQ questions");
  }

  return data || [];
}

export async function getQuestionsByCategory(
  categoryId: string,
  showDeleted = false
): Promise<FAQQuestion[]> {
  const supabase = await createClient();

  let query = supabase
    .from("faq_questions")
    .select("*")
    .eq("category_id", categoryId)
    .order("display_order", { ascending: true });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions");
  }

  return data || [];
}

export async function searchQuestions(query: string): Promise<FAQQuestion[]> {
  if (!query.trim()) {
    return getAllQuestions();
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faq_questions")
    .select("*")
    .textSearch("question", query, {
      type: "websearch",
      config: "french",
    })
    .is("deleted_at", null);

  if (error) {
    console.error("Error searching questions:", error);
    return [];
  }

  return data || [];
}

// =============================================
// QUESTIONS - WRITE
// =============================================

export async function createQuestion(data: {
  category_id: string;
  question: string;
  answer: string;
  display_order?: number;
  published?: boolean;
}): Promise<{ success: boolean; error?: string; question?: FAQQuestion }> {
  const supabase = await createClient();

  const { data: question, error } = await supabase
    .from("faq_questions")
    .insert({
      category_id: data.category_id,
      question: data.question,
      answer: data.answer,
      display_order: data.display_order ?? 0,
      published: data.published ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating question:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true, question };
}

export async function updateQuestion(
  id: string,
  data: Partial<FAQQuestion>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("faq_questions")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating question:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}

export async function reorderQuestions(
  questionIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updates = questionIds.map((id, index) => ({
    id,
    display_order: index + 1,
  }));

  for (const update of updates) {
    await supabase
      .from("faq_questions")
      .update({ display_order: update.display_order })
      .eq("id", update.id);
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}

// =============================================
// SOFT DELETE (for both categories and questions)
// =============================================

export async function softDeleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("faq_categories")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Error soft deleting category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}

export async function restoreCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("faq_categories")
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error restoring category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}

export async function softDeleteQuestion(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("faq_questions")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Error soft deleting question:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}

export async function restoreQuestion(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("faq_questions")
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error restoring question:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}

// =============================================
// PERMANENT DELETE
// =============================================

export async function permanentDeleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Delete all questions in this category first
  await supabase.from("faq_questions").delete().eq("category_id", id);

  // Delete category
  const { error } = await supabase.from("faq_categories").delete().eq("id", id);

  if (error) {
    console.error("Error permanently deleting category:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}

export async function permanentDeleteQuestion(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("faq_questions").delete().eq("id", id);

  if (error) {
    console.error("Error permanently deleting question:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");

  return { success: true };
}
