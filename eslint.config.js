import ts from "typescript";
import { config as base } from "./eslint-config/base";
import tseslint from 'typescript-eslint';

/** @type {import("eslint").Linter.Config[]} */

export default tseslint.configs.mergeConfigs([
  base,
  {
    rules: {
      "no-console": "warn",
      "semi": ["error", "always"],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-unused-expressions": "off",
    },
  },
  {
    files: ["scripts/**.ts"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    parserOptions: {
      project: true,
      tsconfigRootDir: ts.sys.getCurrentDirectory(),
      dirname,
    },
  },
]);
