/**
 * Tests de validation des variables d'environnement
 * Vérifie que les variables sont correctement validées au démarrage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { isDefined, getEnvOrDefault } from './env';

describe('Environment Variables', () => {
  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined('value')).toBe(true);
      expect(isDefined(123)).toBe(true);
      expect(isDefined(true)).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined(0)).toBe(true);
    });

    it('should return false for undefined values', () => {
      expect(isDefined(undefined)).toBe(false);
      expect(isDefined(null)).toBe(false);
      expect(isDefined('')).toBe(false);
    });
  });

  describe('getEnvOrDefault', () => {
    it('should return value if defined', () => {
      expect(getEnvOrDefault('actual', 'default')).toBe('actual');
      expect(getEnvOrDefault(123, 456)).toBe(123);
    });

    it('should return default if undefined', () => {
      expect(getEnvOrDefault(undefined, 'default')).toBe('default');
      expect(getEnvOrDefault(null, 'default')).toBe('default');
      expect(getEnvOrDefault('', 'default')).toBe('default');
    });
  });

  // Note: On ne teste pas validateEnv() directement car elle crash si les vars sont invalides
  // Les tests d'intégration réels devraient être faits dans un environnement isolé
});
