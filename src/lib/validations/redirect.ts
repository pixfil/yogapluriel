import { z } from 'zod';

/**
 * Schéma de validation pour les redirections 301
 * Utilisé par /api/admin/redirects/route.ts
 */
export const createRedirectSchema = z.object({
  from_path: z.string()
    .min(1, 'Le chemin source est requis')
    .max(500, 'Le chemin source est trop long')
    .regex(/^\/[a-zA-Z0-9\-\/_\.~!$&'()*+,;=:@%?#]*$/, 'Le chemin doit commencer par / et contenir des caractères valides d\'URL'),

  to_path: z.string()
    .min(1, 'Le chemin destination est requis')
    .max(500, 'Le chemin destination est trop long')
    .regex(/^\/[a-zA-Z0-9\-\/_\.~!$&'()*+,;=:@%?#]*$/, 'Le chemin doit commencer par / et contenir des caractères valides d\'URL'),

  status_code: z.union([
    z.literal(301),
    z.literal(302),
    z.literal(307),
    z.literal(308),
    z.literal('301'),
    z.literal('302'),
    z.literal('307'),
    z.literal('308'),
  ]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val),

  notes: z.string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional(),

  is_active: z.boolean()
    .optional()
    .default(true),

  is_wildcard: z.boolean()
    .optional()
    .default(false),
});

export const updateRedirectSchema = z.object({
  from_path: z.string()
    .min(1)
    .max(500)
    .regex(/^\/[a-zA-Z0-9\-\/_\.~!$&'()*+,;=:@%?#]*$/)
    .optional(),

  to_path: z.string()
    .min(1)
    .max(500)
    .regex(/^\/[a-zA-Z0-9\-\/_\.~!$&'()*+,;=:@%?#]*$/)
    .optional(),

  status_code: z.union([
    z.literal(301),
    z.literal(302),
    z.literal(307),
    z.literal(308),
    z.literal('301'),
    z.literal('302'),
    z.literal('307'),
    z.literal('308'),
  ]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .optional(),

  notes: z.string()
    .max(1000)
    .optional(),

  is_active: z.boolean()
    .optional(),

  is_wildcard: z.boolean()
    .optional(),
});

export type CreateRedirectData = z.infer<typeof createRedirectSchema>;
export type UpdateRedirectData = z.infer<typeof updateRedirectSchema>;
