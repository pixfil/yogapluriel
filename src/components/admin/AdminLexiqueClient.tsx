'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LexiqueTerm, togglePublished } from '@/app/actions/lexique';
import { useBulkSelect } from '@/hooks/useBulkSelect';
import BulkActionsBar, { BulkSelectCheckbox, DeletedBadge } from './BulkActionsBar';
import { Archive, Plus, Edit, BookOpen, Search, Trash2, X } from 'lucide-react';

interface Props {
  initialTerms: LexiqueTerm[];
}

export default function AdminLexiqueClient({ initialTerms }: Props) {
  const router = useRouter();
  const [terms, setTerms] = useState(initialTerms);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLetter, setFilterLetter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<LexiqueTerm | null>(null);
  const [formData, setFormData] = useState({ term: '', definition: '', published: true });

  const filteredTerms = terms.filter((term) => {
    // Filter deleted
    if (!showDeleted && term.deleted_at) return false;
    if (showDeleted && !term.deleted_at) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query)
      );
    }

    // Filter by letter
    if (filterLetter) {
      return term.letter === filterLetter;
    }

    return true;
  });

  // Group by letter
  const groupedTerms = filteredTerms.reduce((acc, term) => {
    if (!acc[term.letter]) {
      acc[term.letter] = [];
    }
    acc[term.letter].push(term);
    return acc;
  }, {} as Record<string, LexiqueTerm[]>);

  const letters = Object.keys(groupedTerms).sort();

  const bulkSelect = useBulkSelect({
    items: filteredTerms,
    idField: 'id',
    onDelete: async (ids: string[]) => {
      const action = showDeleted ? 'permanent' : 'delete';
      const response = await fetch('/api/admin/soft-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'lexique_terms',
          ids,
          action,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    },
    onRestore: showDeleted
      ? async (ids: string[]) => {
          const response = await fetch('/api/admin/soft-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              table: 'lexique_terms',
              ids,
              action: 'restore',
            }),
          });

          if (response.ok) {
            router.refresh();
          }
        }
      : undefined,
  });

  const handleTogglePublished = async (id: string) => {
    await togglePublished(id);
    router.refresh();
  };

  const activeCount = terms.filter((t) => !t.deleted_at).length;
  const publishedCount = terms.filter((t) => !t.deleted_at && t.published).length;
  const deletedCount = terms.filter((t) => t.deleted_at).length;

  // Get all unique letters from all terms (including deleted)
  const allLetters = [...new Set(terms.map((t) => t.letter))].sort();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lexique Technique</h1>
          <p className="text-gray-600">
            Gérez les termes techniques affichés sur /lexique
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`inline-flex items-center px-4 py-2 font-semibold rounded-lg transition-colors cursor-pointer ${
              showDeleted
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Archive className="w-4 h-4 mr-2" />
            {showDeleted ? 'Masquer la corbeille' : 'Voir la corbeille'}
          </button>
          <button
            onClick={() => {
              setEditingTerm(null);
              setFormData({ term: '', definition: '', published: true });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau terme
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total actifs</p>
          <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Publiés</p>
          <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Brouillons</p>
          <p className="text-2xl font-bold text-gray-600">{activeCount - publishedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Supprimés</p>
          <p className="text-2xl font-bold text-red-600">{deletedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un terme ou une définition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
          />
        </div>

        {/* Letter filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterLetter(null)}
            className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer ${
              filterLetter === null
                ? 'bg-yellow text-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes
          </button>
          {allLetters.map((letter) => (
            <button
              key={letter}
              onClick={() => setFilterLetter(letter)}
              className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer ${
                filterLetter === letter
                  ? 'bg-yellow text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Terms list grouped by letter */}
      <div className="space-y-6">
        {letters.map((letter) => (
          <div key={letter} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Letter header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{letter}</h2>
                <span className="text-sm text-gray-600">
                  {groupedTerms[letter].length} terme{groupedTerms[letter].length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Terms table */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 w-12">
                    {/* Checkbox column - we could add select all per letter later */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Terme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Définition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupedTerms[letter].map((term) => (
                  <tr
                    key={term.id}
                    className={term.deleted_at ? 'bg-red-50' : ''}
                  >
                    <td className="px-6 py-4">
                      <BulkSelectCheckbox
                        checked={bulkSelect.isSelected(term.id)}
                        onChange={() => bulkSelect.toggleSelect(term.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{term.term}</span>
                      </div>
                      {term.deleted_at && <DeletedBadge deletedAt={term.deleted_at} />}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 line-clamp-2">{term.definition}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublished(term.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                          term.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {term.published ? 'Publié' : 'Brouillon'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTerm(term);
                            setFormData({
                              term: term.term,
                              definition: term.definition,
                              published: term.published
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!term.deleted_at && (
                          <button
                            onClick={async () => {
                              if (confirm('Voulez-vous vraiment supprimer ce terme ?')) {
                                await fetch('/api/admin/soft-delete', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    table: 'lexique_terms',
                                    ids: [term.id],
                                    action: 'delete'
                                  })
                                });
                                router.refresh();
                              }
                            }}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {letters.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            {searchQuery || filterLetter
              ? 'Aucun terme trouvé pour cette recherche'
              : showDeleted
              ? 'Aucun terme supprimé'
              : 'Aucun terme dans le lexique'}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={bulkSelect.selectedCount}
        onDelete={bulkSelect.deleteSelected}
        onRestore={showDeleted ? bulkSelect.restoreSelected : undefined}
        onDeselectAll={bulkSelect.deselectAll}
        isLoading={bulkSelect.isLoading}
        showRestore={showDeleted}
      />

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTerm ? 'Modifier le terme' : 'Nouveau terme'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();

              const url = editingTerm
                ? `/api/admin/lexique/${editingTerm.id}`
                : '/api/admin/lexique';

              const method = editingTerm ? 'PUT' : 'POST';

              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
              });

              if (response.ok) {
                setIsModalOpen(false);
                router.refresh();
              } else {
                alert(`Erreur lors de ${editingTerm ? 'la mise à jour' : 'la création'}`);
              }
            }}>
              {/* Terme */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terme <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Définition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Définition <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.definition}
                    onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Publié */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-gray-700">
                    Publier immédiatement
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
