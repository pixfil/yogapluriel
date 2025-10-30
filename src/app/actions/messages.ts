"use server";

import { createClient, getAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { resend, FROM_EMAIL, FROM_NAME, isResendConfigured } from "@/lib/resend";

// Imports des types depuis database-helpers.ts et job-applications.ts
import type {
  Contact,
  QuoteRequest,
  DetailedQuote,
  CalculatorSubmission,
  EmailLog,
} from "@/lib/database-helpers";
import type { JobApplication } from "./job-applications";

// =============================================
// TYPES SPÉCIFIQUES À CE FICHIER
// =============================================

export type UnifiedMessage = {
  id: string;
  type: 'contact' | 'calculator' | 'quote' | 'detailed-quote' | 'job-application';
  name: string;
  email: string;
  phone: string | null;
  subject?: string;
  message?: string;
  project_type?: string;
  service_type?: string;
  source?: string; // Ajouté pour distinguer les types de formulaires
  job_title?: string; // Pour les candidatures
  cv_url?: string; // Pour les candidatures
  cover_letter_url?: string; // Pour les candidatures
  status: string | null;
  priority?: string | null;
  urgency?: string | null;
  created_at: string | null;
  data: Contact | CalculatorSubmission | QuoteRequest | DetailedQuote | JobApplication;
};

export type MessagesStats = {
  totalContacts: number;
  totalCalculators: number;
  totalQuotes: number;
  totalDetailedQuotes: number;
  totalJobApplications: number;
  newMessages: number;
  unreadMessages: number;
  urgentMessages: number;
};

// Ré-exporter les types importés pour compatibilité
export type { Contact, QuoteRequest, DetailedQuote, CalculatorSubmission, EmailLog };

// =============================================
// CONTACTS - READ
// =============================================

export async function getAllContacts(showDeleted = false): Promise<Contact[]> {
  // Use admin client to bypass RLS and fetch deleted contacts too
  const supabase = getAdminClient();

  let query = supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching contacts:", error);
    throw new Error("Failed to fetch contacts");
  }

  return data || [];
}

// =============================================
// CALCULATOR SUBMISSIONS - READ
// =============================================

export async function getAllCalculatorSubmissions(showDeleted = false): Promise<CalculatorSubmission[]> {
  // Use admin client to bypass RLS and fetch deleted calculator submissions too
  const supabase = getAdminClient();

  let query = supabase
    .from("calculator_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching calculator submissions:", error);
    throw new Error("Failed to fetch calculator submissions");
  }

  return data || [];
}

// =============================================
// QUOTE REQUESTS - READ
// =============================================

export async function getAllQuoteRequests(showDeleted = false): Promise<QuoteRequest[]> {
  // Use admin client to bypass RLS and fetch deleted quote requests too
  const supabase = getAdminClient();

  let query = supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching quote requests:", error);
    throw new Error("Failed to fetch quote requests");
  }

  return data || [];
}

// =============================================
// DETAILED QUOTES - READ
// =============================================

export async function getAllDetailedQuotes(showDeleted = false): Promise<DetailedQuote[]> {
  // Use admin client to bypass RLS and fetch deleted detailed quotes too
  const supabase = getAdminClient();

  let query = supabase
    .from("detailed_quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching detailed quotes:", error);
    throw new Error("Failed to fetch detailed quotes");
  }

  return data || [];
}

// =============================================
// UNIFIED MESSAGES - READ
// =============================================

export async function getAllMessages(showDeleted = false): Promise<UnifiedMessage[]> {
  // Import getJobApplications from job-applications.ts
  const { getJobApplications } = await import('./job-applications');

  const [contacts, calculators, quotes, detailedQuotes, jobApplications] = await Promise.all([
    getAllContacts(showDeleted),
    getAllCalculatorSubmissions(showDeleted),
    getAllQuoteRequests(showDeleted),
    getAllDetailedQuotes(showDeleted),
    getJobApplications().then(result => result.success ? result.data : []),
  ]);

  const unifiedMessages: UnifiedMessage[] = [
    ...contacts.map((contact) => ({
      id: contact.id,
      type: 'contact' as const,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject || undefined,
      message: contact.message,
      source: contact.source || undefined,
      status: contact.status,
      priority: contact.priority,
      created_at: contact.created_at,
      data: contact,
    })),
    ...calculators.map((calc) => ({
      id: calc.id,
      type: 'calculator' as const,
      name: calc.name,
      email: calc.email,
      phone: calc.phone,
      project_type: calc.project_type,
      source: calc.source || undefined,
      status: calc.status,
      created_at: calc.created_at,
      data: calc,
    })),
    ...quotes.map((quote) => ({
      id: quote.id,
      type: 'quote' as const,
      name: quote.name,
      email: quote.email,
      phone: quote.phone,
      service_type: quote.service_type,
      message: quote.project_description,
      source: quote.source || undefined,
      status: quote.status,
      urgency: quote.urgency,
      created_at: quote.created_at,
      data: quote,
    })),
    ...detailedQuotes.map((detailedQuote) => ({
      id: detailedQuote.id,
      type: 'detailed-quote' as const,
      name: detailedQuote.name,
      email: detailedQuote.email,
      phone: detailedQuote.phone,
      service_type: detailedQuote.project_nature.join(', '),
      message: detailedQuote.special_requests || `Demande détaillée: ${detailedQuote.project_nature.join(', ')}`,
      status: detailedQuote.status,
      created_at: detailedQuote.created_at,
      data: detailedQuote,
    })),
    ...jobApplications.map((application) => ({
      id: application.id,
      type: 'job-application' as const,
      name: application.name,
      email: application.email,
      phone: application.phone,
      job_title: application.job_title,
      cv_url: application.cv_url,
      cover_letter_url: application.cover_letter_url || undefined,
      message: application.message || undefined,
      status: application.status,
      created_at: application.created_at,
      data: application,
    })),
  ];

  // Sort by created_at descending
  return unifiedMessages.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getMessagesStats(): Promise<MessagesStats> {
  const supabase = await createClient();

  const [contactsCount, calculatorsCount, quotesCount, detailedQuotesCount, jobApplicationsCount, newContacts, newCalculators, newQuotes, newDetailedQuotes, newJobApplications, urgentContacts, urgentQuotes] =
    await Promise.all([
      supabase.from("contacts").select("id", { count: "exact" }).is("deleted_at", null),
      supabase.from("calculator_submissions").select("id", { count: "exact" }).is("deleted_at", null),
      supabase.from("quote_requests").select("id", { count: "exact" }).is("deleted_at", null),
      supabase.from("detailed_quotes").select("id", { count: "exact" }).is("deleted_at", null),
      supabase.from("job_applications").select("id", { count: "exact" }).is("deleted_at", null),
      supabase.from("contacts").select("id", { count: "exact" }).eq("status", "new").is("deleted_at", null),
      supabase.from("calculator_submissions").select("id", { count: "exact" }).eq("status", "new").is("deleted_at", null),
      supabase.from("quote_requests").select("id", { count: "exact" }).eq("status", "new").is("deleted_at", null),
      supabase.from("detailed_quotes").select("id", { count: "exact" }).eq("status", "new").is("deleted_at", null),
      supabase.from("job_applications").select("id", { count: "exact" }).eq("status", "new").is("deleted_at", null),
      supabase.from("contacts").select("id", { count: "exact" }).eq("priority", "urgent").is("deleted_at", null),
      supabase.from("quote_requests").select("id", { count: "exact" }).eq("urgency", "urgent").is("deleted_at", null),
    ]);

  const newMessages = (newContacts.count || 0) + (newCalculators.count || 0) + (newQuotes.count || 0) + (newDetailedQuotes.count || 0) + (newJobApplications.count || 0);
  const urgentMessages = (urgentContacts.count || 0) + (urgentQuotes.count || 0);

  return {
    totalContacts: contactsCount.count || 0,
    totalCalculators: calculatorsCount.count || 0,
    totalQuotes: quotesCount.count || 0,
    totalDetailedQuotes: detailedQuotesCount.count || 0,
    totalJobApplications: jobApplicationsCount.count || 0,
    newMessages,
    unreadMessages: newMessages, // Same as new for now
    urgentMessages,
  };
}

// =============================================
// UPDATE STATUS
// =============================================

export async function updateContactStatus(
  id: string,
  status: Contact['status']
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'replied') {
    updateData.replied_at = new Date().toISOString();
  } else if (status === 'archived') {
    updateData.archived_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("contacts")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating contact status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function updateCalculatorStatus(
  id: string,
  status: CalculatorSubmission['status']
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'contacted') {
    updateData.contacted_at = new Date().toISOString();
  } else if (status === 'archived') {
    updateData.archived_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("calculator_submissions")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating calculator status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteRequest['status']
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'quote_sent') {
    updateData.quote_sent_at = new Date().toISOString();
  } else if (status === 'archived') {
    updateData.archived_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("quote_requests")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating quote status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

// =============================================
// UPDATE ADMIN NOTES
// =============================================

export async function updateContactNotes(
  id: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("contacts")
    .update({
      admin_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating contact notes:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function updateCalculatorNotes(
  id: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("calculator_submissions")
    .update({
      admin_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating calculator notes:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function updateQuoteNotes(
  id: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("quote_requests")
    .update({
      admin_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating quote notes:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function updateDetailedQuoteStatus(
  id: string,
  status: DetailedQuote['status']
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'reviewed') {
    updateData.is_read = true;
  } else if (status === 'archived') {
    updateData.archived_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("detailed_quotes")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating detailed quote status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin/inbox");
  return { success: true };
}

export async function updateDetailedQuoteNotes(
  id: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("detailed_quotes")
    .update({
      admin_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating detailed quote notes:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin/inbox");
  return { success: true };
}

// =============================================
// SOFT DELETE
// =============================================

export async function deleteContact(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("contacts")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Error deleting contact:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function deleteCalculatorSubmission(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("calculator_submissions")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Error deleting calculator submission:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function deleteQuoteRequest(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("quote_requests")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Error deleting quote request:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}

export async function deleteDetailedQuote(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("detailed_quotes")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user?.id,
    })
    .eq("id", id);

  if (error) {
    console.error("Error deleting detailed quote:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin/inbox");
  return { success: true };
}

// =============================================
// SEARCH
// =============================================

export async function searchMessages(query: string): Promise<UnifiedMessage[]> {
  if (!query.trim()) {
    return getAllMessages();
  }

  const supabase = await createClient();

  const [contactsResult, quotesResult] = await Promise.all([
    supabase
      .from("contacts")
      .select("*")
      .textSearch("name", query, { type: "websearch", config: "french" })
      .is("deleted_at", null),
    supabase
      .from("quote_requests")
      .select("*")
      .textSearch("name", query, { type: "websearch", config: "french" })
      .is("deleted_at", null),
  ]);

  const contacts = contactsResult.data || [];
  const quotes = quotesResult.data || [];

  const unifiedMessages: UnifiedMessage[] = [
    ...contacts.map((contact) => ({
      id: contact.id,
      type: 'contact' as const,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject || undefined,
      message: contact.message,
      source: contact.source || undefined,
      status: contact.status,
      priority: contact.priority,
      created_at: contact.created_at,
      data: contact,
    })),
    ...quotes.map((quote) => ({
      id: quote.id,
      type: 'quote' as const,
      name: quote.name,
      email: quote.email,
      phone: quote.phone,
      service_type: quote.service_type,
      message: quote.project_description,
      source: quote.source || undefined,
      status: quote.status,
      urgency: quote.urgency,
      created_at: quote.created_at,
      data: quote,
    })),
  ];

  return unifiedMessages.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// =============================================
// EMAIL - SEND via Resend
// =============================================

export async function sendReplyEmail({
  to,
  toName,
  subject,
  htmlContent,
  textContent,
  relatedType,
  relatedId,
}: {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  relatedType?: 'contact' | 'calculator' | 'quote';
  relatedId?: string;
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  const supabase = await createClient();

  // Check if Resend is configured
  if (!isResendConfigured || !resend) {
    return {
      success: false,
      error: 'Resend is not configured. Please add RESEND_API_KEY to environment variables.',
    };
  }

  try {
    // Send email via Resend
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML if no text version
    });

    if (resendError) {
      console.error('Resend error:', resendError);

      // Log failed email
      await supabase.from("email_logs").insert({
        from_email: FROM_EMAIL,
        from_name: FROM_NAME,
        to_email: to,
        to_name: toName,
        subject,
        html_content: htmlContent,
        text_content: textContent,
        related_type: relatedType,
        related_id: relatedId,
        status: 'failed',
        error_message: resendError.message,
      });

      return { success: false, error: resendError.message };
    }

    // Log successful email
    const { data: emailLog, error: logError } = await supabase
      .from("email_logs")
      .insert({
        resend_id: resendData?.id,
        from_email: FROM_EMAIL,
        from_name: FROM_NAME,
        to_email: to,
        to_name: toName,
        subject,
        html_content: htmlContent,
        text_content: textContent,
        related_type: relatedType,
        related_id: relatedId,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging email:', logError);
    }

    // Update message status to "replied" if related
    if (relatedType && relatedId) {
      if (relatedType === 'contact') {
        await updateContactStatus(relatedId, 'replied');
      }
    }

    revalidatePath("/admin/messages");
    revalidatePath("/admin/email-logs");

    return { success: true, emailLogId: emailLog?.id };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// EMAIL LOGS - READ
// =============================================

// EmailLog est importé depuis database-helpers.ts

export async function getAllEmailLogs(showDeleted = false): Promise<EmailLog[]> {
  const supabase = await createClient();

  let query = supabase
    .from("email_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching email logs:", error);
    throw new Error("Failed to fetch email logs");
  }

  return data || [];
}

export async function getEmailLogsStats() {
  const supabase = await createClient();

  const [totalResult, sentResult, deliveredResult, openedResult, bouncedResult] = await Promise.all([
    supabase.from("email_logs").select("id", { count: "exact" }).is("deleted_at", null),
    supabase.from("email_logs").select("id", { count: "exact" }).eq("status", "sent").is("deleted_at", null),
    supabase.from("email_logs").select("id", { count: "exact" }).eq("delivery_status", "delivered").is("deleted_at", null),
    supabase.from("email_logs").select("id", { count: "exact" }).not("opened_at", "is", null).is("deleted_at", null),
    supabase.from("email_logs").select("id", { count: "exact" }).eq("delivery_status", "bounced").is("deleted_at", null),
  ]);

  return {
    total: totalResult.count || 0,
    sent: sentResult.count || 0,
    delivered: deliveredResult.count || 0,
    opened: openedResult.count || 0,
    bounced: bouncedResult.count || 0,
  };
}

// =============================================
// BULK OPERATIONS - ARCHIVE/UNARCHIVE
// =============================================

function getTableName(type: 'contact' | 'calculator' | 'quote' | 'detailed-quote' | 'job-application'): string {
  switch (type) {
    case 'contact':
      return 'contacts';
    case 'calculator':
      return 'calculator_submissions';
    case 'quote':
      return 'quote_requests';
    case 'detailed-quote':
      return 'detailed_quotes';
    case 'job-application':
      return 'job_applications';
  }
}

export async function archiveMessages(
  ids: string[],
  type: 'contact' | 'calculator' | 'quote' | 'detailed-quote' | 'job-application'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const table = getTableName(type);

  const { error } = await supabase
    .from(table)
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in('id', ids);

  if (error) {
    console.error(`Error archiving ${type}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/inbox');
  return { success: true };
}

export async function unarchiveMessages(
  ids: string[],
  type: 'contact' | 'calculator' | 'quote' | 'detailed-quote' | 'job-application'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const table = getTableName(type);

  // Restore to appropriate status based on type
  // detailed_quotes doesn't have 'read' status, use 'new' instead
  const newStatus = type === 'detailed-quote' ? 'new' : 'read';

  const { error } = await supabase
    .from(table)
    .update({
      status: newStatus,
      archived_at: null,
      updated_at: new Date().toISOString(),
    })
    .in('id', ids);

  if (error) {
    console.error(`Error unarchiving ${type}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/inbox');
  return { success: true };
}

export async function bulkMarkAsRead(
  ids: string[],
  type: 'contact' | 'calculator' | 'quote' | 'detailed-quote' | 'job-application'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const table = getTableName(type);

  const { error } = await supabase
    .from(table)
    .update({
      status: 'read',
      updated_at: new Date().toISOString(),
    })
    .in('id', ids);

  if (error) {
    console.error(`Error marking as read ${type}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/inbox');
  return { success: true };
}

// =============================================
// SEND MANUAL EMAIL
// =============================================

export async function sendManualEmail({
  to_email,
  to_name,
  subject,
  message,
  related_type,
  related_id,
}: {
  to_email: string;
  to_name?: string;
  subject: string;
  message: string;
  related_type?: string;
  related_id?: string;
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  const supabase = await createClient();

  // Check if Resend is configured
  if (!isResendConfigured || !resend) {
    return {
      success: false,
      error: 'Resend is not configured. Please add RESEND_API_KEY to environment variables.',
    };
  }

  try {
    // Convert plain text message to HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${message.split('\n').map(line => `<p style="margin: 10px 0;">${line}</p>`).join('')}
        <br/>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 14px;">
          Cordialement,<br/>
          L'équipe FormDeToit<br/>
          <a href="https://formdetoit.fr" style="color: #f59e0b;">www.formdetoit.fr</a>
        </p>
      </div>
    `;

    // Send email via Resend
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to_email],
      subject,
      html: htmlContent,
      text: message,
    });

    if (resendError) {
      console.error('Resend error:', resendError);

      // Log failed email
      await supabase.from('email_logs').insert({
        from_email: FROM_EMAIL,
        from_name: FROM_NAME,
        to_email,
        to_name,
        subject,
        html_content: htmlContent,
        text_content: message,
        related_type: related_type || 'manual',
        related_id,
        status: 'failed',
        error_message: resendError.message,
      });

      return { success: false, error: resendError.message };
    }

    // Log successful email
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        resend_id: resendData?.id,
        from_email: FROM_EMAIL,
        from_name: FROM_NAME,
        to_email,
        to_name,
        subject,
        html_content: htmlContent,
        text_content: message,
        related_type: related_type || 'manual',
        related_id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging email:', logError);
    }

    revalidatePath('/admin/inbox');
    revalidatePath('/admin/email-logs');

    return { success: true, emailLogId: emailLog?.id };
  } catch (error: any) {
    console.error('Error sending manual email:', error);
    return { success: false, error: error.message };
  }
}

// Alias for getSentEmails (uses getAllEmailLogs)
export const getSentEmails = getAllEmailLogs;

// =============================================
// RESEND EMAIL
// =============================================

export async function resendEmail(
  emailLogId: string
): Promise<{ success: boolean; error?: string; newEmailLogId?: string }> {
  const supabase = await createClient();

  // Check if Resend is configured
  if (!isResendConfigured || !resend) {
    return {
      success: false,
      error: 'Resend is not configured. Please add RESEND_API_KEY to environment variables.',
    };
  }

  try {
    // Get original email log
    const { data: originalEmail, error: fetchError } = await supabase
      .from('email_logs')
      .select('*')
      .eq('id', emailLogId)
      .single();

    if (fetchError || !originalEmail) {
      return { success: false, error: 'Email log not found' };
    }

    // Resend the email
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [originalEmail.to_email],
      subject: originalEmail.subject,
      html: originalEmail.html_content || '',
      text: originalEmail.text_content || undefined,
    });

    if (resendError) {
      console.error('Resend error:', resendError);

      // Log failed resend attempt
      await supabase.from('email_logs').insert({
        from_email: FROM_EMAIL,
        from_name: FROM_NAME,
        to_email: originalEmail.to_email,
        to_name: originalEmail.to_name,
        subject: `[RENVOI] ${originalEmail.subject}`,
        html_content: originalEmail.html_content,
        text_content: originalEmail.text_content,
        related_type: originalEmail.related_type,
        related_id: originalEmail.related_id,
        status: 'failed',
        error_message: resendError.message,
      });

      return { success: false, error: resendError.message };
    }

    // Log successful resend
    const { data: newEmailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        resend_id: resendData?.id,
        from_email: FROM_EMAIL,
        from_name: FROM_NAME,
        to_email: originalEmail.to_email,
        to_name: originalEmail.to_name,
        subject: originalEmail.subject,
        html_content: originalEmail.html_content,
        text_content: originalEmail.text_content,
        related_type: originalEmail.related_type,
        related_id: originalEmail.related_id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging resent email:', logError);
    }

    revalidatePath('/admin/email-logs');

    return { success: true, newEmailLogId: newEmailLog?.id };
  } catch (error: any) {
    console.error('Error resending email:', error);
    return { success: false, error: error.message };
  }
}
