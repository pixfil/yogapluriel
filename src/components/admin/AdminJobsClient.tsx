"use client";

import { useState } from "react";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  X,
  Search,
  Archive,
  Megaphone,
  Bell,
} from "lucide-react";
import { JobOpening } from "@/app/actions/team";
import { motion, AnimatePresence } from "framer-motion";
import BulkActionsBar from "./BulkActionsBar";
import BulkSelectCheckbox from "./BulkSelectCheckbox";
import { useBulkSelect } from "@/hooks/useBulkSelect";

type Props = {
  initialJobs: JobOpening[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    deleted: number;
  };
};

export default function AdminJobsClient({ initialJobs, stats }: Props) {
  const [jobs, setJobs] = useState(initialJobs);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contract_type: "",
    location: "Bas-Rhin, Alsace",
    requirements: "",
    is_active: true,
  });

  // Bulk selection
  const bulkSelect = useBulkSelect<JobOpening>({
    items: jobs,
    idField: 'id',
  });

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Handlers
  const handleOpenModal = (job?: JobOpening) => {
    if (job) {
      setSelectedJob(job);
      setFormData({
        title: job.title,
        description: job.description,
        contract_type: job.contract_type || "",
        location: job.location,
        requirements: job.requirements || "",
        is_active: job.is_active,
      });
      setIsCreating(false);
    } else {
      setSelectedJob(null);
      setFormData({
        title: "",
        description: "",
        contract_type: "",
        location: "Bas-Rhin, Alsace",
        requirements: "",
        is_active: true,
      });
      setIsCreating(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const endpoint = isCreating ? "/api/admin/jobs" : `/api/admin/jobs/${selectedJob?.id}`;
      const method = isCreating ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save job");

      window.location.reload();
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string, permanent = false) => {
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
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
      const res = await fetch(`/api/admin/jobs/${id}/restore`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to restore");

      window.location.reload();
    } catch (error) {
      console.error("Error restoring:", error);
      alert("Erreur lors de la restauration");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/jobs/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (!res.ok) throw new Error("Failed to toggle");

      setJobs(jobs.map(j =>
        j.id === id ? { ...j, is_active: !isActive } : j
      ));
    } catch (error) {
      console.error("Error toggling:", error);
      alert("Erreur lors du changement de statut");
    }
  };

  const handleToggleHighlight = async (id: string, isHighlighted: boolean) => {
    try {
      const res = await fetch(`/api/admin/jobs/${id}/highlight`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_highlighted: !isHighlighted }),
      });

      if (!res.ok) throw new Error("Failed to toggle highlight");

      setJobs(jobs.map(j =>
        j.id === id ? { ...j, is_highlighted: !isHighlighted } : j
      ));
    } catch (error) {
      console.error("Error toggling highlight:", error);
      alert("Erreur lors du changement de mise en avant");
    }
  };

  const handleBulkDelete = async (permanent = false) => {
    try {
      const res = await fetch("/api/admin/jobs/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: bulkSelect.selectedIds, permanent }),
      });

      if (!res.ok) throw new Error("Failed to bulk delete");

      bulkSelect.deselectAll();
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion du recrutement</h1>
          <p className="text-gray-600 mt-1">
            Gérez les offres d'emploi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`inline-flex items-center px-4 py-2 font-semibold rounded-lg transition-colors ${
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
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle offre
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
            <Briefcase className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Actives</div>
              <div className="text-3xl font-bold text-green-600 mt-1">{stats.active}</div>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Inactives</div>
              <div className="text-3xl font-bold text-orange-600 mt-1">{stats.inactive}</div>
            </div>
            <EyeOff className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Supprimées</div>
              <div className="text-3xl font-bold text-red-600 mt-1">{stats.deleted}</div>
            </div>
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredJobs.length} offre(s) affichée(s)
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {bulkSelect.selectedIds.length > 0 && (
          <BulkActionsBar
            selectedCount={bulkSelect.selectedIds.length}
            onClear={bulkSelect.deselectAll}
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

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <BulkSelectCheckbox
                    checked={bulkSelect.isAllSelected}
                    indeterminate={bulkSelect.isSomeSelected}
                    onChange={bulkSelect.toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre du poste
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type / Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut & Options
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className={`hover:bg-gray-50 ${job.deleted_at ? 'bg-red-50' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4">
                    <BulkSelectCheckbox
                      checked={bulkSelect.isSelected(job.id)}
                      onChange={() => bulkSelect.toggleSelect(job.id)}
                    />
                  </td>

                  {/* Titre */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {job.title}
                    </div>
                    {job.requirements && (
                      <div className="text-xs text-gray-500 mt-1">
                        {job.requirements.substring(0, 60)}{job.requirements.length > 60 ? '...' : ''}
                      </div>
                    )}
                  </td>

                  {/* Type / Localisation */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {job.contract_type && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mb-1">
                          {job.contract_type}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{job.location}</div>
                  </td>

                  {/* Statut & Options */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleActive(job.id, job.is_active)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          job.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        disabled={!!job.deleted_at}
                        title={job.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {job.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {job.is_active ? 'Actif' : 'Inactif'}
                      </button>
                      <button
                        onClick={() => handleToggleHighlight(job.id, job.is_highlighted || false)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          job.is_highlighted
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        disabled={!!job.deleted_at}
                        title={job.is_highlighted ? 'Désactiver la popup' : 'Activer la popup'}
                      >
                        <Bell className={`w-3 h-3 ${job.is_highlighted ? '' : 'opacity-50'}`} />
                        Popup {job.is_highlighted ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {!job.deleted_at && (
                        <>
                          <button
                            onClick={() => handleOpenModal(job)}
                            className="text-yellow hover:text-yellow-600 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(job.id, false)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {job.deleted_at && (
                        <>
                          <button
                            onClick={() => handleRestore(job.id)}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                            title="Restaurer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(job.id, true)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucune offre trouvée
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {isCreating ? "Nouvelle offre d'emploi" : "Modifier l'offre"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du poste *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  placeholder="Second d'Équipe Couvreur"
                />
              </div>

              {/* Contract Type & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contrat
                  </label>
                  <select
                    value={formData.contract_type}
                    onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  >
                    <option value="">Non spécifié</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Alternance">Alternance</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description complète *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent font-mono text-sm"
                  placeholder="Missions, profil recherché, ce que nous proposons..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} caractères
                </p>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prérequis
                </label>
                <input
                  type="text"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
                  placeholder="CAP Couvreur, 5+ ans d'expérience..."
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-yellow focus:ring-yellow"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Offre active (visible sur le site)
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-yellow text-black font-medium rounded-lg hover:bg-yellow/90 transition-colors"
                >
                  {isCreating ? "Créer l'offre" : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
