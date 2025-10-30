'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Certification,
  togglePublished,
  updateDisplayOrder,
} from '@/app/actions/certifications';
import { useBulkSelect } from '@/hooks/useBulkSelect';
import BulkActionsBar, { BulkSelectCheckbox, DeletedBadge } from './BulkActionsBar';
import CertificationModal from './CertificationModal';
import { Archive, Plus, Edit, Eye, Shield, Award, Star, MapPin, Users, GripVertical, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  initialCertifications: Certification[];
}

function SortableRow({ certification, isSelected, onToggleSelect, onTogglePublished, onEdit, onDelete }: {
  certification: Certification;
  isSelected: boolean;
  onToggleSelect: () => void;
  onTogglePublished: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: certification.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryIcons = {
    quality: <Award className="w-4 h-4" />,
    expertise: <Star className="w-4 h-4" />,
    territorial: <MapPin className="w-4 h-4" />,
    network: <Users className="w-4 h-4" />,
  };

  const categoryLabels = {
    quality: 'Qualité',
    expertise: 'Expertise',
    territorial: 'Territorial',
    network: 'Réseau',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={certification.deleted_at ? 'bg-red-50' : ''}
    >
      <td className="px-6 py-4 cursor-move" {...attributes} {...listeners}>
        <GripVertical className="w-5 h-5 text-gray-400" />
      </td>
      <td className="px-6 py-4">
        <BulkSelectCheckbox
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <td className="px-6 py-4">
        {certification.logo_url ? (
          <img
            src={certification.logo_url}
            alt={certification.name}
            className="w-12 h-12 object-contain"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
            <Shield className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </td>
      <td className="px-6 py-4 font-medium text-gray-900">
        {certification.name}
        {certification.deleted_at && <DeletedBadge deletedAt={certification.deleted_at} />}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${certification.category_color}`}>
          {categoryIcons[certification.category]}
          {categoryLabels[certification.category]}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
        {certification.description}
      </td>
      <td className="px-6 py-4 text-center">
        {certification.benefits.length}
      </td>
      <td className="px-6 py-4">
        <button
          onClick={onTogglePublished}
          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
            certification.published
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {certification.published ? 'Publié' : 'Brouillon'}
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-900 cursor-pointer"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          {!certification.deleted_at && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-900 cursor-pointer"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminCertificationsClient({ initialCertifications }: Props) {
  const router = useRouter();
  const [certifications, setCertifications] = useState(initialCertifications);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);

  const filteredCertifications = showDeleted
    ? certifications
    : certifications.filter((c) => !c.deleted_at);

  const bulkSelect = useBulkSelect({
    items: filteredCertifications,
    idField: 'id',
    onDelete: async (ids: string[]) => {
      const action = showDeleted ? 'permanent' : 'delete';
      const response = await fetch('/api/admin/soft-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'certifications',
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
              table: 'certifications',
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = filteredCertifications.findIndex((c) => c.id === active.id);
    const newIndex = filteredCertifications.findIndex((c) => c.id === over.id);

    const newOrder = arrayMove(filteredCertifications, oldIndex, newIndex);

    // Update local state immediately for smooth UX
    setCertifications(newOrder);

    // Update display_order in database
    const updates = newOrder.map((cert, index) => ({
      id: cert.id,
      display_order: index + 1,
    }));

    await updateDisplayOrder(updates);
    router.refresh();
  };

  const handleTogglePublished = async (id: string) => {
    await togglePublished(id);
    router.refresh();
  };

  const handleEdit = (certification: Certification) => {
    setEditingCertification(certification);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCertification(null);
    setIsModalOpen(true);
  };

  const activeCount = certifications.filter((c) => !c.deleted_at).length;
  const publishedCount = certifications.filter((c) => !c.deleted_at && c.published).length;
  const deletedCount = certifications.filter((c) => c.deleted_at).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certifications & Labels</h1>
          <p className="text-gray-600">
            Gérez les certifications affichées sur /nos-labels-certifications
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
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle certification
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 w-12"></th>
                <th className="px-6 py-3 w-12">
                  <BulkSelectCheckbox
                    checked={bulkSelect.isAllSelected}
                    indeterminate={bulkSelect.isSomeSelected}
                    onChange={bulkSelect.toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avantages
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
              <SortableContext
                items={filteredCertifications.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredCertifications.map((certification) => (
                  <SortableRow
                    key={certification.id}
                    certification={certification}
                    isSelected={bulkSelect.isSelected(certification.id)}
                    onToggleSelect={() => bulkSelect.toggleSelect(certification.id)}
                    onTogglePublished={() => handleTogglePublished(certification.id)}
                    onEdit={() => handleEdit(certification)}
                    onDelete={async () => {
                      if (confirm('Voulez-vous vraiment supprimer cette certification ?')) {
                        await fetch('/api/admin/soft-delete', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            table: 'certifications',
                            ids: [certification.id],
                            action: 'delete'
                          })
                        });
                        router.refresh();
                      }
                    }}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>

          {filteredCertifications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {showDeleted ? 'Aucune certification supprimée' : 'Aucune certification'}
            </div>
          )}
        </DndContext>
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

      {/* Modal Create/Edit */}
      <CertificationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCertification(null);
        }}
        certification={editingCertification}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
