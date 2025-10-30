/**
 * Tests de validation des projets
 * Vérifie que Zod valide correctement les données
 */

import { describe, it, expect } from 'vitest';
import { projectSchema, generateSlug } from './project';

describe('Project Validation', () => {
  describe('projectSchema', () => {
    it('should accept valid project data', () => {
      const validProject = {
        title: 'Réfection toiture ardoise',
        slug: 'refection-toiture-ardoise',
        location: 'Strasbourg, Bas-Rhin',
        date: 'Octobre 2024',
        description: 'Réfection complète d\'une toiture en ardoise naturelle avec isolation renforcée.',
        published: true,
        featured: false,
        categories: ['123e4567-e89b-12d3-a456-426614174000'],
        gallery_layout: 'grid' as const,
      };

      const result = projectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it('should reject project without title', () => {
      const invalid = {
        slug: 'test',
        location: 'Strasbourg',
        date: '2024',
        description: 'Test description',
        categories: ['123e4567-e89b-12d3-a456-426614174000'],
      };

      const result = projectSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid slug format', () => {
      const invalid = {
        title: 'Test Project',
        slug: 'Invalid Slug With Spaces',
        location: 'Strasbourg',
        date: '2024',
        description: 'Test description',
        categories: ['123e4567-e89b-12d3-a456-426614174000'],
      };

      const result = projectSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject short description', () => {
      const invalid = {
        title: 'Test Project',
        slug: 'test-project',
        location: 'Strasbourg',
        date: '2024',
        description: 'Too short',
        categories: ['123e4567-e89b-12d3-a456-426614174000'],
      };

      const result = projectSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should require at least one category', () => {
      const invalid = {
        title: 'Test Project',
        slug: 'test-project',
        location: 'Strasbourg',
        date: '2024',
        description: 'Valid description with enough characters',
        categories: [],
      };

      const result = projectSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimal = {
        title: 'Test Project',
        slug: 'test-project',
        location: 'Strasbourg',
        date: '2024',
        description: 'Valid description with enough characters',
        categories: ['123e4567-e89b-12d3-a456-426614174000'],
      };

      const result = projectSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it('should validate gallery_layout enum', () => {
      const validGrid = {
        title: 'Test',
        slug: 'test',
        location: 'Test',
        date: '2024',
        description: 'Valid description',
        categories: ['123e4567-e89b-12d3-a456-426614174000'],
        gallery_layout: 'grid',
      };

      const validBeforeAfter = {
        ...validGrid,
        gallery_layout: 'before-after',
      };

      expect(projectSchema.safeParse(validGrid).success).toBe(true);
      expect(projectSchema.safeParse(validBeforeAfter).success).toBe(true);
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slug from French title', () => {
      expect(generateSlug('Réfection toiture ardoise')).toBe('refection-toiture-ardoise');
    });

    it('should remove accents', () => {
      expect(generateSlug('Étanchéité EPDM')).toBe('etancheite-epdm');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Zinc & Cuivre (Premium)')).toBe('zinc-cuivre-premium');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Multiple    Spaces')).toBe('multiple-spaces');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(generateSlug('  -Test Project-  ')).toBe('test-project');
    });

    it('should convert to lowercase', () => {
      expect(generateSlug('UPPERCASE TITLE')).toBe('uppercase-title');
    });
  });
});
