'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Popup, toggleActive, deletePopup, restorePopup, permanentlyDeletePopup } from '@/app/actions/popups';
import { useBulkSelect } from '@/hooks/useBulkSelect';
import BulkActionsBar, { BulkSelectCheckbox, DeletedBadge } from './BulkActionsBar';
import PopupModal from './PopupModal';
import {
  Plus,
  Edit,
  Trash2,
  Archive,
  Megaphone,
  Eye,
  MousePointerClick,
  X as XIcon,
  Clock,
  MousePointer,
  LogOut,
  Scroll,
  Search,
} from 'lucide-react';

interface Props {
  initialPopups: Popup[];
}

export default function AdminPopupsClient({ initialPopups }: Props) {
  const router = useRouter();
  const [popups, setPopups] = useState(initialPopups);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrage par suppression
  let filteredPopups = showDeleted
    ? popups
    : popups.filter((p) => !p.deleted_at);

  // Filtrage par recherche
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredPopups = filteredPopups.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.internal_name.toLowerCase().includes(query) ||
        p.heading?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }

  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleSelect,
    toggleSelectAll,
    deselectAll,
    deleteSelected,
    restoreSelected,
  } = useBulkSelect({
    items: filteredPopups,
    idField: 'id',
    onDelete: async (ids: string[]) => {
      const action = showDeleted ? 'permanent' : 'delete';
      const response = await fetch('/api/admin/soft-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'popups',
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
              table: 'popups',
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

  const handleToggleActive = async (id: string) => {
    // Optimistic UI update
    setPopups(prevPopups =>
      prevPopups.map(p =>
        p.id === id ? { ...p, is_active: !p.is_active } : p
      )
    );

    const result = await toggleActive(id);
    if (!result.success) {
      // Rollback on error
      setPopups(prevPopups =>
        prevPopups.map(p =>
          p.id === id ? { ...p, is_active: !p.is_active } : p
        )
      );
      alert(result.error || 'Erreur lors de la mise à jour');
    }
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce popup ?')) {
      const result = await deletePopup(id);
      if (result.success) {
        router.refresh();
      }
    }
  };

  const handleEdit = (popup: Popup) => {
    setEditingPopup(popup);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPopup(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPopup(null);
  };

  // Statistics
  const stats = {
    total: popups.filter((p) => !p.deleted_at).length,
    active: popups.filter((p) => p.is_active && !p.deleted_at).length,
    inactive: popups.filter((p) => !p.is_active && !p.deleted_at).length,
    deleted: popups.filter((p) => p.deleted_at).length,
  };

  // Trigger type labels
  const triggerLabels = {
    on_load: 'Au chargement',
    on_exit: 'À la sortie',
    on_scroll: 'Au scroll',
    timed: 'Temporisé',
  };

  // Trigger icons
  const triggerIcons = {
    on_load: <Clock className="w-3 h-3" />,
    on_exit: <LogOut className="w-3 h-3" />,
    on_scroll: <Scroll className="w-3 h-3" />,
    timed: <Clock className="w-3 h-3" />,
  };

  // Position labels
  const positionLabels = {
    center: 'Centre',
    'top-left': 'Haut gauche',
    'top-right': 'Haut droit',
    'bottom-left': 'Bas gauche',
    'bottom-right': 'Bas droit',
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Popups</h1>
          <p className="text-sm text-gray-600 mt-1">
            Créez et gérez les popups affichés sur le site
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Archive className="w-4 h-4" />
            {showDeleted ? 'Masquer corbeille' : 'Voir corbeille'}
            {stats.deleted > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                {stats.deleted}
              </span>
            )}
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-yellow text-black rounded-md hover:bg-yellow-600 font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouveau popup
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactifs</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Corbeille</p>
              <p className="text-2xl font-bold text-red-600">{stats.deleted}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Archive className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un popup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <BulkSelectCheckbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom interne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistiques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPopups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery
                      ? 'Aucun popup trouvé pour cette recherche'
                      : showDeleted
                      ? 'Aucun popup supprimé'
                      : 'Aucun popup créé'}
                  </td>
                </tr>
              ) : (
                filteredPopups.map((popup) => (
                  <tr
                    key={popup.id}
                    className={popup.deleted_at ? 'bg-red-50' : ''}
                  >
                    <td className="px-6 py-4">
                      <BulkSelectCheckbox
                        checked={isSelected(popup.id)}
                        onChange={() => toggleSelect(popup.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {popup.image_url && (
                          <img
                            src={popup.image_url}
                            alt={popup.title}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <span>{popup.title}</span>
                      </div>
                      {popup.deleted_at && <DeletedBadge deletedAt={popup.deleted_at} />}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {popup.internal_name}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {positionLabels[popup.position]}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {triggerIcons[popup.trigger_type]}
                        {triggerLabels[popup.trigger_type]}
                        {popup.trigger_type === 'on_scroll' && ` (${popup.scroll_percentage}%)`}
                        {(popup.trigger_type === 'on_load' || popup.trigger_type === 'timed') &&
                          popup.trigger_delay > 0 &&
                          ` (${popup.trigger_delay}s)`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1" title="Vues">
                          <Eye className="w-3 h-3" />
                          {popup.view_count}
                        </span>
                        <span className="flex items-center gap-1" title="Clics">
                          <MousePointerClick className="w-3 h-3" />
                          {popup.click_count}
                        </span>
                        <span className="flex items-center gap-1" title="Fermetures">
                          <XIcon className="w-3 h-3" />
                          {popup.close_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(popup.id)}
                        disabled={!!popup.deleted_at}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          popup.is_active
                            ? 'bg-yellow text-black hover:bg-yellow-600'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } ${popup.deleted_at ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                      >
                        {popup.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(popup)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!popup.deleted_at && (
                          <button
                            onClick={() => handleDelete(popup.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk actions bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onDelete={deleteSelected}
        onRestore={restoreSelected}
        showRestore={showDeleted}
        onClearSelection={deselectAll}
      />

      {/* Modal */}
      {isModalOpen && (
        <PopupModal
          popup={editingPopup}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
