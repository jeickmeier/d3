// .eslint.config.js – Flat config for Next JS + TypeScript + Prettier
import globals         from "globals/index.js";
import tseslint         from "typescript-eslint";
import reactPlugin      from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin    from "eslint-plugin-jsx-a11y";
import importPlugin     from "eslint-plugin-import";
import nextPlugin       from "@next/eslint-plugin-next";
import prettierPlugin   from "eslint-plugin-prettier";
import js               from "@eslint/js";

//------------------------------------------------------------------------------
// Helper: gather all custom rules / overrides in one place so they are applied
// after any preset that might otherwise set the same rule.
//------------------------------------------------------------------------------
const projectTweaks = {
  rules: {
    /* React / Next */
    "react/react-in-jsx-scope": "off", // not needed with React ≥17
    "react/prop-types": "off", // using TypeScript instead
    "@next/next/no-page-custom-font": "off", // allow @font-face

    /* TS */
    "@typescript-eslint/no-explicit-any": ["warn", { ignoreRestArgs: true }],

    /* Imports */
    /*"import/order": ["warn", { "newlines-between": "always" }],*/

    /* Prettier – show red squiggles when file not formatted */
    "prettier/prettier": "error",
  },
};

//------------------------------------------------------------------------------
// Export the final flat config using typescript-eslint's helper.
//------------------------------------------------------------------------------

export default tseslint.config(
  // 1. Base JS rules
  js.configs.recommended,

  // 2. TypeScript rules that need type-checking
  ...tseslint.configs.recommendedTypeChecked,

  // 3. React (flat) rules
  reactPlugin.configs.flat.recommended,

  // 4. Next.js rules (flat)
  nextPlugin.flatConfig.coreWebVitals,

  // 5. Our own base setup adding parser, plugins, etc.
  {
    files: ["**/*.{js,cjs,mjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // full type-checking
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
      "@next/next": nextPlugin,
      prettier: prettierPlugin,
    },
  },

  // 6. Project-specific manual tweaks (must come last)
  projectTweaks,
);
