'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Page, updatePageSEO, PageSEOData } from '@/app/actions/pages';
import { validateSEO } from '@/lib/page-seo';
import { FileText, Search, Edit, Check, AlertTriangle, X, ExternalLink, ChevronRight, ChevronDown } from 'lucide-react';

interface Props {
  initialPages: Page[];
  stats: {
    total: number;
    withTitle: number;
    withDescription: number;
    withOG: number;
    optimized: number;
    deleted: number;
  };
}

interface PageTreeNode {
  page: Page;
  children: PageTreeNode[];
}

export default function AdminPagesClient({ initialPages, stats }: Props) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/nos-prestations', '/nos-realisations']));

  // Build tree structure
  const buildTree = (parentPath: string | null): PageTreeNode[] => {
    return pages
      .filter((page) => page.parent_path === parentPath)
      .sort((a, b) => a.display_order - b.display_order)
      .map((page) => ({
        page,
        children: buildTree(page.path),
      }));
  };

  const pageTree = buildTree(null);

  // Filter pages
  const filteredTree = searchQuery
    ? pages.filter(
        (page) =>
          page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setIsModalOpen(true);
  };

  const handleSave = async (seoData: PageSEOData) => {
    if (!editingPage) return;

    setIsSaving(true);
    const result = await updatePageSEO(editingPage.path, seoData);

    if (result.success) {
      setIsModalOpen(false);
      setEditingPage(null);
      router.refresh();
    } else {
      alert(`Erreur: ${result.error}`);
    }
    setIsSaving(false);
  };

  const renderTreeNode = (node: PageTreeNode, level: number = 0) => {
    const { page, children } = node;
    const seoValidation = validateSEO(page);
    const hasChildren = children.length > 0;
    const isExpanded = expandedPaths.has(page.path);

    return (
      <div key={page.path}>
        <div
          className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${
            level > 0 ? 'pl-' + (4 + level * 8) : ''
          }`}
          style={{ paddingLeft: `${16 + level * 32}px` }}
        >
          {/* Expand/collapse */}
          {hasChildren ? (
            <button onClick={() => toggleExpand(page.path)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Path */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-mono text-sm text-gray-700 truncate">{page.path}</span>
              {page.is_dynamic && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Dynamic</span>
              )}
            </div>
          </div>

          {/* SEO Score */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {seoValidation.isComplete ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              )}
              <span className={`text-sm font-medium ${
                seoValidation.score >= 75 ? 'text-green-600' : seoValidation.score >= 50 ? 'text-orange-500' : 'text-red-600'
              }`}>
                {seoValidation.score}%
              </span>
            </div>

            {/* Title preview */}
            <div className="hidden lg:block text-sm text-gray-600 truncate max-w-xs">
              {page.title || <span className="text-gray-400 italic">Sans titre</span>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a
                href={page.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600"
                title="Voir la page"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleEdit(page)}
                className="text-blue-600 hover:text-blue-900 cursor-pointer"
                title="Modifier SEO"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded && children.map((child) => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages & SEO</h1>
        <p className="text-gray-600">Gérez le référencement de toutes les pages du site</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total pages</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Avec titre</p>
          <p className="text-2xl font-bold text-blue-600">{stats.withTitle}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Avec description</p>
          <p className="text-2xl font-bold text-purple-600">{stats.withDescription}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Avec Open Graph</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.withOG}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">SEO complet</p>
          <p className="text-2xl font-bold text-green-600">{stats.optimized}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pages list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {searchQuery ? (
          // Flat list when searching
          <div>
            {filteredTree && filteredTree.length > 0 ? (
              filteredTree.map((page) => (
                <div key={page.path} className="border-b border-gray-100">
                  {renderTreeNode({ page, children: [] }, 0)}
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">Aucune page trouvée</div>
            )}
          </div>
        ) : (
          // Tree view
          <div>{pageTree.map((node) => renderTreeNode(node))}</div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingPage && (
        <SEOEditModal
          page={editingPage}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPage(null);
          }}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

// SEO Edit Modal Component
function SEOEditModal({
  page,
  onSave,
  onClose,
  isSaving,
}: {
  page: Page;
  onSave: (data: PageSEOData) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<PageSEOData>({
    title: page.title || '',
    description: page.description || '',
    keywords: page.keywords || '',
    og_title: page.og_title || '',
    og_description: page.og_description || '',
    og_image: page.og_image || '',
    canonical_url: page.canonical_url || '',
    robots: page.robots || 'index, follow',
  });

  const validation = validateSEO(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Modifier le SEO</h2>
            <p className="text-sm text-gray-600 font-mono mt-1">{page.path}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} id="seo-form" className="space-y-6">
            {/* Basic SEO */}
            <div>
              <h3 className="text-lg font-semibold mb-4">SEO Basique</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre ({formData.title?.length || 0} caractères)
                    {formData.title && (formData.title.length < 30 || formData.title.length > 60) && (
                      <span className="text-orange-600 ml-2">⚠️ Recommandé: 30-60</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre de la page pour Google"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description ({formData.description?.length || 0} caractères)
                    {formData.description && (formData.description.length < 120 || formData.description.length > 160) && (
                      <span className="text-orange-600 ml-2">⚠️ Recommandé: 120-160</span>
                    )}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Description de la page pour Google"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mots-clés (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="couverture, toiture, ardoise, strasbourg"
                  />
                </div>
              </div>
            </div>

            {/* Open Graph */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Open Graph (Réseaux sociaux)</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Titre</label>
                  <input
                    type="text"
                    value={formData.og_title}
                    onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre pour partage Facebook/LinkedIn (laisser vide = utilise le titre)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                  <textarea
                    value={formData.og_description}
                    onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Description pour partage social (laisser vide = utilise la description)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                  <input
                    type="text"
                    value={formData.og_image}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="/images/og-image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Advanced */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Avancé</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Canonique</label>
                  <input
                    type="text"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://formdetoit.fr/page (optionnel)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Robots</label>
                  <select
                    value={formData.robots}
                    onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="index, follow">Index, Follow (par défaut)</option>
                    <option value="index, nofollow">Index, NoFollow</option>
                    <option value="noindex, follow">NoIndex, Follow</option>
                    <option value="noindex, nofollow">NoIndex, NoFollow</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview SERP */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Aperçu Google</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">formdetoit.fr › {page.path}</div>
                <div className="text-xl text-blue-600 mb-1 line-clamp-1">{formData.title || 'Titre de la page'}</div>
                <div className="text-sm text-gray-600 line-clamp-2">{formData.description || 'Description de la page...'}</div>
              </div>
            </div>

            {/* SEO Score */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Score SEO</h3>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${
                    validation.score >= 75 ? 'text-green-600' : validation.score >= 50 ? 'text-orange-500' : 'text-red-600'
                  }`}>
                    {validation.score}%
                  </div>
                </div>
              </div>
              {validation.warnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {validation.warnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-orange-600 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="seo-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer"
            disabled={isSaving}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
