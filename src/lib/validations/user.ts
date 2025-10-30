import { z } from 'zod';
import { UserRole } from '@/lib/permissions';

/**
 * Schémas de validation pour la gestion des utilisateurs
 * Utilisés par les API routes /api/admin/users
 */

const validRoles: [UserRole, ...UserRole[]] = ['super_admin', 'admin', 'auteur', 'visiteur'];

export const createUserSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .max(255, 'L\'email est trop long'),

  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(72, 'Le mot de passe est trop long')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),

  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),

  roles: z.array(z.enum(validRoles))
    .min(1, 'Au moins un rôle est requis')
    .default(['visiteur']),

  status: z.enum(['active', 'inactive', 'suspended'])
    .default('active'),
});

export const updateUserRolesSchema = z.object({
  roles: z.array(z.enum(validRoles))
    .min(1, 'Au moins un rôle est requis'),
});

export const updateUserProfileSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),

  avatar_url: z.string()
    .url('URL invalide')
    .max(500, 'L\'URL est trop longue')
    .optional(),

  status: z.enum(['active', 'inactive', 'suspended'])
    .optional(),
});

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserRolesData = z.infer<typeof updateUserRolesSchema>;
export type UpdateUserProfileData = z.infer<typeof updateUserProfileSchema>;
