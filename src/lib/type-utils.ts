/**
 * Utilitaires de conversion de types Supabase
 *
 * Supabase retourne beaucoup de champs nullables (string | null, boolean | null, etc.)
 * Ces helpers permettent de gérer les conversions de manière sûre.
 */

import { Database } from './database.types';

// Type Json de Supabase
export type Json = Database['public']['Tables']['projects']['Row']['technical_details'];

/**
 * Convertit un champ nullable en non-nullable avec une valeur par défaut
 */
export function unwrapNullable<T>(value: T | null, defaultValue: T): T {
  return value !== null ? value : defaultValue;
}

/**
 * Convertit un Json Supabase en Record<string, any>
 * Gère le cas où Json peut être null
 */
export function jsonToRecord(json: Json): Record<string, any> {
  if (json === null) return {};
  if (typeof json === 'object' && !Array.isArray(json)) {
    return json as Record<string, any>;
  }
  return {};
}

/**
 * Convertit un Json Supabase en tableau
 * Gère le cas où Json peut être null ou pas un tableau
 */
export function jsonToArray<T = any>(json: Json): T[] {
  if (Array.isArray(json)) {
    return json as T[];
  }
  return [];
}

/**
 * Convertit un string | null en string avec valeur par défaut
 */
export function stringOrDefault(value: string | null, defaultValue: string = ''): string {
  return value ?? defaultValue;
}

/**
 * Convertit un boolean | null en boolean avec valeur par défaut
 */
export function booleanOrDefault(value: boolean | null, defaultValue: boolean = false): boolean {
  return value ?? defaultValue;
}

/**
 * Convertit un number | null en number avec valeur par défaut
 */
export function numberOrDefault(value: number | null, defaultValue: number = 0): number {
  return value ?? defaultValue;
}

/**
 * Type guard pour vérifier si une valeur n'est pas null
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Type guard pour vérifier si un Json est un tableau
 */
export function isJsonArray(value: Json): value is any[] {
  return Array.isArray(value);
}

/**
 * Type guard pour vérifier si un Json est un objet
 */
export function isJsonObject(value: Json): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
