#!/usr/bin/env node
/**
 * Script de diagnostic des permissions utilisateur
 * Usage: node scripts/check-user-permissions.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUserPermissions() {
  console.log('🔍 Diagnostic des permissions utilisateur\n');
  console.log('='.repeat(60));

  try {
    // 1. Lister tous les utilisateurs dans auth.users
    console.log('\n📋 Utilisateurs dans auth.users:');
    console.log('-'.repeat(60));

    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs auth:', authError);
      return;
    }

    if (!authUsers || authUsers.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé dans auth.users');
      return;
    }

    console.log(`✓ ${authUsers.length} utilisateur(s) trouvé(s)\n`);

    // Afficher chaque utilisateur
    for (const user of authUsers) {
      console.log(`📧 Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Créé le: ${new Date(user.created_at).toLocaleString('fr-FR')}`);
      console.log(`   Confirmé: ${user.email_confirmed_at ? '✓' : '✗'}`);
      console.log();
    }

    // 2. Vérifier les profils dans user_profiles
    console.log('='.repeat(60));
    console.log('\n👤 Profils dans user_profiles:');
    console.log('-'.repeat(60));

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️  Aucun profil trouvé dans user_profiles');
      console.log('\n💡 Solution: Les profils doivent être créés pour chaque utilisateur auth.');
      return;
    }

    console.log(`✓ ${profiles.length} profil(s) trouvé(s)\n`);

    // Créer une map des emails pour faciliter l'affichage
    const emailMap = new Map();
    authUsers.forEach(user => {
      emailMap.set(user.id, user.email);
    });

    // Afficher chaque profil
    for (const profile of profiles) {
      const email = emailMap.get(profile.id) || '(email non trouvé)';

      console.log(`📧 Email: ${email}`);
      console.log(`   Nom: ${profile.name || '(non défini)'}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Rôles: ${JSON.stringify(profile.roles)}`);
      console.log(`   Statut: ${profile.status}`);
      console.log(`   Supprimé: ${profile.deleted_at ? '✓ (le ' + new Date(profile.deleted_at).toLocaleString('fr-FR') + ')' : '✗'}`);
      console.log(`   Dernière connexion: ${profile.last_login ? new Date(profile.last_login).toLocaleString('fr-FR') : 'Jamais'}`);
      console.log();
    }

    // 3. Identifier les utilisateurs auth sans profil
    console.log('='.repeat(60));
    console.log('\n⚠️  Utilisateurs auth SANS profil:');
    console.log('-'.repeat(60));

    const profileIds = new Set(profiles.map(p => p.id));
    const usersWithoutProfile = authUsers.filter(user => !profileIds.has(user.id));

    if (usersWithoutProfile.length === 0) {
      console.log('✓ Tous les utilisateurs auth ont un profil');
    } else {
      console.log(`❌ ${usersWithoutProfile.length} utilisateur(s) sans profil:\n`);
      for (const user of usersWithoutProfile) {
        console.log(`   📧 ${user.email} (ID: ${user.id})`);
      }
      console.log('\n💡 Solution: Exécutez scripts/fix-super-admin.mjs pour créer les profils manquants');
    }

    // 4. Vérifier les super admins
    console.log('\n' + '='.repeat(60));
    console.log('\n🔑 Super Administrateurs:');
    console.log('-'.repeat(60));

    const superAdmins = profiles.filter(p =>
      p.roles && Array.isArray(p.roles) && p.roles.includes('super_admin')
    );

    if (superAdmins.length === 0) {
      console.log('⚠️  Aucun super administrateur trouvé !');
      console.log('\n💡 Solution: Exécutez scripts/fix-super-admin.mjs pour ajouter le rôle super_admin');
    } else {
      console.log(`✓ ${superAdmins.length} super administrateur(s):\n`);
      for (const admin of superAdmins) {
        const email = emailMap.get(admin.id) || '(email non trouvé)';
        console.log(`   📧 ${email}`);
        console.log(`      Nom: ${admin.name || '(non défini)'}`);
        console.log(`      Statut: ${admin.status}`);
        console.log(`      Supprimé: ${admin.deleted_at ? '✓' : '✗'}`);
        console.log();
      }
    }

    console.log('='.repeat(60));
    console.log('\n✅ Diagnostic terminé\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du diagnostic:', error);
    process.exit(1);
  }
}

// Exécuter le diagnostic
checkUserPermissions();
