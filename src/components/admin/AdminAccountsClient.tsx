"use client";

import { useState } from "react";
import { UserProfile } from "@/app/actions/users";
import { UserRole } from "@/lib/permissions";
import { MultiRoleBadges } from "./RoleBadge";
import UserRoleManager from "./UserRoleManager";
import { useBulkSelect } from "@/hooks/useBulkSelect";
import BulkActionsBar from "./BulkActionsBar";
import { Users, UserPlus, Edit, Trash2, RotateCcw, Search, Archive } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  initialUsers: UserProfile[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    deleted: number;
    by_role: {
      super_admin: number;
      admin: number;
      auteur: number;
      visiteur: number;
    };
  };
};

export default function AdminAccountsClient({ initialUsers, stats: initialStats }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [stats, setStats] = useState(initialStats);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Bulk selection
  const {
    selectedIds,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    deselectAll: clearSelection,
    isAllSelected,
    isSomeSelected,
  } = useBulkSelect<UserProfile>({
    items: users,
  });

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);

    const matchesDeleted = showDeleted ? user.deleted_at !== null : user.deleted_at === null;

    return matchesSearch && matchesRole && matchesDeleted;
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?showDeleted=${showDeleted}`);
      const data = await response.json();
      setUsers(data.users || []);

      const statsResponse = await fetch("/api/admin/users?stats=true");
      const statsData = await statsResponse.json();
      setStats(statsData.stats);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Erreur lors du chargement des utilisateurs");
    }
  };

  const handleOpenRoleManager = (user: UserProfile) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setSelectedUser(null);
  };

  const handleRoleUpdateSuccess = () => {
    fetchUsers();
  };

  const handleDelete = async (userId: string, permanent = false) => {
    const confirmMessage = permanent
      ? "Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?"
      : "Êtes-vous sûr de vouloir supprimer cet utilisateur ?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}?permanent=${permanent}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      alert("Utilisateur supprimé avec succès");
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/restore`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la restauration");
      }

      alert("Utilisateur restauré avec succès");
      await fetchUsers();
    } catch (error) {
      console.error("Error restoring user:", error);
      alert("Erreur lors de la restauration");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const action = showDeleted ? "permanent" : "delete";
    const confirmMessage = showDeleted
      ? `Êtes-vous sûr de vouloir supprimer définitivement ${selectedIds.length} utilisateur(s) ?`
      : `Êtes-vous sûr de vouloir supprimer ${selectedIds.length} utilisateur(s) ?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch("/api/admin/users/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression en masse");
      }

      alert(`${selectedIds.length} utilisateur(s) supprimé(s) avec succès`);
      clearSelection();
      await fetchUsers();
    } catch (error) {
      console.error("Error bulk deleting users:", error);
      alert("Erreur lors de la suppression en masse");
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;

    try {
      const response = await fetch("/api/admin/users/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action: "restore" }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la restauration en masse");
      }

      alert(`${selectedIds.length} utilisateur(s) restauré(s) avec succès`);
      clearSelection();
      await fetchUsers();
    } catch (error) {
      console.error("Error bulk restoring users:", error);
      alert("Erreur lors de la restauration en masse");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };

    const labels = {
      active: "Actif",
      inactive: "Inactif",
      suspended: "Suspendu",
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="mt-1 text-gray-600">Gérez les comptes et rôles des utilisateurs</p>
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
            onClick={() => alert("La création d'utilisateurs se fait via invitation email dans Supabase Auth. Cette fonctionnalité sera ajoutée prochainement.")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow hover:bg-yellow/90 text-black font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-yellow" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-purple-600">{stats.by_role.super_admin}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <span className="text-sm font-bold">SA</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Supprimés</p>
              <p className="text-2xl font-bold text-red-600">{stats.deleted}</p>
            </div>
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow focus:border-transparent"
            >
              <option value="all">Tous les rôles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="auteur">Auteur</option>
              <option value="visiteur">Visiteur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {filteredUsers.length} utilisateur(s)
            {roleFilter !== "all" && <span className="ml-2 text-xs text-yellow">(filtré par rôle)</span>}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-yellow border-gray-300 rounded focus:ring-yellow"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 ${isSelected(user.id) ? "bg-yellow/10" : ""}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="h-4 w-4 text-yellow border-gray-300 rounded focus:ring-yellow"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-yellow/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-yellow" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <MultiRoleBadges roles={user.roles} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(user.status)}
                      {user.deleted_at && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Supprimé
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Jamais connecté"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!user.deleted_at ? (
                        <>
                          <button
                            onClick={() => handleOpenRoleManager(user)}
                            className="text-yellow hover:text-yellow/80 p-1 rounded transition-colors"
                            title="Gérer les rôles"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, false)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(user.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Restaurer"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, true)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onDelete={handleBulkDelete}
        onRestore={showDeleted ? handleBulkRestore : undefined}
        onDeselectAll={clearSelection}
        isLoading={false}
        showRestore={showDeleted}
        variant={showDeleted ? "danger" : "default"}
      />

      {/* Role Manager Modal */}
      <UserRoleManager
        user={selectedUser}
        isOpen={isRoleModalOpen}
        onClose={handleCloseRoleModal}
        onSuccess={handleRoleUpdateSuccess}
      />
    </div>
  );
}
