'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getEmbeddingsStats, reindexAllContent, type EmbeddingsStats, type ReindexStatus } from '@/app/actions/embeddings';

export default function RAGManagement() {
  const [stats, setStats] = useState<EmbeddingsStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexStatus, setReindexStatus] = useState<ReindexStatus | null>(null);

  // Charger les statistiques au montage
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getEmbeddingsStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReindex = async () => {
    if (isReindexing) return;

    const confirmed = confirm(
      'Voulez-vous réindexer tout le contenu du site ?\n\n' +
      'Cette opération va :\n' +
      '- Supprimer tous les embeddings existants\n' +
      '- Générer de nouveaux embeddings pour tout le contenu\n' +
      '- Prendre environ 30-60 secondes\n' +
      '- Coûter ~$0.01 (OpenAI embeddings)\n\n' +
      'Le chatbot sera temporairement sans contexte pendant l\'indexation.'
    );

    if (!confirmed) return;

    setIsReindexing(true);
    setReindexStatus(null);

    try {
      const result = await reindexAllContent();
      setReindexStatus(result);

      if (result.success) {
        // Recharger les stats après succès
        await loadStats();
      }
    } catch (error) {
      console.error('Error reindexing:', error);
      setReindexStatus({
        success: false,
        message: 'Erreur lors de la réindexation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsReindexing(false);
    }
  };

  // Calculer le total d'éléments indexés
  const totalIndexed = stats.reduce((sum, item) => sum + Number(item.count), 0);

  // Dernière mise à jour
  const lastUpdated = stats.length > 0
    ? new Date(Math.max(...stats.map(s => new Date(s.last_updated).getTime()))).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Jamais';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-yellow" />
            RAG - Recherche Sémantique
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Le chatbot AI cherche automatiquement dans votre contenu pour des réponses précises et contextuelles.
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-600 font-medium">Éléments indexés</p>
            <p className="text-2xl font-bold text-gray-900">{totalIndexed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Dernière indexation</p>
            <p className="text-sm font-semibold text-gray-900">{lastUpdated}</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-xs text-gray-600 font-medium">Status</p>
            <div className="flex items-center gap-1 mt-1">
              {totalIndexed > 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Actif</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-700">Non indexé</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Détails par type */}
        {!isLoading && stats.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-600 font-medium mb-2">Détails par type</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {stats.map((stat) => (
                <div key={stat.content_type} className="bg-white rounded px-3 py-2 border border-gray-200">
                  <p className="text-xs text-gray-600 capitalize">{stat.content_type}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-600">Chargement...</span>
          </div>
        )}
      </div>

      {/* Bouton de réindexation */}
      <div>
        <button
          onClick={handleReindex}
          disabled={isReindexing}
          className="flex items-center gap-2 px-4 py-2 bg-yellow text-black rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isReindexing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Réindexation en cours...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {totalIndexed > 0 ? 'Réindexer le contenu' : 'Indexer le contenu'}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          💡 Cliquez après avoir modifié des projets, FAQ, ou autres contenus pour que le chatbot connaisse les mises à jour.
        </p>
      </div>

      {/* Message de statut */}
      {reindexStatus && (
        <div
          className={`p-4 rounded-lg border ${
            reindexStatus.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {reindexStatus.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  reindexStatus.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {reindexStatus.message}
              </p>

              {reindexStatus.success && reindexStatus.stats && (
                <div className="mt-2 text-sm text-green-800 space-y-1">
                  <p>✅ {reindexStatus.stats.projects} projets</p>
                  <p>✅ {reindexStatus.stats.faq} questions FAQ</p>
                  <p>✅ {reindexStatus.stats.lexique} termes de lexique</p>
                  <p>✅ {reindexStatus.stats.certifications} certifications</p>
                  <p>✅ {reindexStatus.stats.services} services</p>
                  {reindexStatus.stats.company_info > 0 && (
                    <p>✅ {reindexStatus.stats.company_info} infos générales</p>
                  )}
                  <p className="font-semibold mt-2">
                    🎉 Total : {reindexStatus.stats.total} éléments indexés
                  </p>
                </div>
              )}

              {!reindexStatus.success && reindexStatus.error && (
                <p className="mt-1 text-sm text-red-700">{reindexStatus.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">📚 Comment ça marche ?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Le chatbot cherche dans votre contenu avant de répondre</li>
          <li>• Il utilise vos vrais projets, FAQ, et autres données</li>
          <li>• Les réponses sont personnalisées et factuelles</li>
          <li>• Réindexez après chaque modification importante</li>
        </ul>
      </div>
    </div>
  );
}
