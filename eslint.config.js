// FlatCompat bridges the gap between eslintrc-style configs and the newer flat config format
import { FlatCompat } from "@eslint/eslintrc";
// typescript-eslint provides TypeScript-aware lint rules and config presets
import tseslint from "typescript-eslint";
// @ts-ignore — the drizzle ESLint plugin doesn't ship its own TypeScript declarations
import drizzle from "eslint-plugin-drizzle";

// Instantiate FlatCompat with the current directory as the base for resolving extends
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

// tseslint.config() returns a typed flat config array — each object is a config block
export default tseslint.config(
  {
    // Glob patterns to completely ignore during linting (no checks at all)
    ignores: [".next"],
  },
  // Extend the official Next.js ESLint config focused on Core Web Vitals performance rules
  ...compat.extends("next/core-web-vitals"),
  {
    // Restrict the following rules to TypeScript source files only
    files: ["**/*.ts", "**/*.tsx"],
    // Register the drizzle plugin so its custom rules are available below
    plugins: {
      drizzle,
    },
    // Layer TypeScript-specific recommended configs on top of the Next.js base
    extends: [
      // Standard recommended TS rules (error prevention)
      ...tseslint.configs.recommended,
      // Rules that require type information — catches type-level bugs
      ...tseslint.configs.recommendedTypeChecked,
      // Stylistic rules powered by type information — keeps code consistent
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      // Off: allow both Array<T> and T[] styles (default is to prefer T[])
      "@typescript-eslint/array-type": "off",
      // Off: allow both interface and type aliases freely
      "@typescript-eslint/consistent-type-definitions": "off",
      // Warn when type imports use the regular import syntax instead of inline type imports
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // Warn on declared but unused variables; ignore parameters starting with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      // Off: allow async functions that don't contain an await expression
      "@typescript-eslint/require-await": "off",
      // Error when Promises are used incorrectly (e.g. returned in places that ignore the result),
      // but exempt void-return attributes (common in React event handlers)
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      // Error: every Drizzle .delete() call must include a .where() clause to prevent accidental
      // table-wide deletes — applies to db and ctx.db references
      "drizzle/enforce-delete-with-where": [
        "error",
        { drizzleObjectName: ["db", "ctx.db"] },
      ],
      // Error: every Drizzle .update() call must include a .where() clause to prevent accidental
      // table-wide updates — applies to db and ctx.db references
      "drizzle/enforce-update-with-where": [
        "error",
        { drizzleObjectName: ["db", "ctx.db"] },
      ],
    },
  },
  {
    // Configure linter behaviour at the top level
    linterOptions: {
      // Report any eslint-disable comments that don't actually suppress a violation
      reportUnusedDisableDirectives: true,
    },
    // Configure the JavaScript parser for the project
    languageOptions: {
      parserOptions: {
        // Enable the TypeScript project service for faster type-aware linting
        projectService: true,
      },
    },
  },
);
