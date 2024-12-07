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

import { confirm as confirmPrompt, input as inputPrompt } from "@inquirer/prompts";
import chalk from "chalk";
import { format } from "node:util";

interface InputOptions {
  validate?: (str: string) => boolean | string | Promise<boolean | string>;
  transformer?: (str: string, isFinal: boolean) => string;
  template?: string;
  prefix?: string;
  default?: string;
  discardTemplate?: boolean;
  clear?: boolean;
  help?: string;
}

interface ConfirmOptions {
  default?: boolean;
  help?: string;
}

type Tranformer = (
  value: string,
  options: {
    isFinal: boolean;
  },
) => string;

const theme = (help?: string) => ({
  style: {
    defaultAnswer: (text: string) => chalk.gray(text),
    message: (text: string, status: string) => {
      if (!help || status === "done") return chalk.bold(text);
      return `${chalk.bold(text)} ${chalk.italic.yellowBright(`(${help})`)}\n`;
    },
  },
});

function makeTransformer(options: InputOptions): Tranformer | undefined {
  const { transformer, template, prefix, discardTemplate } = options;

  return (str: string, { isFinal }) => {
    if (transformer) {
      return transformer(str, isFinal);
    } else if (template) {
      if (discardTemplate && isFinal) {
        return chalk.gray(str);
      }

      return isFinal ? chalk.gray(format(template, str)) : chalk.gray(format(template, chalk.blueBright(str)));
    } else if (prefix) {
      return isFinal ? chalk.gray(`${prefix}${str}`) : chalk.gray(prefix, chalk.blueBright(str));
    } else {
      return isFinal ? chalk.gray(str) : chalk.blueBright(str);
    }
  };
}

export async function input(message: string, options: InputOptions = {}) {
  const transformer = makeTransformer(options);

  const response = await inputPrompt(
    {
      message: `${message}:`,
      validate: (str) => {
        if (str.trim().length === 0) return "You can't leave it empty.";
        return options.validate?.(str) ?? true;
      },
      transformer,
      required: true,
      default: options.default,
      theme: theme(options.help),
    },
    {
      clearPromptOnDone: options.clear,
    },
  );

  return options.prefix ? `${options.prefix}/${response}` : response;
}

export async function confirm(message: string, options: ConfirmOptions = {}) {
  return confirmPrompt({
    message,
    default: options.default,
    theme: theme(options.help),
  });
}
