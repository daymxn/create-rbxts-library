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

export interface RetryOptions {
  retries?: number;
  timeout?: number;
  delay?: number;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(callback: () => T, options: RetryOptions = {}): Promise<T> {
  const timeout = options.timeout ?? 5000;
  const retries = options.retries ?? (timeout ? Number.MAX_SAFE_INTEGER : 10);
  const delay = options.delay ?? 100;

  let attemptsLeft = retries;
  let mostRecentError: Error;

  let timeSlept = 0;

  do {
    try {
      const value = await callback();
      return value;
    } catch (e) {
      mostRecentError = e as Error;
    }
    attemptsLeft -= 1;
    timeSlept += delay;
    await sleep(delay);
  } while (attemptsLeft > 0 && timeSlept < timeout);

  throw mostRecentError;
}
