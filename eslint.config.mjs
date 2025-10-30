import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/scripts/**", // Scripts de migration non utilisés en production
    ],
  },
  {
    rules: {
      // ✅ Correction audit : Désactiver règle trop stricte sur apostrophes
      "react/no-unescaped-entities": "off",
      // ✅ Mettre en warning au lieu d'erreur pour variables non utilisées
      "@typescript-eslint/no-unused-vars": "warn",
      // ✅ Mettre en warning pour types any (à corriger progressivement)
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
