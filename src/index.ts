#!/usr/bin/env node
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

// #!/usr/bin/env npx tsx --tsconfig F:\Programming\Games\Roblox\bs-cli\tsconfig.json
import chalk from "chalk";
import ejs from "ejs";
import fs from "fs-extra";
import { omitBy } from "lodash-es";
import path from "node:path";
import { simpleGit } from "simple-git";
import validate from "validate-npm-package-name";
import {
  capitalize,
  Colors,
  confirm,
  debug,
  details,
  FeatureFiles,
  info,
  input,
  Regex,
  retry,
  Strings,
  TemplateFiles,
} from "./util/index.js";

async function isValidRepoName(name: string) {
  const matches = name.match(Regex.npmName);
  if (await fs.exists(name)) {
    return "You already have a local folder with that name. Maybe you should delete it?";
  }
  if (!matches) return true;
  return `Invalid repo name. Unallowed symbol used: '${Colors.symbol(matches[0])}'`;
}

function isValidProjectName(name: string) {
  const result = validate(name);
  if (!result.validForNewPackages) {
    return capitalize(result.errors?.[0]) ?? "Invalid project name";
  }
  return true;
}

interface TemplateData {
  tests?: boolean;
  api?: boolean;
  logo?: boolean;
  lua?: boolean;
  wiki?: boolean;
  rollup?: boolean;
  packageName: string;
  repoOrg: string;
  repoName: string;
  projectAuthor: string;
  projectName: string;
  repoShort: string;
  repoUrl: string;
  year: string;
}

interface WikiProjectConfig {
  title: string;
  packageName: string;
  author: string;
  url: string;
  repo: {
    org: string;
    project: string;
  };
  features: {
    api: boolean;
  };
}

async function templateFile(name: string, data: Partial<TemplateData>) {
  const content = await ejs.renderFile(`${path.resolve(`./templates/${name}.ejs`)}`, data);

  return fs.writeFile(name, content);
}

const git = simpleGit();

async function main() {
  info("Spinning up a new rbxts library!");

  details("For starters, let's get some basic info about that library...");

  const projectName = await input("library name", {
    validate: isValidProjectName,
    template: `${Strings.packagePrefix}/%s`,
    help: "The NPM package name",
  });

  const packageName = `${Strings.packagePrefix}/${projectName}`;

  const defaultUsername = await git
    .getConfig("user.email")
    .then((it) => it.value?.split("@")[0] ?? Strings.defaultOrg)
    .catch(() => Strings.defaultOrg);

  const defaultAuthor = await git
    .getConfig("user.name")
    .then((it) => it.value ?? Strings.defaultAuthor)
    .catch(() => Strings.defaultOrg);

  const projectAuthor = await input("Author", { default: defaultAuthor, help: "Your name" });
  const repoOrg = await input("Repo org", {
    default: defaultUsername,
    help: "The GitHub org or username for the repo where this library will live",
    validate: isValidRepoName,
  });
  const repoName = await input("Repo name", {
    default: packageName.replace("@", "").replace("/", "-"),
    help: "The name of the GitHub project for this library",
    discardTemplate: true,
    validate: isValidRepoName,
  });

  details("Now let's decide which features the library will have...");

  const api = await confirm("API", { help: "Will it have a public API?" });
  // can't have a wiki without an api (at least for now)
  const wiki = api ? await confirm("Wiki", { help: "Will it have a website and wiki?" }) : false;
  const rollup = api ? await confirm("Rollup", { help: "Will it need an API rollup?", default: false }) : false;
  const tests = await confirm("Tests", { help: "Will it have unit tests?" });
  // you need a logo if you're gonna have a wiki
  const logo = wiki ? true : await confirm("Logo", { help: "Will it have a custom logo, or just text?" });
  const lua = await confirm("Lua", { help: "Will it have custom lua files?", default: false });

  const repoUrl = `https://github.com/${repoOrg}/${repoName}`;

  details("Great! Now let's create that project...");

  debug("Cloning the template repo");

  const filePath = path.resolve(process.cwd(), repoName);
  await git.clone(Strings.templateRepo, filePath, { "--depth": 1 });

  debug("Mapping repo to new repository");

  process.chdir(filePath);
  git.cwd(filePath);

  await retry(() => fs.remove(".git"));

  // eslint-disable-next-line unicorn/no-null
  await git.init({ "--initial-branch": "main", "--quiet": null });
  await git.addRemote("origin", repoUrl);

  const deletions: Promise<void>[] = [];

  if (!api) deletions.push(...FeatureFiles.api.map((it) => fs.remove(it)));
  if (!wiki) deletions.push(...FeatureFiles.wiki.map((it) => fs.remove(it)));
  if (!tests) deletions.push(...FeatureFiles.tests.map((it) => fs.remove(it)));
  if (!lua) deletions.push(...FeatureFiles.lua.map((it) => fs.remove(it)));

  debug("Setting up features");
  await Promise.all(deletions);

  if (api) await fs.ensureDir("api");

  const templateData = omitBy<TemplateData>(
    {
      packageName,
      projectName,
      projectAuthor,
      repoOrg,
      repoName,
      repoShort: `${repoOrg}/${repoName}`,
      repoUrl,
      year: new Date().getFullYear().toString(),
      tests,
      api,
      logo,
      lua,
      wiki,
      rollup,
    },
    (it) => it === false,
  );

  const templates: Promise<void>[] = [];

  templates.push(...TemplateFiles.all.map((it) => templateFile(it, templateData)));

  if (api) {
    templates.push(...TemplateFiles.api.map((it) => templateFile(it, templateData)));
  }

  debug("Populating templates");

  await Promise.all(templates);

  const wikiData: WikiProjectConfig = {
    title: projectName,
    packageName,
    author: projectAuthor,
    url: "TODO()", // should url be a step? and if you don't provide it then we do TODO() and add a TODO.md step?
    repo: {
      org: repoOrg,
      project: repoName,
    },
    features: {
      api,
    },
  };

  if (wiki) {
    await fs.writeFile("wiki/project-config.json", JSON.stringify(wikiData, undefined, 2));
  }

  const bsConfigFile = await fs.readFile("bs.config.json", "utf8");
  const bsConfig = JSON.parse(bsConfigFile);

  if (!rollup) {
    bsConfig.api.rollup = undefined;
    bsConfig.api.transformers = undefined;
    bsConfig.global.rollup = false;
  }

  if (!api) {
    bsConfig.api = undefined;
    bsConfig.docs.apiFolder = undefined;
  }

  if (!wiki) {
    bsConfig.docs = undefined;
    bsConfig.global.docs = false;
  }

  if (!tests) {
    bsConfig.tests = undefined;
  }

  await fs.writeFile("bs.config.json", JSON.stringify(bsConfig, undefined, 2));

  await fs.remove("templates");

  info(`\nProject created!

    Run the following command to get started:
    ${chalk.italic(`cd ${repoName}`)}
`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((e) => {
  if (e.name === "ExitPromptError") {
    return;
  }
  throw e;
});
