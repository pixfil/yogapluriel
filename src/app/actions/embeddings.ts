'use server';

import { getAdminClient } from '@/lib/supabase-server';
import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';

import { Json } from '@/lib/database.types';
import { jsonToRecord } from '@/lib/type-utils';

/**
 * Convertit un vecteur number[] en format string pour pgvector
 * pgvector stocke les vecteurs comme des strings au format: "[0.1, 0.2, 0.3, ...]"
 */
function vectorToString(vector: number[]): string {
  return `[${vector.join(',')}]`;
}

/**
 * Interface pour un résultat de recherche vectorielle
 * Note: metadata est Json dans la BDD mais converti en Record<string, any>
 */
export interface EmbeddingSearchResult {
  id: string;
  content_type: string;
  content_id: string;
  content_text: string;
  metadata: Json; // Type BDD, sera converti avec jsonToRecord()
  similarity: number;
}

/**
 * Interface pour les statistiques d'embeddings
 */
export interface EmbeddingsStats {
  content_type: string;
  count: number;
  last_updated: string;
}

/**
 * Interface pour le statut de réindexation
 */
export interface ReindexStatus {
  success: boolean;
  message: string;
  stats?: {
    projects: number;
    faq: number;
    lexique: number;
    certifications: number;
    services: number;
    company_info: number;
    total: number;
  };
  error?: string;
}

/**
 * Générer un embedding pour un texte donné
 * Utilise OpenAI text-embedding-3-small (1536 dimensions)
 */
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    console.log('[generateEmbedding] API key length:', apiKey?.length || 0);

    if (!apiKey) {
      throw new Error('OpenAI API key not provided');
    }

    // Créer un provider OpenAI avec la clé custom
    const openai = createOpenAI({
      apiKey: apiKey,
    });

    console.log('[generateEmbedding] About to call embed...');

    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    });

    console.log('[generateEmbedding] Embedding generated successfully');

    return embedding;
  } catch (error) {
    console.error('[generateEmbedding] Error:', error);
    throw error;
  }
}

/**
 * Récupérer et déchiffrer la clé API OpenAI depuis Supabase
 */
async function getOpenAIApiKey(): Promise<string | null> {
  try {
    const supabase = getAdminClient();
    const encryptionSecret = process.env.ENCRYPTION_SECRET;

    console.log('[getOpenAIApiKey] ENCRYPTION_SECRET available:', !!encryptionSecret);

    if (!encryptionSecret) {
      console.error('[getOpenAIApiKey] ENCRYPTION_SECRET not configured');
      const fallback = process.env.DEFAULT_OPENAI_API_KEY || null;
      console.log('[getOpenAIApiKey] Using fallback:', !!fallback);
      return fallback;
    }

    // Récupérer la config AI
    const { data: config, error: configError } = await supabase
      .from('ai_chatbot_settings')
      .select('openai_api_key_encrypted')
      .single();

    console.log('[getOpenAIApiKey] Config retrieved:', !!config, 'Error:', configError?.message);
    console.log('[getOpenAIApiKey] Has encrypted key:', !!config?.openai_api_key_encrypted);

    if (configError || !config?.openai_api_key_encrypted) {
      // Fallback vers la clé par défaut
      const fallback = process.env.DEFAULT_OPENAI_API_KEY || null;
      console.log('[getOpenAIApiKey] No encrypted key, using fallback:', !!fallback);
      return fallback;
    }

    // Déchiffrer la clé
    const { data: decryptedKey, error: decryptError } = await supabase.rpc(
      'decrypt_api_key',
      {
        encrypted_key: config.openai_api_key_encrypted,
        secret: encryptionSecret,
      }
    );

    console.log('[getOpenAIApiKey] Decrypted key:', !!decryptedKey, 'Error:', decryptError?.message);

    if (decryptError || !decryptedKey) {
      console.error('[getOpenAIApiKey] Error decrypting API key:', decryptError);
      // Fallback vers la clé par défaut
      const fallback = process.env.DEFAULT_OPENAI_API_KEY || null;
      console.log('[getOpenAIApiKey] Using fallback after decrypt error:', !!fallback);
      return fallback;
    }

    console.log('[getOpenAIApiKey] Successfully got decrypted key!');
    return decryptedKey;
  } catch (error) {
    console.error('[getOpenAIApiKey] Unexpected error:', error);
    const fallback = process.env.DEFAULT_OPENAI_API_KEY || null;
    console.log('[getOpenAIApiKey] Using fallback after exception:', !!fallback);
    return fallback;
  }
}

/**
 * Rechercher dans les embeddings avec une requête texte
 * @param query - Texte de la requête utilisateur
 * @param options - Options de recherche (threshold, limit, type)
 */
export async function searchEmbeddings(
  query: string,
  options: {
    threshold?: number;
    limit?: number;
    contentType?: string;
  } = {}
): Promise<EmbeddingSearchResult[]> {
  try {
    const { threshold = 0.7, limit = 5, contentType = null } = options;

    // Récupérer la clé API OpenAI
    const apiKey = await getOpenAIApiKey();
    if (!apiKey) {
      console.error('No OpenAI API key available for embeddings search');
      return [];
    }

    // Générer l'embedding de la requête
    const queryEmbedding = await generateEmbedding(query, apiKey);

    // Rechercher dans Supabase
    const supabase = getAdminClient();

    const { data, error } = await supabase.rpc('search_content_embeddings', {
      query_embedding: vectorToString(queryEmbedding), // Convertir en string pour pgvector
      match_threshold: threshold,
      match_count: limit,
      filter_content_type: contentType ?? undefined, // Convertir null en undefined
    });

    if (error) {
      console.error('Error searching embeddings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchEmbeddings:', error);
    return [];
  }
}

/**
 * Obtenir les statistiques des embeddings
 * Pour affichage dans l'interface admin
 */
export async function getEmbeddingsStats(): Promise<EmbeddingsStats[]> {
  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase.rpc('get_embeddings_stats');

    if (error) {
      console.error('Error getting embeddings stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEmbeddingsStats:', error);
    return [];
  }
}

/**
 * Supprimer tous les embeddings existants
 * Utilisé avant une réindexation complète
 */
async function clearAllEmbeddings(): Promise<void> {
  const supabase = getAdminClient();

  const { error } = await supabase
    .from('content_embeddings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) {
    throw new Error(`Error clearing embeddings: ${error.message}`);
  }
}

/**
 * Indexer un élément de contenu
 */
async function indexContent(
  contentType: string,
  contentId: string,
  contentText: string,
  metadata: Record<string, any>,
  apiKey: string
): Promise<void> {
  const supabase = getAdminClient();

  // Générer l'embedding
  const embedding = await generateEmbedding(contentText, apiKey);

  // Insérer dans la BDD
  const { error } = await supabase
    .from('content_embeddings')
    .insert({
      content_type: contentType,
      content_id: contentId,
      content_text: contentText,
      embedding: vectorToString(embedding), // Convertir en string pour pgvector
      metadata: metadata as Json, // Cast en Json pour correspondre au type BDD
    });

  if (error) {
    throw new Error(`Error indexing content: ${error.message}`);
  }
}

/**
 * Réindexer tout le contenu du site
 * Cette fonction est appelée par le bouton dans l'admin
 */
export async function reindexAllContent(): Promise<ReindexStatus> {
  try {
    const supabase = getAdminClient();
    let stats = {
      projects: 0,
      faq: 0,
      lexique: 0,
      certifications: 0,
      services: 0,
      company_info: 0,
      total: 0,
    };

    console.log('🚀 Starting reindexation...');

    // 0. Récupérer la clé API OpenAI
    console.log('🔑 Getting OpenAI API key...');
    const apiKey = await getOpenAIApiKey();

    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please configure it in admin settings or add DEFAULT_OPENAI_API_KEY to .env.local');
    }

    // 1. Supprimer les anciens embeddings
    console.log('🗑️  Clearing old embeddings...');
    await clearAllEmbeddings();

    // 2. Indexer les projets
    console.log('📦 Indexing projects...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, description, location, materials, technical_details, subtitle, date')
      .eq('published', true);

    console.log(`   Found ${projects?.length || 0} projects`, projectsError ? `Error: ${projectsError.message}` : '');

    if (projects) {
      for (const project of projects) {
        const text = `
          Projet: ${project.title}
          ${project.subtitle ? `Sous-titre: ${project.subtitle}` : ''}
          Description: ${project.description || ''}
          Localisation: ${project.location || ''}
          Date: ${project.date || ''}
          Matériaux: ${project.materials?.join(', ') || ''}
          Détails techniques: ${project.technical_details?.join('. ') || ''}
        `.trim();

        await indexContent('project', project.id, text, {
          title: project.title,
          location: project.location,
          date: project.date,
        }, apiKey);

        stats.projects++;
      }
    }

    // 3. Indexer les FAQ
    console.log('❓ Indexing FAQ...');
    const { data: faqQuestions, error: faqError } = await supabase
      .from('faq_questions')
      .select(`
        id,
        question,
        answer,
        published,
        faq_categories (
          title
        )
      `)
      .eq('published', true)
      .is('deleted_at', null);

    console.log(`   Found ${faqQuestions?.length || 0} FAQ questions`, faqError ? `Error: ${faqError.message}` : '');

    if (faqQuestions) {
      for (const faq of faqQuestions) {
        const categoryTitle = (faq as any).faq_categories?.title || '';
        const text = `
          Question: ${faq.question}
          Réponse: ${faq.answer}
          Catégorie: ${categoryTitle}
        `.trim();

        await indexContent('faq', faq.id, text, {
          question: faq.question,
          category: categoryTitle,
        }, apiKey);

        stats.faq++;
      }
    }

    // 4. Indexer le lexique
    console.log('📖 Indexing lexique...');
    const { data: lexiqueTerms, error: lexiqueError } = await supabase
      .from('lexique_terms')
      .select('id, term, definition, letter')
      .eq('published', true)
      .is('deleted_at', null);

    console.log(`   Found ${lexiqueTerms?.length || 0} lexique terms`, lexiqueError ? `Error: ${lexiqueError.message}` : '');

    if (lexiqueTerms) {
      for (const item of lexiqueTerms) {
        const text = `
          Terme: ${item.term}
          Définition: ${item.definition}
        `.trim();

        await indexContent('lexique', item.id, text, {
          term: item.term,
          letter: item.letter,
        }, apiKey);

        stats.lexique++;
      }
    }

    // 5. Indexer les certifications
    console.log('🏆 Indexing certifications...');
    const { data: certifications, error: certificationsError } = await supabase
      .from('certifications')
      .select('id, name, description, category, benefits')
      .eq('published', true);

    console.log(`   Found ${certifications?.length || 0} certifications`, certificationsError ? `Error: ${certificationsError.message}` : '');

    if (certifications) {
      for (const cert of certifications) {
        const text = `
          Certification: ${cert.name}
          Description: ${cert.description || ''}
          Catégorie: ${cert.category || ''}
          Bénéfices: ${cert.benefits?.join(', ') || ''}
        `.trim();

        await indexContent('certification', cert.id, text, {
          name: cert.name,
          category: cert.category,
        }, apiKey);

        stats.certifications++;
      }
    }

    // 6. Indexer les services/prestations (données statiques détaillées)
    console.log('🔧 Indexing services...');
    const services = [
      {
        id: 'couverture',
        title: 'Couverture',
        description: `Installation et rénovation de toitures professionnelles.
          Nous travaillons avec tous types de matériaux : tuiles mécaniques grand moule, tuiles plates traditionnelles, ardoises naturelles, zinc sur tasseaux, bac acier et toitures métalliques.
          Nos prestations incluent la dépose de l'ancienne couverture, la pose de liteaux ou voliges, la mise en place de l'écran sous-toiture, et la couverture complète selon les DTU en vigueur.
          Nous intervenons sur tous types de chantiers : maisons individuelles, immeubles collectifs, bâtiments professionnels, monuments historiques.
          Zone d'intervention : Strasbourg, Bas-Rhin et agglomération.`,
      },
      {
        id: 'zinguerie',
        title: 'Zinguerie',
        description: `Travaux de zinguerie professionnels pour l'évacuation des eaux pluviales et l'étanchéité des ouvrages.
          Nous réalisons : gouttières pendantes et chéneaux, descentes pluviales, noues et arêtiers, solins et bandes de rive, costières et relevés d'étanchéité.
          Matériaux utilisés : zinc naturel, cuivre, aluminium laqué, acier galvanisé.
          Façonnage sur-mesure en atelier pour s'adapter parfaitement à votre toiture.
          Respect des règles de l'art et des DTU pour une installation durable et esthétique.`,
      },
      {
        id: 'isolation',
        title: 'Isolation thermique et phonique',
        description: `Isolation de toiture pour améliorer les performances énergétiques et le confort acoustique de votre habitat.
          Matériaux biosourcés privilégiés : laine de bois rigide ou semi-rigide, fibre de chanvre, ouate de cellulose soufflée, laine de mouton.
          Techniques : isolation par l'intérieur (sarking), isolation entre chevrons, isolation de combles perdus par soufflage.
          Nous respectons les normes RT2012/RE2020 pour bénéficier des aides à la rénovation énergétique.
          Amélioration significative du DPE et réduction des factures de chauffage.`,
      },
      {
        id: 'etancheite',
        title: 'Étanchéité toiture terrasse',
        description: `Étanchéité de toitures plates et terrasses accessibles ou non.
          Systèmes mis en œuvre : résine Triflex liquide (garantie 20 ans), membrane EPDM soudée, membrane bitumineuse armée, bac acier étanche avec joints debout.
          Nous gérons la préparation du support, l'isolation thermique, la membrane d'étanchéité, les relevés et les évacuations.
          Interventions en neuf ou en rénovation, pour tous types de bâtiments : maisons contemporaines, immeubles, locaux commerciaux.
          Garantie décennale sur tous nos travaux d'étanchéité.`,
      },
      {
        id: 'velux',
        title: 'Fenêtres de toit et verrières',
        description: `Installation et remplacement de fenêtres de toit pour apporter lumière naturelle et ventilation dans vos combles.
          Produits proposés : fenêtres Velux à rotation ou projection, lucarnes traditionnelles ou modernes, verrières modulaires fixes ou ouvrantes, conduits de lumière naturelle Suntubes.
          Nous assurons la découpe de toiture, le raccordement d'étanchéité, la pose de bavettes et collerettes, l'habillage intérieur.
          Options disponibles : volets roulants solaires ou électriques, stores occultants, moustiquaires.
          Amélioration du confort et de la valeur de votre bien immobilier.`,
      },
    ];

    for (const service of services) {
      await indexContent('service', service.id, `${service.title}: ${service.description}`, {
        title: service.title,
      }, apiKey);

      stats.services++;
    }

    // 7. Indexer les informations générales de l'entreprise
    console.log('🏢 Indexing company information...');
    try {
      const { data: generalData, error: generalError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'general')
        .single();

      const { data: seoData, error: seoError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'seo')
        .single();

      if (!generalError && generalData) {
        const general = generalData.value as any;
        const seo = seoData?.value as any;

        // Enrichir le texte avec des variations de questions pour améliorer le matching sémantique
        const companyInfo = `
          Entreprise: ${seo?.company_name || 'FormDeToit'}
          Zone d'intervention: ${seo?.service_area || 'Strasbourg et agglomération'}

          Coordonnées de contact:
          Téléphone: ${general.phone || ''}
          Quel est le numéro de téléphone ? Comment nous appeler ? Téléphone de FormDeToit: ${general.phone || ''}

          Email: ${general.email || ''}
          Quelle est l'adresse email ? Comment nous contacter par email ? Email de contact: ${general.email || ''}

          Adresse: ${general.address || ''}
          Où sommes-nous situés ? Quelle est notre adresse ? Où se trouve FormDeToit ? Adresse complète: ${general.address || ''}

          Horaires d'ouverture: ${general.hours || ''}
          Quels sont nos horaires ? Quand sommes-nous ouverts ? Horaires de FormDeToit ?
          Horaires détaillés: ${general.hours || ''}
        `.trim();

        await indexContent('company-info', 'general', companyInfo, {
          type: 'general',
        }, apiKey);

        stats.company_info = 1;
        console.log('   ✅ Company information indexed');
      }
    } catch (error) {
      console.log('   ⚠️  Company information indexing skipped (table not found)');
    }

    stats.total = stats.projects + stats.faq + stats.lexique + stats.certifications + stats.services + stats.company_info;

    console.log('✅ Reindexation complete!', stats);

    return {
      success: true,
      message: `Indexation réussie : ${stats.total} éléments indexés`,
      stats,
    };

  } catch (error: any) {
    console.error('❌ Error in reindexAllContent:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'indexation',
      error: error.message,
    };
  }
}
