/**
 * Script d'initialisation des paramètres généraux FormDeToit
 * Ce script met à jour la table site_settings avec les vraies coordonnées de l'entreprise
 *
 * Usage: node scripts/init-general-settings.mjs
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Vraies informations FormDeToit
 */
const generalSettings = {
  phone: "03 88 75 66 53",
  email: "contact@formdetoit.fr",
  address: "4 rue Bernard Stalter\n67114 Eschau",
  hours: `Lundi : 8h30 - 12h
Mardi : 8h30 - 12h30, 13h30 - 17h
Mercredi : 8h30 - 12h30
Jeudi : 8h30 - 12h
Vendredi : 10h - 12h30, 13h30 - 16h30`,
  facebook: "https://www.facebook.com/formdetoit",
  instagram: "https://www.instagram.com/formdetoit_",
  linkedin: "", // À remplir si disponible
};

async function initGeneralSettings() {
  console.log("🚀 Initialisation des paramètres généraux FormDeToit...\n");

  try {
    // Vérifier si le paramètre existe déjà
    const { data: existing, error: fetchError } = await supabase
      .from("site_settings")
      .select("key, value")
      .eq("key", "general")
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = not found (acceptable)
      throw fetchError;
    }

    if (existing) {
      console.log("⚠️  Le paramètre 'general' existe déjà :");
      console.log(JSON.stringify(existing.value, null, 2));
      console.log("\n🔄 Mise à jour avec les nouvelles valeurs...\n");
    } else {
      console.log("✨ Création du paramètre 'general'...\n");
    }

    // UPDATE ou INSERT le paramètre avec les vraies infos
    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: "general",
          value: generalSettings,
          description:
            "Informations générales de l'entreprise (coordonnées, réseaux sociaux, horaires)",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "key",
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log("✅ Paramètres généraux initialisés avec succès !\n");
    console.log("📋 Valeurs enregistrées :");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📞 Téléphone : ${generalSettings.phone}`);
    console.log(`✉️  Email    : ${generalSettings.email}`);
    console.log(`📍 Adresse   : ${generalSettings.address.replace("\n", ", ")}`);
    console.log(`🕐 Horaires  :`);
    console.log(generalSettings.hours.split("\n").map(h => `   ${h}`).join("\n"));
    console.log(`🌐 Facebook  : ${generalSettings.facebook}`);
    console.log(`📷 Instagram : ${generalSettings.instagram}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎯 Prochaines étapes :");
    console.log("  1. Vérifier les infos dans /admin/settings (onglet Général)");
    console.log("  2. Ajouter le LinkedIn si disponible");
    console.log("  3. Le footer et la page contact utiliseront ces données automatiquement");
    console.log("\n✨ Configuration terminée !\n");

  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation :", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
initGeneralSettings();
