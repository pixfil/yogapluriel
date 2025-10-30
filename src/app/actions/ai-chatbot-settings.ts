'use server';

import { getAdminClient, createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase';

/**
 * Interface pour les settings AI Chatbot (sans les clés API)
 */
export interface AIChatbotSettings {
  chatbot_mode: 'classic' | 'ai';
  ai_provider: 'openai' | 'anthropic' | 'mistral';
  ai_model: string;
  system_prompt: string;
  rag_enabled: boolean;
}

/**
 * Interface pour les clés API des providers
 * Utilisée uniquement pour la sauvegarde (jamais retournée au client)
 */
export interface AIProviderKeys {
  openai_api_key?: string;
  anthropic_api_key?: string;
  mistral_api_key?: string;
}

/**
 * Récupérer les settings AI Chatbot (sans les clés API pour sécurité)
 * Accessible par tous les utilisateurs authentifiés (lecture seule)
 */
export async function getAIChatbotSettings(): Promise<AIChatbotSettings> {
  try {
    const supabase = getAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('ai_chatbot_settings')
      .select('chatbot_mode, ai_provider, ai_model, system_prompt, rag_enabled')
      .single();

    if (error) {
      console.error('Error fetching AI chatbot settings:', error);
      // Retourner config par défaut si erreur
      return getDefaultSettings();
    }

    return data as AIChatbotSettings;
  } catch (error) {
    console.error('Unexpected error in getAIChatbotSettings:', error);
    return getDefaultSettings();
  }
}

/**
 * Configuration par défaut (fallback)
 */
function getDefaultSettings(): AIChatbotSettings {
  return {
    chatbot_mode: 'classic',
    ai_provider: 'openai',
    ai_model: 'gpt-4o',
    system_prompt: 'Tu es un assistant virtuel pour FormDeToit, entreprise de couverture et zinguerie à Strasbourg. Tu es expert en toiture, charpente, isolation et zinguerie. Tu aides les clients avec leurs questions sur les travaux de toiture, les matériaux, les devis et les conseils techniques. Réponds de manière claire, professionnelle et bienveillante.',
    rag_enabled: true,
  };
}

/**
 * Mettre à jour les settings AI Chatbot
 * Réservé aux admins (RLS policy côté Supabase)
 */
export async function updateAIChatbotSettings(
  settings: AIChatbotSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier que l'utilisateur est authentifié et admin
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const supabase = getAdminClient();

    // Récupérer l'ID du setting (il n'y en a qu'un seul)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingSettings } = await (supabase as any)
      .from('ai_chatbot_settings')
      .select('id')
      .single();

    if (!existingSettings) {
      return { success: false, error: 'Settings not found' };
    }

    // Mettre à jour les settings
    // Type explicite requis car @supabase/ssr ne propage pas automatiquement les types Database
    const updateData: Database['public']['Tables']['ai_chatbot_settings']['Update'] = {
      ...settings,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    // Note technique: @supabase/ssr v0.7.0 ne propage pas les types Database pour les tables custom
    // La table existe (voir migration: supabase/migrations/20251023_create_ai_chatbot_settings.sql)
    // Le type de updateData est validé ci-dessus. Cast nécessaire pour bypasser le bug de typage.
    // TODO: Régénérer les types avec `npx supabase gen types typescript` après migration en production
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('ai_chatbot_settings')
      .update(updateData)
      .eq('id', existingSettings.id);

    if (error) {
      console.error('Error updating AI chatbot settings:', error);
      return { success: false, error: error.message };
    }

    // Revalider le cache
    revalidatePath('/admin/settings');
    revalidatePath('/'); // Pour layout public qui affiche le chatbot

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateAIChatbotSettings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sauvegarder les clés API des providers (chiffrées en BDD)
 * IMPORTANT: Les clés sont chiffrées avec ENCRYPTION_SECRET avant stockage
 * Réservé aux admins
 */
export async function saveProviderApiKeys(
  keys: AIProviderKeys
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier que l'utilisateur est authentifié et admin
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Vérifier que ENCRYPTION_SECRET est configuré
    const encryptionSecret = process.env.ENCRYPTION_SECRET;
    if (!encryptionSecret || encryptionSecret.length < 32) {
      console.error('ENCRYPTION_SECRET not configured or too short (min 32 chars)');
      return {
        success: false,
        error: 'Encryption not configured. Please set ENCRYPTION_SECRET in .env.local',
      };
    }

    const supabase = getAdminClient();

    // Récupérer l'ID du setting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingSettings } = await (supabase as any)
      .from('ai_chatbot_settings')
      .select('id')
      .single();

    if (!existingSettings) {
      return { success: false, error: 'Settings not found' };
    }

    const updates: any = {};

    // Chiffrer chaque clé fournie
    if (keys.openai_api_key) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: encryptedKey, error } = await (supabase as any).rpc('encrypt_api_key', {
        key: keys.openai_api_key,
        secret: encryptionSecret,
      });

      if (error) {
        console.error('Error encrypting OpenAI key:', error);
        return { success: false, error: `Failed to encrypt OpenAI key: ${error.message}` };
      }

      updates.openai_api_key_encrypted = encryptedKey;
    }

    if (keys.anthropic_api_key) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: encryptedKey, error } = await (supabase as any).rpc('encrypt_api_key', {
        key: keys.anthropic_api_key,
        secret: encryptionSecret,
      });

      if (error) {
        console.error('Error encrypting Anthropic key:', error);
        return { success: false, error: `Failed to encrypt Anthropic key: ${error.message}` };
      }

      updates.anthropic_api_key_encrypted = encryptedKey;
    }

    if (keys.mistral_api_key) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: encryptedKey, error } = await (supabase as any).rpc('encrypt_api_key', {
        key: keys.mistral_api_key,
        secret: encryptionSecret,
      });

      if (error) {
        console.error('Error encrypting Mistral key:', error);
        return { success: false, error: `Failed to encrypt Mistral key: ${error.message}` };
      }

      updates.mistral_api_key_encrypted = encryptedKey;
    }

    // Sauvegarder les clés chiffrées
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('ai_chatbot_settings')
      .update(updates)
      .eq('id', existingSettings.id);

    if (updateError) {
      console.error('Error saving encrypted keys:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/settings');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in saveProviderApiKeys:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Vérifier si une clé API existe pour un provider (sans la révéler)
 * Utile pour l'UI admin : afficher "Clé configurée ✓" ou "Pas de clé"
 */
export async function checkApiKeyExists(
  provider: 'openai' | 'anthropic' | 'mistral'
): Promise<boolean> {
  try {
    const supabase = getAdminClient();

    const fieldName = `${provider}_api_key_encrypted`;

    const { data, error } = await supabase
      .from('ai_chatbot_settings')
      .select(fieldName)
      .single();

    if (error || !data) {
      return false;
    }

    // Vérifier si le champ contient des données (bytea)
    return !!data[fieldName];
  } catch (error) {
    console.error('Error checking API key existence:', error);
    return false;
  }
}

// Note: getProviderDisplayName et getAvailableModels ont été déplacés vers src/lib/ai-helpers.ts
// car les fonctions synchrones ne peuvent pas être exportées depuis des fichiers 'use server'
