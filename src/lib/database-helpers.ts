/**
 * Types helpers pour faciliter l'utilisation des types Supabase
 *
 * Ce fichier réexporte les types de database.types.ts de manière plus pratique
 * et fournit des utilitaires pour la conversion de types.
 */

import { Database } from './database.types';

// ============================================
// Types de lignes (Row) - Lecture BDD
// ============================================

export type Contact = Database['public']['Tables']['contacts']['Row'];
export type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];
export type DetailedQuote = Database['public']['Tables']['detailed_quotes']['Row'];
export type CalculatorSubmission = Database['public']['Tables']['calculator_submissions']['Row'];
export type EmailLog = Database['public']['Tables']['email_logs']['Row'];
export type FAQCategory = Database['public']['Tables']['faq_categories']['Row'];
export type FAQItem = Database['public']['Tables']['faq_items']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectImage = Database['public']['Tables']['project_images']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type JobOpening = Database['public']['Tables']['job_openings']['Row'];
export type LexiqueTerm = Database['public']['Tables']['lexique']['Row'];
export type Redirect = Database['public']['Tables']['redirects']['Row'];
export type Log404 = Database['public']['Tables']['404_logs']['Row'];

// ============================================
// Types d'insertion (Insert) - Écriture BDD
// ============================================

export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type QuoteRequestInsert = Database['public']['Tables']['quote_requests']['Insert'];
export type DetailedQuoteInsert = Database['public']['Tables']['detailed_quotes']['Insert'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type EmailLogInsert = Database['public']['Tables']['email_logs']['Insert'];

// ============================================
// Types de mise à jour (Update)
// ============================================

export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type DetailedQuoteUpdate = Database['public']['Tables']['detailed_quotes']['Update'];

// ============================================
// Type Json de Supabase
// ============================================

export type Json = Database['public']['Tables']['projects']['Row']['technical_details'];

// ============================================
// Helpers de conversion
// ============================================

/**
 * Convertit un Json de Supabase vers un type typé
 * Utilise un double cast pour bypasser les incompatibilités de types
 */
export function fromJson<T>(json: Json | null | undefined, defaultValue: T): T {
  if (json === null || json === undefined) {
    return defaultValue;
  }
  return json as unknown as T;
}

/**
 * Convertit un type typé vers Json de Supabase
 */
export function toJson<T>(value: T): Json {
  return value as unknown as Json;
}

/**
 * Type guard pour vérifier si une valeur n'est pas null
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Convertit un boolean | null en boolean avec valeur par défaut
 */
export function booleanOrDefault(value: boolean | null, defaultValue = false): boolean {
  return value ?? defaultValue;
}

/**
 * Convertit un string | null en string avec valeur par défaut
 */
export function stringOrDefault(value: string | null, defaultValue = ''): string {
  return value ?? defaultValue;
}

/**
 * Convertit un number | null en number avec valeur par défaut
 */
export function numberOrDefault(value: number | null, defaultValue = 0): number {
  return value ?? defaultValue;
}
