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

import chalk from "chalk";

export const Colors = {
  symbol: chalk.hex("#6ad1cc"),
};

export const Regex = {
  npmName: /[^\w\d-_.)]/,
};

export const FeatureFiles = {
  api: ["wiki/docs/api", "api-extractor.json", "api", ".github/workflows/api-check.yaml"],
  wiki: ["wiki", ".github/workflows/deploy.yaml"],
  tests: ["test.project.json", "testez-companion.toml", ".github/workflows/unit-tests.yaml"],
  lua: ["stylua.toml", ".luarc"],
};

export const TemplateFiles = {
  all: [".gitattributes", "CONTRIBUTING.md", "eslint.config.ts", "package.json", "README.md", "TODO.md"],
  api: ["api-extractor.json"],
};

export const Strings = {
  templateRepo: "https://github.com/daymxn/rbxts-project-template.git",
  defaultAuthor: "Daymon Littrell-Reyes",
  defaultOrg: "daymxn",
  packagePrefix: "@rbxts",
};
