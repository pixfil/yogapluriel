"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  Upload,
  X,
  Archive,
} from "lucide-react";
import { TeamMember } from "@/app/actions/team";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BulkActionsBar from "./BulkActionsBar";
import { useBulkSelect } from "@/hooks/useBulkSelect";

type Props = {
  initialMembers: TeamMember[];
  stats: {
    total: number;
    published: number;
    drafts: number;
    deleted: number;
  };
};

export default function AdminTeamClient({ initialMembers, stats }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    photo_url: "",
    is_published: true,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Bulk selection
  const {
    selectedIds,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    deselectAll: clearSelection,
    isAllSelected: allSelected,
  } = useBulkSelect<TeamMember>({
    items: members,
  });

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Handlers
  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        name: member.name,
        position: member.position,
        bio: member.bio || "",
        photo_url: member.photo_url || "",
        is_published: member.is_published,
      });
      setPhotoPreview(member.photo_url);
      setIsCreating(false);
    } else {
      setSelectedMember(null);
      setFormData({
        name: "",
        position: "",
        bio: "",
        photo_url: "",
        is_published: true,
      });
      setPhotoPreview(null);
      setIsCreating(true);
    }
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let photoUrl = formData.photo_url;

      // Upload photo if new file
      if (photoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", photoFile);

        const uploadRes = await fetch("/api/admin/upload-team-photo", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload photo");

        const { photoUrl: newPhotoUrl } = await uploadRes.json();
        photoUrl = newPhotoUrl;
      }

      const endpoint = isCreating ? "/api/admin/team" : `/api/admin/team/${selectedMember?.id}`;
      const method = isCreating ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photo_url: photoUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save member");

      // Reload members
      window.location.reload();
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string, permanent = false) => {
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permanent }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      window.location.reload();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/team/${id}/restore`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to restore");

      window.location.reload();
    } catch (error) {
      console.error("Error restoring:", error);
      alert("Erreur lors de la restauration");
    }
  };

  const handleTogglePublished = async (id: string, isPublished: boolean) => {
    try {
      const res = await fetch(`/api/admin/team/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !isPublished }),
      });

      if (!res.ok) throw new Error("Failed to toggle");

      setMembers(members.map(m =>
        m.id === id ? { ...m, is_published: !isPublished } : m
      ));
    } catch (error) {
      console.error("Error toggling:", error);
      alert("Erreur lors du changement de statut");
    }
  };

  const handleBulkDelete = async (permanent = false) => {
    try {
      const res = await fetch("/api/admin/team/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, permanent }),
      });

      if (!res.ok) throw new Error("Failed to bulk delete");

      clearSelection();
      window.location.reload();
    } catch (error) {
      console.error("Error bulk deleting:", error);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de l'équipe</h1>
          <p className="text-gray-600 mt-1">
            Gérez les membres de votre équipe
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
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-yellow text-black font-semibold rounded-lg hover:bg-yellow/90 transition-colors cursor-pointer"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Ajouter un membre
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
            </div>
            <Users className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Publiés</div>
              <div className="text-3xl font-bold text-green-600 mt-1">{stats.published}</div>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Brouillons</div>
              <div className="text-3xl font-bold text-orange-600 mt-1">{stats.drafts}</div>
            </div>
            <EyeOff className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Supprimés</div>
              <div className="text-3xl font-bold text-red-600 mt-1">{stats.deleted}</div>
            </div>
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
          />
          <div className="text-sm text-gray-600">
            {filteredMembers.length} membre(s) affiché(s)
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedIds.length}
            onClear={clearSelection}
            actions={[
              {
                label: "Mettre à la corbeille",
                onClick: () => handleBulkDelete(false),
                variant: "danger",
              },
            ]}
          />
        )}
      </AnimatePresence>

      {/* Members Grid */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative group border-2 rounded-lg overflow-hidden ${
                member.deleted_at
                  ? "border-red-200 bg-red-50"
                  : member.is_published
                  ? "border-green-200 bg-white"
                  : "border-orange-200 bg-orange-50"
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={isSelected(member.id)}
                  onChange={() => toggleSelect(member.id)}
                  className="w-5 h-5 rounded border-gray-300 text-yellow focus:ring-yellow"
                />
              </div>

              {/* Photo */}
              <div className="relative h-48 bg-gray-100">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Users className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Status Badge */}
                {member.deleted_at && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded font-medium">
                    Supprimé
                  </div>
                )}
                {!member.deleted_at && !member.is_published && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500 text-white text-xs rounded font-medium">
                    Brouillon
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{member.position}</p>
                {member.bio && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{member.bio}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!member.deleted_at && (
                    <>
                      <button
                        onClick={() => handleTogglePublished(member.id, member.is_published)}
                        className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title={member.is_published ? "Mettre en brouillon" : "Publier"}
                      >
                        {member.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="flex-1 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, false)}
                        className="flex-1 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {member.deleted_at && (
                    <>
                      <button
                        onClick={() => handleRestore(member.id)}
                        className="flex-1 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restaurer
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, true)}
                        className="flex-1 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Définitif
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun membre trouvé
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {isCreating ? "Ajouter un membre" : "Modifier le membre"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <div className="flex items-start gap-4">
                  {photoPreview && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      Choisir une photo
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPEG, PNG ou WebP, max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  placeholder="Maryan LHUILLIER"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poste / Fonction *
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  placeholder="Fondateur & Artisan Couvreur"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio (courte description)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  placeholder="Formé aux Compagnons du Devoir..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length} / 200 caractères
                </p>
              </div>

              {/* Published */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-yellow focus:ring-yellow"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">
                  Publier immédiatement sur le site
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-yellow text-black font-medium rounded-lg hover:bg-yellow/90 transition-colors cursor-pointer"
                >
                  {isCreating ? "Ajouter" : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
