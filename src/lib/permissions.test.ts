/**
 * Tests du système de permissions
 * Vérifie que les rôles et permissions fonctionnent correctement
 */

import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasRole,
  isAdmin,
  isSuperAdmin,
  getHighestRole,
  sanitizeRoles,
  ROLE_PERMISSIONS,
  type UserRole,
  type Resource,
  type Action,
} from './permissions';

describe('Permissions System', () => {
  describe('hasPermission', () => {
    it('should allow super_admin full access', () => {
      const roles: UserRole[] = ['super_admin'];

      expect(hasPermission(roles, 'users', 'read')).toBe(true);
      expect(hasPermission(roles, 'users', 'write')).toBe(true);
      expect(hasPermission(roles, 'users', 'delete')).toBe(true);
      expect(hasPermission(roles, 'projects', 'manage')).toBe(true);
    });

    it('should allow admin limited access', () => {
      const roles: UserRole[] = ['admin'];

      expect(hasPermission(roles, 'projects', 'write')).toBe(true);
      expect(hasPermission(roles, 'users', 'read')).toBe(true);
      expect(hasPermission(roles, 'users', 'write')).toBe(false);
      expect(hasPermission(roles, 'users', 'delete')).toBe(false);
    });

    it('should allow auteur content creation', () => {
      const roles: UserRole[] = ['auteur'];

      expect(hasPermission(roles, 'projects', 'read')).toBe(true);
      expect(hasPermission(roles, 'projects', 'write')).toBe(true);
      expect(hasPermission(roles, 'projects', 'delete')).toBe(false);
      expect(hasPermission(roles, 'users', 'read')).toBe(false);
    });

    it('should restrict visiteur to read-only', () => {
      const roles: UserRole[] = ['visiteur'];

      expect(hasPermission(roles, 'projects', 'read')).toBe(true);
      expect(hasPermission(roles, 'projects', 'write')).toBe(false);
      expect(hasPermission(roles, 'projects', 'delete')).toBe(false);
      expect(hasPermission(roles, 'users', 'read')).toBe(false);
    });

    it('should handle multiple roles (highest permission wins)', () => {
      const roles: UserRole[] = ['visiteur', 'auteur'];

      expect(hasPermission(roles, 'projects', 'write')).toBe(true);
    });

    it('should default to visiteur if no roles', () => {
      expect(hasPermission([], 'projects', 'read')).toBe(true);
      expect(hasPermission([], 'projects', 'write')).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has any of the required roles', () => {
      const roles: UserRole[] = ['auteur', 'admin'];

      expect(hasRole(roles, ['admin'])).toBe(true);
      expect(hasRole(roles, ['super_admin', 'admin'])).toBe(true);
      expect(hasRole(roles, ['visiteur'])).toBe(false);
    });

    it('should return false for empty roles', () => {
      expect(hasRole([], ['admin'])).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin', () => {
      expect(isAdmin(['admin'])).toBe(true);
    });

    it('should return true for super_admin', () => {
      expect(isAdmin(['super_admin'])).toBe(true);
    });

    it('should return false for auteur', () => {
      expect(isAdmin(['auteur'])).toBe(false);
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true only for super_admin', () => {
      expect(isSuperAdmin(['super_admin'])).toBe(true);
      expect(isSuperAdmin(['admin'])).toBe(false);
      expect(isSuperAdmin(['auteur'])).toBe(false);
    });
  });

  describe('getHighestRole', () => {
    it('should return highest role from hierarchy', () => {
      expect(getHighestRole(['visiteur', 'auteur'])).toBe('auteur');
      expect(getHighestRole(['visiteur', 'admin'])).toBe('admin');
      expect(getHighestRole(['super_admin', 'admin'])).toBe('super_admin');
    });

    it('should default to visiteur if empty', () => {
      expect(getHighestRole([])).toBe('visiteur');
    });
  });

  describe('sanitizeRoles', () => {
    it('should filter out invalid roles', () => {
      const input = ['admin', 'invalid_role', 'auteur', 'hacker'];
      const expected: UserRole[] = ['admin', 'auteur'];

      expect(sanitizeRoles(input)).toEqual(expected);
    });

    it('should return empty array if all invalid', () => {
      expect(sanitizeRoles(['invalid', 'bad_role'])).toEqual([]);
    });
  });

  describe('ROLE_PERMISSIONS configuration', () => {
    it('should define permissions for all roles', () => {
      expect(ROLE_PERMISSIONS.super_admin).toBeDefined();
      expect(ROLE_PERMISSIONS.admin).toBeDefined();
      expect(ROLE_PERMISSIONS.auteur).toBeDefined();
      expect(ROLE_PERMISSIONS.visiteur).toBeDefined();
    });

    it('should not allow visiteur to modify users', () => {
      const visiteurPerms = ROLE_PERMISSIONS.visiteur;
      const usersPerms = visiteurPerms.find(p => p.resource === 'users');

      expect(usersPerms).toBeUndefined();
    });
  });
});
