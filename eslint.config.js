// Flat ESLint config for smolbench.
// Node + ES modules, recommended rules, a few project tweaks.

import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "prefer-const": "warn",
      "eqeqeq": ["error", "smart"],
    },
  },
  {
    ignores: ["node_modules/", ".smolbench/", "coverage/", "dist/"],
  },
];
