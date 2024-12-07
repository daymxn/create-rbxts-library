/**
 * @license
 * Copyright 2024 Daymon Littrell-Reyes
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import eslint from "@eslint/js";
import notice from "eslint-plugin-notice";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginUnicorn.configs["flat/recommended"],
  {
    plugins: {
      notice,
    },
    // General rules
    rules: {
      camelcase: "off",
      "max-params": "off",
      "no-undef-init": "warn",
      "notice/notice": [
        "error",
        {
          templateFile: "assets/license-header.txt",
          templateVars: { NAME: "Daymon Littrell-Reyes" },
          varRegexps: { NAME: /.+/ },
          messages: {
            whenFailedToMatch: "Missing license header.",
          },
        },
      ],
      "prefer-const": [
        "warn",
        {
          destructuring: "all",
        },
      ],
    },
  },
  {
    // Rules for @typescript-eslint
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/adjacent-overload-signatures": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
  {
    // Rules for unicorn
    rules: {
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/prefer-string-slice": "off",
      "unicorn/consistent-destructuring": "warn",
      "unicorn/no-empty-file": "warn",
      "unicorn/catch-error-name": [
        "warn",
        {
          name: "e",
        },
      ],
      "unicorn/no-useless-undefined": [
        "warn",
        {
          checkArguments: false,
        },
      ],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: {
          allowDefaultProject: ["*.js", "*.mjs", "*.ts"],
          defaultProject: "tsconfig.json",
        },
      },
    },
  },
  {
    ignores: ["out", "dist"],
  },
);
