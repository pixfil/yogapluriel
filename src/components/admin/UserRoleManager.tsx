"use client";

import { useState, useEffect } from "react";
import { UserRole, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS } from "@/lib/permissions";
import { UserProfile } from "@/app/actions/users";
import { MultiRoleBadges } from "./RoleBadge";
import { X, Shield, AlertTriangle } from "lucide-react";

type UserRoleManagerProps = {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function UserRoleManager({ user, isOpen, onClose, onSuccess }: UserRoleManagerProps) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Vérifier si l'utilisateur connecté est super_admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const response = await fetch("/api/admin/check-permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resource: "users", action: "write" }),
        });

        const data = await response.json();
        setIsSuperAdmin(data.hasPermission || false);
      } catch (error) {
        console.error("Erreur vérification permissions:", error);
        setIsSuperAdmin(false);
      }
    };

    if (isOpen) {
      checkSuperAdmin();
    }
  }, [isOpen]);

  // Initialiser les rôles sélectionnés
  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || ["visiteur"]);
    }
  }, [user]);

  const handleRoleToggle = (role: UserRole) => {
    if (!isSuperAdmin) {
      alert("Seuls les super administrateurs peuvent modifier les rôles");
      return;
    }

    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        // Empêcher de retirer le dernier rôle
        if (prev.length === 1) {
          alert("Un utilisateur doit avoir au moins un rôle");
          return prev;
        }
        return prev.filter((r) => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSave = async () => {
    if (!user || !isSuperAdmin) {
      alert("Permissions insuffisantes");
      return;
    }

    if (selectedRoles.length === 0) {
      alert("Sélectionnez au moins un rôle");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: selectedRoles }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de la mise à jour des rôles");
      }

      alert("Rôles mis à jour avec succès");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur mise à jour rôles:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const currentRoles = user.roles || ["visiteur"];
  const hasChanges = JSON.stringify(selectedRoles.sort()) !== JSON.stringify(currentRoles.sort());

  const ALL_ROLES: { value: UserRole; label: string; description: string }[] = [
    { value: "super_admin", label: ROLE_LABELS.super_admin, description: ROLE_DESCRIPTIONS.super_admin },
    { value: "admin", label: ROLE_LABELS.admin, description: ROLE_DESCRIPTIONS.admin },
    { value: "auteur", label: ROLE_LABELS.auteur, description: ROLE_DESCRIPTIONS.auteur },
    { value: "visiteur", label: ROLE_LABELS.visiteur, description: ROLE_DESCRIPTIONS.visiteur },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des rôles</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations utilisateur */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }`}
              >
                {user.status === "active" ? "Actif" : user.status === "inactive" ? "Inactif" : "Suspendu"}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Rôles actuels :</p>
              <MultiRoleBadges roles={currentRoles} />
            </div>
          </div>

          {/* Warning si pas super admin */}
          {!isSuperAdmin && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Permissions insuffisantes</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Seuls les super administrateurs peuvent modifier les rôles des utilisateurs.
                </p>
              </div>
            </div>
          )}

          {/* Sélection des rôles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Rôles disponibles</h4>
            </div>

            <div className="space-y-2">
              {ALL_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role.value);
                const isDisabled = !isSuperAdmin;
                const colors = ROLE_COLORS[role.value];

                return (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? `${colors.bg} ${colors.border} border-2`
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRoleToggle(role.value)}
                      disabled={isDisabled}
                      className="mt-1 h-4 w-4 text-yellow border-gray-300 rounded focus:ring-yellow"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${colors.text}`}>{role.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{role.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Preview des rôles sélectionnés */}
          {hasChanges && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">Nouveaux rôles :</p>
              <MultiRoleBadges roles={selectedRoles} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !hasChanges || !isSuperAdmin}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow hover:bg-yellow/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
