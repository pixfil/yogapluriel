"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ArrowRightLeft,
  ExternalLink,
} from "lucide-react";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import RedirectFormModal from "./RedirectFormModal";
import { resolve404 } from "@/app/actions/redirects";

interface Log404 {
  id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  hit_count: number;
  first_seen_at: string;
  last_seen_at: string;
  is_resolved: boolean;
  redirect_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Log404Stats {
  total: number;
  unresolved: number;
  resolved: number;
  total_hits: number;
  avg_hits_per_log: number;
}

interface Admin404TrackingClientProps {
  initialLogs: Log404[];
  initialStats: Log404Stats;
}

export default function Admin404TrackingClient({
  initialLogs,
  initialStats,
}: Admin404TrackingClientProps) {
  const [logs, setLogs] = useState<Log404[]>(initialLogs);
  const [stats, setStats] = useState<Log404Stats>(initialStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [sortBy, setSortBy] = useState<"hits" | "recent">("hits");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedLogForRedirect, setSelectedLogForRedirect] = useState<Log404 | null>(null);

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isSelected,
    clearSelection,
    hasSelection,
    selectedCount,
  } = useBulkSelect<Log404>({ items: logs });

  // Filtered and sorted logs
  const filteredLogs = useMemo(() => {
    let filtered = logs.filter((log) => {
      // Filter by resolution status
      if (statusFilter === "resolved" && !log.is_resolved) return false;
      if (statusFilter === "unresolved" && log.is_resolved) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          log.path.toLowerCase().includes(search) ||
          log.referrer?.toLowerCase().includes(search)
        );
      }

      return true;
    });

    // Sort
    if (sortBy === "hits") {
      filtered.sort((a, b) => b.hit_count - a.hit_count);
    } else {
      filtered.sort((a, b) =>
        new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()
      );
    }

    return filtered;
  }, [logs, searchTerm, statusFilter, sortBy]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch("/api/admin/404-logs"),
        fetch("/api/admin/404-logs?stats=true"),
      ]);

      if (logsRes.ok && statsRes.ok) {
        const logsData = await logsRes.json();
        const statsData = await statsRes.json();
        setLogs(logsData.logs);
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce log 404 ?")) return;

    try {
      const res = await fetch(`/api/admin/404-logs?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await refreshData();
        clearSelection();
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedCount} log(s) 404 ?`)) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/404-logs?id=${id}`, { method: "DELETE" })
        )
      );

      await refreshData();
      clearSelection();
    } catch (error) {
      console.error("Error bulk deleting:", error);
    }
  };

  const handleMarkResolved = async (id: string) => {
    // TODO: Implement mark as resolved without creating redirect
    console.log("Mark as resolved:", id);
  };

  const handleCreateRedirect = (log: Log404) => {
    setSelectedLogForRedirect(log);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = async (createdRedirect?: { id: string }) => {
    // Si une redirection a été créée depuis un log 404, marquer le log comme résolu
    if (createdRedirect && selectedLogForRedirect) {
      await resolve404(selectedLogForRedirect.id, createdRedirect.id);
    }

    setIsFormModalOpen(false);
    setSelectedLogForRedirect(null);
    await refreshData();
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedLogForRedirect(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suivi des Erreurs 404</h1>
          <p className="mt-2 text-gray-600">
            Suivez et résolvez les URLs qui génèrent des erreurs 404
          </p>
        </div>
        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total 404</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Non résolus</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unresolved}</p>
            </div>
            <XCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Résolus</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
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
              <p className="text-sm text-gray-600">Moy. hits/404</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.avg_hits_per_log.toFixed(1)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
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
              placeholder="Rechercher par URL ou referrer..."
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
            <option value="unresolved">Non résolus uniquement</option>
            <option value="resolved">Résolus uniquement</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
          >
            <option value="hits">Trier par hits</option>
            <option value="recent">Plus récents</option>
          </select>
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
                {selectedCount} log(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
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
                    checked={filteredLogs.length > 0 && selectedIds.size === filteredLogs.length}
                    onChange={() => toggleSelectAll(filteredLogs)}
                    className="rounded border-gray-300 text-yellow focus:ring-yellow"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL 404
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premier vu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier vu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucun log 404 trouvé
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected(log.id) ? "bg-yellow/5" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected(log.id)}
                        onChange={() => toggleSelect(log.id)}
                        className="rounded border-gray-300 text-yellow focus:ring-yellow"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded block">
                          {log.path}
                        </code>
                        {log.referrer && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-md">{log.referrer}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className={log.hit_count > 10 ? "text-red-600" : "text-gray-900"}>
                          {log.hit_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(log.first_seen_at).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(log.last_seen_at).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.is_resolved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Résolu
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Non résolu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {!log.is_resolved && (
                        <button
                          onClick={() => handleCreateRedirect(log)}
                          className="text-blue-600 hover:text-blue-900 transition-colors inline-flex items-center gap-1 text-sm cursor-pointer"
                          title="Créer une redirection"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          Créer redirection
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        Affichage de {filteredLogs.length} log(s) 404
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Comment résoudre les 404</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            • <strong>Créer une redirection :</strong> Cliquez sur "Créer redirection" pour
            rediriger automatiquement l'ancienne URL vers une nouvelle page
          </li>
          <li>
            • <strong>Surveiller les hits :</strong> Les URLs avec beaucoup de hits (en rouge)
            sont prioritaires à corriger
          </li>
          <li>
            • <strong>Vérifier le referrer :</strong> Identifiez d'où viennent les liens cassés
            pour les corriger à la source
          </li>
          <li>
            • <strong>Nettoyer :</strong> Supprimez les logs avec peu de hits et anciens pour
            garder une liste propre
          </li>
        </ul>
      </div>

      {/* Redirect Form Modal */}
      <RedirectFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleFormSuccess}
        redirect={null}
        initialFromPath={selectedLogForRedirect?.path}
        initialNotes={
          selectedLogForRedirect
            ? `Redirection créée depuis 404 tracking (${selectedLogForRedirect.hit_count} hits)`
            : undefined
        }
      />
    </div>
  );
}
