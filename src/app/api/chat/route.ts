import { streamText, convertToModelMessages } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { getAdminClient } from '@/lib/supabase-server';
import { searchEmbeddings } from '@/app/actions/embeddings';
import { chatbotLimiter, getClientIP, createRateLimitResponse } from '@/lib/rate-limit';

// Configuration de la route
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * API Route pour le chatbot AI avec streaming
 * POST /api/chat
 * Body: { messages: ChatMessage[] }
 */
export async function POST(req: Request) {
  try {
    // ✅ ÉTAPE 1: Rate Limiting (protection abus chatbot)
    const ip = getClientIP(req);

    if (chatbotLimiter) {
      const { success, reset } = await chatbotLimiter.limit(ip);

      if (!success) {
        return createRateLimitResponse(
          reset,
          "Trop de messages envoyés. Vous pouvez envoyer maximum 20 messages par minute."
        );
      }
    }

    const body = await req.json();
    console.log('Received body:', JSON.stringify(body, null, 2));
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { status: 400 });
    }

    // 1. Récupérer la configuration AI depuis Supabase
    const supabase = getAdminClient();
    const { data: config, error: configError } = await supabase
      .from('ai_chatbot_settings')
      .select('*')
      .single();

    if (configError || !config) {
      console.error('Error fetching AI config:', configError);
      return new Response('AI configuration not found', { status: 500 });
    }

    // Vérifier que le mode AI est activé
    if (config.chatbot_mode !== 'ai') {
      return new Response('AI chatbot mode is not enabled', { status: 400 });
    }

    // 2. Déchiffrer la clé API pour le provider sélectionné
    const encryptionSecret = process.env.ENCRYPTION_SECRET;
    if (!encryptionSecret || encryptionSecret.length < 32) {
      console.error('ENCRYPTION_SECRET not configured properly');
      return new Response('Server configuration error', { status: 500 });
    }

    const apiKey = await getDecryptedApiKey(
      supabase,
      config.ai_provider,
      encryptionSecret
    );

    if (!apiKey) {
      console.error(`No API key found for provider: ${config.ai_provider}`);
      return new Response(
        `API key not configured for ${config.ai_provider}. Please configure it in admin settings.`,
        { status: 500 }
      );
    }

    // 3. Instancier le modèle AI selon le provider
    const model = getModelInstance(config.ai_provider, config.ai_model, apiKey);

    // 4. Construire le prompt système
    let systemPrompt = config.system_prompt || 'Tu es un assistant virtuel pour FormDeToit.';

    // 5. RAG - Rechercher du contexte pertinent si activé
    console.log('[RAG] RAG enabled:', config.rag_enabled);
    if (config.rag_enabled) {
      try {
        // Obtenir le dernier message utilisateur (avant conversion)
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
        console.log('[RAG] Last user message:', lastUserMessage);

        // Extraire le texte du message (support format UI Messages et ancien format)
        let userMessageText = '';
        if (lastUserMessage) {
          if (lastUserMessage.parts && Array.isArray(lastUserMessage.parts)) {
            // Format UI Messages : { parts: [{ type: 'text', text: '...' }] }
            const textPart = lastUserMessage.parts.find((p: any) => p.type === 'text');
            userMessageText = textPart?.text || '';
          } else if (lastUserMessage.content) {
            // Ancien format : { content: '...' }
            userMessageText = lastUserMessage.content;
          }
        }

        console.log('[RAG] Extracted text:', userMessageText);

        if (userMessageText) {
          console.log('[RAG] Searching for:', userMessageText);

          // Rechercher dans les embeddings
          // Threshold à 0.5 pour équilibrer précision et couverture
          // (0.7 était trop strict et ne trouvait pas les infos company-info)
          const searchResults = await searchEmbeddings(userMessageText, {
            threshold: 0.5,
            limit: 5,
          });

          console.log('[RAG] Search results count:', searchResults?.length || 0);

          // Si on a trouvé du contexte pertinent
          if (searchResults && searchResults.length > 0) {
            console.log('[RAG] Results:', searchResults.map(r => ({ type: r.content_type, similarity: r.similarity })));

            const contextTexts = searchResults.map((result) => {
              const metadata = result.metadata || {};
              let header = '';

              // Formater selon le type de contenu
              switch (result.content_type) {
                case 'project':
                  header = `[Projet: ${metadata.title}]`;
                  break;
                case 'faq':
                  header = `[FAQ]`;
                  break;
                case 'lexique':
                  header = `[Lexique: ${metadata.terme}]`;
                  break;
                case 'certification':
                  header = `[Certification: ${metadata.title}]`;
                  break;
                case 'service':
                  header = `[Service: ${metadata.title}]`;
                  break;
                default:
                  header = `[${result.content_type}]`;
              }

              return `${header}\n${result.content_text}`;
            });

            // Ajouter le contexte au prompt système
            systemPrompt += `\n\n=== CONTEXTE PERTINENT ===\nUtilise ces informations pour répondre précisément à la question de l'utilisateur:\n\n${contextTexts.join('\n\n---\n\n')}`;
            console.log('[RAG] Context added to system prompt');
          } else {
            console.log('[RAG] No relevant context found (threshold: 0.7)');
          }
        } else {
          console.log('[RAG] No text extracted from user message');
        }
      } catch (error) {
        console.error('[RAG] Error in RAG search:', error);
        // Continue sans RAG en cas d'erreur
      }
    }

    // 6. Streamer la réponse avec Vercel AI SDK
    const result = streamText({
      model,
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Retourner la réponse au format UI Message Stream
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}

/**
 * Déchiffrer la clé API pour un provider donné
 */
async function getDecryptedApiKey(
  supabase: any,
  provider: string,
  encryptionSecret: string
): Promise<string | null> {
  try {
    // Nom du champ chiffré
    const encryptedField = `${provider}_api_key_encrypted`;

    // Récupérer la clé chiffrée
    const { data, error } = await supabase
      .from('ai_chatbot_settings')
      .select(encryptedField)
      .single();

    if (error || !data || !data[encryptedField]) {
      // Si pas de clé en BDD, essayer la clé par défaut depuis env
      const defaultKey = process.env[`DEFAULT_${provider.toUpperCase()}_API_KEY`];
      return defaultKey || null;
    }

    // Déchiffrer la clé
    const { data: decryptedKey, error: decryptError } = await supabase.rpc(
      'decrypt_api_key',
      {
        encrypted_key: data[encryptedField],
        secret: encryptionSecret,
      }
    );

    if (decryptError) {
      console.error('Error decrypting API key:', decryptError);
      // Fallback vers clé par défaut
      return process.env[`DEFAULT_${provider.toUpperCase()}_API_KEY`] || null;
    }

    return decryptedKey || null;
  } catch (error) {
    console.error('Error in getDecryptedApiKey:', error);
    return null;
  }
}

/**
 * Instancier le modèle AI selon le provider
 */
function getModelInstance(provider: string, modelName: string, apiKey: string): any {
  switch (provider) {
    case 'openai':
      const openaiProvider = createOpenAI({ apiKey });
      return openaiProvider(modelName);

    case 'anthropic':
      const anthropicProvider = createAnthropic({ apiKey });
      return anthropicProvider(modelName);

    case 'mistral':
      const mistralProvider = createMistral({ apiKey });
      return mistralProvider(modelName);

    default:
      console.warn(`Unknown provider: ${provider}, defaulting to OpenAI`);
      const defaultProvider = createOpenAI({ apiKey });
      return defaultProvider('gpt-4o');
  }
}
