import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Health Check Endpoint
 *
 * Usage : Monitoring avec UptimeRobot, Pingdom, etc.
 * URL à surveiller : https://formdetoit.fr/api/health
 *
 * Vérifie :
 * - Serveur Next.js actif
 * - Connexion Supabase opérationnelle
 * - Base de données accessible
 *
 * Réponses :
 * - 200 OK : Tout fonctionne
 * - 503 Service Unavailable : Problème détecté
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Test connexion Supabase + BDD
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows (acceptable), autres erreurs = problème
      throw new Error(`Database error: ${error.message}`);
    }

    // 2. Calcul temps de réponse
    const responseTime = Date.now() - startTime;

    // 3. Réponse succès
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        server: 'ok',
        database: 'ok',
      },
      responseTime: `${responseTime}ms`,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    // 4. Réponse erreur
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        server: 'ok',
        database: 'error',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`,
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
