/**
 * Système de permissions et rôles pour FormDeToit
 *
 * Ce fichier définit les rôles, leurs permissions et les fonctions helper
 * pour vérifier les autorisations des utilisateurs.
 */

// =============================================
// TYPES
// =============================================

export type UserRole = 'super_admin' | 'admin' | 'auteur' | 'visiteur';

export type Resource =
  | 'users'           // Gestion des utilisateurs
  | 'settings'        // Paramètres système
  | 'projects'        // Projets/Réalisations
  | 'team'            // Équipe
  | 'jobs'            // Offres d'emploi
  | 'faq'             // FAQ
  | 'lexique'         // Lexique
  | 'certifications'  // Certifications
  | 'categories'      // Catégories
  | 'pages'           // Pages & SEO
  | 'inbox'           // Messages/Contacts
  | 'email-logs'      // Logs emails
  | 'redirects'       // Redirections
  | '404-logs';       // Logs 404

export type Action = 'read' | 'write' | 'delete' | 'manage';

export interface Permission {
  resource: Resource;
  actions: Action[];
}

// =============================================
// CONFIGURATION DES PERMISSIONS PAR RÔLE
// =============================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  /**
   * SUPER_ADMIN - Accès total au système
   * - Peut tout faire, y compris gérer les utilisateurs et paramètres système
   */
  super_admin: [
    { resource: 'users', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'settings', actions: ['read', 'write', 'manage'] },
    { resource: 'projects', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'team', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'jobs', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'faq', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'lexique', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'certifications', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'categories', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'pages', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'inbox', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'email-logs', actions: ['read', 'manage'] },
    { resource: 'redirects', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: '404-logs', actions: ['read', 'delete', 'manage'] },
  ],

  /**
   * ADMIN - Gestion des contenus et messages
   * - Peut gérer tous les contenus (projets, équipe, messages, etc.)
   * - Ne peut PAS gérer les utilisateurs ni les paramètres système
   */
  admin: [
    { resource: 'users', actions: ['read'] }, // Lecture seule
    { resource: 'projects', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'team', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'jobs', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'faq', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'lexique', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'certifications', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'categories', actions: ['read', 'write', 'delete'] },
    { resource: 'pages', actions: ['read', 'write'] },
    { resource: 'inbox', actions: ['read', 'write', 'delete', 'manage'] },
    { resource: 'email-logs', actions: ['read'] },
    { resource: 'redirects', actions: ['read', 'write'] },
    { resource: '404-logs', actions: ['read'] },
  ],

  /**
   * AUTEUR - Création et modification de contenus
   * - Peut créer/modifier : Projets, Équipe, FAQ, Lexique, Certifications
   * - Ne peut PAS : Gérer les utilisateurs, paramètres, ou supprimer définitivement
   */
  auteur: [
    { resource: 'projects', actions: ['read', 'write'] },
    { resource: 'team', actions: ['read', 'write'] },
    { resource: 'jobs', actions: ['read'] },
    { resource: 'faq', actions: ['read', 'write'] },
    { resource: 'lexique', actions: ['read', 'write'] },
    { resource: 'certifications', actions: ['read', 'write'] },
    { resource: 'categories', actions: ['read'] },
    { resource: 'pages', actions: ['read'] },
    { resource: 'inbox', actions: ['read'] },
  ],

  /**
   * VISITEUR - Lecture seule
   * - Peut uniquement consulter les contenus
   * - Aucune permission de modification
   */
  visiteur: [
    { resource: 'projects', actions: ['read'] },
    { resource: 'team', actions: ['read'] },
    { resource: 'jobs', actions: ['read'] },
    { resource: 'faq', actions: ['read'] },
    { resource: 'lexique', actions: ['read'] },
    { resource: 'certifications', actions: ['read'] },
    { resource: 'categories', actions: ['read'] },
    { resource: 'inbox', actions: ['read'] },
  ],
};

// =============================================
// LABELS ET COULEURS PAR RÔLE
// =============================================

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  auteur: 'Auteur',
  visiteur: 'Visiteur',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Accès complet à toutes les fonctionnalités du système',
  admin: 'Gestion des contenus, projets, équipe et messages',
  auteur: 'Peut créer et modifier des contenus (projets, équipe, FAQ, certifications)',
  visiteur: 'Accès en lecture seule',
};

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  super_admin: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700',
  },
  admin: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
  },
  auteur: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
  },
  visiteur: {
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    text: 'text-gray-800 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-700',
  },
};

// =============================================
// FONCTIONS HELPER
// =============================================

/**
 * Vérifie si un utilisateur a la permission pour une action sur une ressource
 * @param userRoles - Tableau des rôles de l'utilisateur
 * @param resource - La ressource à vérifier
 * @param action - L'action à vérifier
 * @returns true si l'utilisateur a la permission
 */
export function hasPermission(
  userRoles: UserRole[],
  resource: Resource,
  action: Action
): boolean {
  // Si aucun rôle, considérer comme visiteur
  if (!userRoles || userRoles.length === 0) {
    userRoles = ['visiteur'];
  }

  // Parcourir tous les rôles de l'utilisateur
  for (const role of userRoles) {
    const rolePermissions = ROLE_PERMISSIONS[role];
    if (!rolePermissions) continue;

    // Trouver les permissions pour la ressource
    const resourcePermission = rolePermissions.find(p => p.resource === resource);
    if (!resourcePermission) continue;

    // Vérifier si l'action est autorisée
    if (resourcePermission.actions.includes(action)) {
      return true;
    }

    // Si l'utilisateur a 'manage', il a toutes les permissions
    if (resourcePermission.actions.includes('manage')) {
      return true;
    }
  }

  return false;
}

/**
 * Vérifie si un utilisateur a au moins un des rôles spécifiés
 * @param userRoles - Tableau des rôles de l'utilisateur
 * @param requiredRoles - Tableau des rôles requis (au moins un)
 * @returns true si l'utilisateur a au moins un des rôles requis
 */
export function hasRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Vérifie si un utilisateur est admin (admin ou super_admin)
 * @param userRoles - Tableau des rôles de l'utilisateur
 * @returns true si l'utilisateur est admin ou super_admin
 */
export function isAdmin(userRoles: UserRole[]): boolean {
  return hasRole(userRoles, ['admin', 'super_admin']);
}

/**
 * Vérifie si un utilisateur est super admin
 * @param userRoles - Tableau des rôles de l'utilisateur
 * @returns true si l'utilisateur est super_admin
 */
export function isSuperAdmin(userRoles: UserRole[]): boolean {
  return hasRole(userRoles, ['super_admin']);
}

/**
 * Obtient toutes les ressources accessibles pour un utilisateur
 * @param userRoles - Tableau des rôles de l'utilisateur
 * @returns Liste des ressources avec leurs actions autorisées
 */
export function getAccessibleResources(userRoles: UserRole[]): Record<Resource, Action[]> {
  const accessible: Partial<Record<Resource, Set<Action>>> = {};

  for (const role of userRoles) {
    const rolePermissions = ROLE_PERMISSIONS[role];
    if (!rolePermissions) continue;

    for (const permission of rolePermissions) {
      if (!accessible[permission.resource]) {
        accessible[permission.resource] = new Set();
      }
      permission.actions.forEach(action => accessible[permission.resource]!.add(action));
    }
  }

  // Convertir Set en Array
  const result: Partial<Record<Resource, Action[]>> = {};
  for (const [resource, actions] of Object.entries(accessible)) {
    result[resource as Resource] = Array.from(actions);
  }

  return result as Record<Resource, Action[]>;
}

/**
 * Filtre les rôles d'un utilisateur pour ne garder que les rôles valides
 * @param roles - Tableau de rôles (potentiellement avec des valeurs invalides)
 * @returns Tableau de rôles valides
 */
export function sanitizeRoles(roles: string[]): UserRole[] {
  const validRoles: UserRole[] = ['super_admin', 'admin', 'auteur', 'visiteur'];
  return roles.filter(role => validRoles.includes(role as UserRole)) as UserRole[];
}

/**
 * Obtient le rôle le plus élevé d'un utilisateur
 * @param userRoles - Tableau des rôles de l'utilisateur
 * @returns Le rôle le plus élevé
 */
export function getHighestRole(userRoles: UserRole[]): UserRole {
  const roleHierarchy: UserRole[] = ['super_admin', 'admin', 'auteur', 'visiteur'];

  for (const role of roleHierarchy) {
    if (userRoles.includes(role)) {
      return role;
    }
  }

  return 'visiteur';
}
