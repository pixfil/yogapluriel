"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Edit,
  TrendingUp,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import RedirectFormModal from "./RedirectFormModal";

interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  is_active: boolean;
  hit_count: number;
  last_hit_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface RedirectStats {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
  total_hits: number;
}

interface AdminRedirectsClientProps {
  initialRedirects: Redirect[];
  initialStats: RedirectStats;
}

export default function AdminRedirectsClient({
  initialRedirects,
  initialStats,
}: AdminRedirectsClientProps) {
  const [redirects, setRedirects] = useState<Redirect[]>(initialRedirects);
  const [stats, setStats] = useState<RedirectStats>(initialStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showDeleted, setShowDeleted] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isSelected,
    clearSelection,
    hasSelection,
    selectedCount,
  } = useBulkSelect<Redirect>({ items: redirects });

  // Filtered redirects
  const filteredRedirects = useMemo(() => {
    return redirects.filter((redirect) => {
      // Filter deleted
      if (showDeleted && !redirect.deleted_at) return false;
      if (!showDeleted && redirect.deleted_at) return false;

      // Filter by status
      if (statusFilter === "active" && !redirect.is_active) return false;
      if (statusFilter === "inactive" && redirect.is_active) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          redirect.from_path.toLowerCase().includes(search) ||
          redirect.to_path.toLowerCase().includes(search) ||
          redirect.notes?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [redirects, searchTerm, statusFilter, showDeleted]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [redirectsRes, statsRes] = await Promise.all([
        fetch("/api/admin/redirects"),
        fetch("/api/admin/redirects?stats=true"),
      ]);

      if (redirectsRes.ok && statsRes.ok) {
        const redirectsData = await redirectsRes.json();
        const statsData = await statsRes.json();
        setRedirects(redirectsData.redirects);
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/admin/redirects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentState }),
      });

      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error toggling redirect:", error);
    }
  };

  const handleDelete = async (id: string, permanent = false) => {
    try {
      const res = await fetch(`/api/admin/redirects/${id}?permanent=${permanent}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await refreshData();
        clearSelection();
      }
    } catch (error) {
      console.error("Error deleting redirect:", error);
    }
  };

  const handleBulkDelete = async (permanent = false) => {
    try {
      const res = await fetch("/api/admin/redirects/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: permanent ? "permanent-delete" : "delete",
        }),
      });

      if (res.ok) {
        await refreshData();
        clearSelection();
      }
    } catch (error) {
      console.error("Error bulk deleting:", error);
    }
  };

  const handleBulkToggle = async (value: boolean) => {
    try {
      const res = await fetch("/api/admin/redirects/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: "toggle",
          value,
        }),
      });

      if (res.ok) {
        await refreshData();
        clearSelection();
      }
    } catch (error) {
      console.error("Error bulk toggling:", error);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/redirects/${id}/restore`, {
        method: "POST",
      });

      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error restoring redirect:", error);
    }
  };

  const handleEdit = (redirect: Redirect) => {
    setEditingRedirect(redirect);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = async () => {
    setIsFormModalOpen(false);
    setEditingRedirect(null);
    await refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Redirections 301</h1>
          <p className="mt-2 text-gray-600">
            Gérez les redirections SEO pour préserver votre référencement
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refreshData()}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <button
            onClick={() => {
              setEditingRedirect(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2 bg-yellow text-black rounded-lg hover:bg-yellow/90 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Nouvelle redirection
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ArrowRightLeft className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactives</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inactive}</p>
            </div>
            <XCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hits</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total_hits}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Supprimées</p>
              <p className="text-2xl font-bold text-red-600">{stats.deleted}</p>
            </div>
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par chemin source, destination ou notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives uniquement</option>
            <option value="inactive">Inactives uniquement</option>
          </select>

          {/* Deleted toggle */}
          <button
            onClick={() => {
              setShowDeleted(!showDeleted);
              clearSelection();
            }}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              showDeleted
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {showDeleted ? "Corbeille" : "Voir corbeille"}
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-yellow/10 border border-yellow rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {selectedCount} redirection(s) sélectionnée(s)
              </span>
              <div className="flex gap-2">
                {!showDeleted && (
                  <>
                    <button
                      onClick={() => handleBulkToggle(true)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <ToggleRight className="w-4 h-4" />
                      Activer
                    </button>
                    <button
                      onClick={() => handleBulkToggle(false)}
                      className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <ToggleLeft className="w-4 h-4" />
                      Désactiver
                    </button>
                    <button
                      onClick={() => handleBulkDelete(false)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </>
                )}
                {showDeleted && (
                  <button
                    onClick={() => handleBulkDelete(true)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer définitivement
                  </button>
                )}
                <button
                  onClick={clearSelection}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredRedirects.length > 0 && selectedIds.size === filteredRedirects.length}
                    onChange={() => toggleSelectAll(filteredRedirects)}
                    className="rounded border-gray-300 text-yellow focus:ring-yellow"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depuis (ancien URL)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vers (nouveau URL)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier hit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRedirects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Aucune redirection trouvée
                  </td>
                </tr>
              ) : (
                filteredRedirects.map((redirect) => (
                  <tr
                    key={redirect.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected(redirect.id) ? "bg-yellow/5" : ""
                    } ${redirect.deleted_at ? "opacity-50" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected(redirect.id)}
                        onChange={() => toggleSelect(redirect.id)}
                        className="rounded border-gray-300 text-yellow focus:ring-yellow"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {redirect.from_path}
                      </code>
                      {redirect.notes && (
                        <p className="text-xs text-gray-500 mt-1">{redirect.notes}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {redirect.to_path}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {redirect.status_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(redirect.id, redirect.is_active)}
                        disabled={!!redirect.deleted_at}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          redirect.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                        } ${redirect.deleted_at ? "cursor-not-allowed" : ""}`}
                      >
                        {redirect.is_active ? (
                          <>
                            <ToggleRight className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        {redirect.hit_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {redirect.last_hit_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(redirect.last_hit_at).toLocaleDateString("fr-FR")}
                        </div>
                      ) : (
                        <span className="text-gray-400">Jamais</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {redirect.deleted_at ? (
                        <>
                          <button
                            onClick={() => handleRestore(redirect.id)}
                            className="text-green-600 hover:text-green-900 transition-colors cursor-pointer"
                            title="Restaurer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(redirect.id, true)}
                            className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(redirect)}
                            className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(redirect.id, false)}
                            className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 text-center">
        Affichage de {filteredRedirects.length} redirection(s)
      </div>

      {/* Form Modal */}
      <RedirectFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRedirect(null);
        }}
        onSuccess={handleFormSuccess}
        redirect={editingRedirect}
      />
    </div>
  );
}
