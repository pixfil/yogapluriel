import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const BUCKET_NAME = 'certification-logos';
const LOCAL_LOGOS_DIR = path.join(__dirname, '../public/certifications');

// Mapping de noms de fichiers vers patterns de noms de certifications
const fileNameMappings = {
  'qualibat': 'qualibat',
  'qualipv': 'qualipv',
  'rge-garant': 'rge',
  'artisan': 'artisan',
  'alsace': 'alsace',
  'reseau-entreprendre': 'entreprendre',
  'velux': 'velux',
  'logo_artisan_alsace': 'artisan'
};

async function uploadCertificationLogos() {
  console.log('🚀 Début de l\'upload des logos de certifications...\n');

  // 1. Vérifier que le bucket existe
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.error('❌ Le bucket certification-logos n\'existe pas. Exécutez d\'abord la migration SQL.');
    process.exit(1);
  }

  console.log(`✅ Bucket "${BUCKET_NAME}" trouvé\n`);

  // 2. Récupérer toutes les certifications existantes
  const { data: certifications, error: fetchError } = await supabase
    .from('certifications')
    .select('id, name, logo_url');

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des certifications:', fetchError);
    process.exit(1);
  }

  console.log(`📋 ${certifications.length} certifications trouvées en BDD:\n`);
  certifications.forEach(cert => {
    console.log(`   - ${cert.name} (logo: ${cert.logo_url || 'MANQUANT'})`);
  });
  console.log('');

  // 3. Lire les fichiers du dossier local
  if (!fs.existsSync(LOCAL_LOGOS_DIR)) {
    console.error(`❌ Le dossier ${LOCAL_LOGOS_DIR} n'existe pas`);
    process.exit(1);
  }

  const files = fs.readdirSync(LOCAL_LOGOS_DIR).filter(file =>
    /\.(jpg|jpeg|png|webp|svg)$/i.test(file)
  );

  console.log(`📁 ${files.length} logos trouvés dans ${LOCAL_LOGOS_DIR}:\n`);
  files.forEach(file => console.log(`   - ${file}`));
  console.log('');

  // 4. Upload et matching
  let uploadedCount = 0;
  let matchedCount = 0;
  const unmatchedLogos = [];

  for (const file of files) {
    const filePath = path.join(LOCAL_LOGOS_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.parse(file).name.toLowerCase();
    const fileExt = path.extname(file);

    // Déterminer le type MIME
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    const contentType = mimeTypes[fileExt.toLowerCase()] || 'image/jpeg';

    // Upload vers Supabase Storage
    const storagePath = `${fileName}${fileExt}`;

    console.log(`📤 Upload de ${file}...`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.error(`   ❌ Erreur: ${uploadError.message}`);
      continue;
    }

    uploadedCount++;
    console.log(`   ✅ Uploadé: ${storagePath}`);

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const logoUrl = urlData.publicUrl;

    // Tenter de matcher avec une certification
    let matched = false;
    for (const cert of certifications) {
      const certNameLower = cert.name.toLowerCase();

      // Recherche de pattern dans le nom de fichier
      const pattern = Object.entries(fileNameMappings).find(([key]) =>
        fileName.includes(key.toLowerCase())
      );

      if (pattern) {
        const [, searchTerm] = pattern;
        if (certNameLower.includes(searchTerm.toLowerCase())) {
          // Match trouvé !
          const { error: updateError } = await supabase
            .from('certifications')
            .update({ logo_url: logoUrl })
            .eq('id', cert.id);

          if (updateError) {
            console.error(`   ❌ Erreur mise à jour: ${updateError.message}`);
          } else {
            console.log(`   🎯 Associé à: "${cert.name}"`);
            matchedCount++;
            matched = true;
            break;
          }
        }
      }
    }

    if (!matched) {
      console.log(`   ⚠️  Aucune certification correspondante trouvée`);
      unmatchedLogos.push({ file, url: logoUrl });
    }

    console.log('');
  }

  // 5. Résumé
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RÉSUMÉ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Logos uploadés: ${uploadedCount}/${files.length}`);
  console.log(`🎯 Certifications mises à jour: ${matchedCount}`);
  console.log(`⚠️  Logos non associés: ${unmatchedLogos.length}`);

  if (unmatchedLogos.length > 0) {
    console.log('\n📌 Logos uploadés mais non associés:');
    unmatchedLogos.forEach(({ file, url }) => {
      console.log(`   - ${file}`);
      console.log(`     URL: ${url}`);
    });
    console.log('\n💡 Ces logos peuvent être associés manuellement via l\'admin');
  }

  console.log('\n✨ Terminé !\n');
}

// Exécution
uploadCertificationLogos().catch(console.error);
