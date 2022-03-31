import { readFileSync, existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { Config } from './types';
import { Path } from '../../types';
import { resolve } from 'path';

/**
 * Checks if the snyk policy file exists in the provided path
 * @param {string} policyPath - the path of the policy file.
 * @returns {[boolean, Object]} - snyk policy file is present or not and the error in case of failure
 */
export function exists(policyPath: string): boolean {
  return existsSync(policyPath);
}

/**
 * Parses the snyk policy file content
 * @param {string} policyPath - the path of the policy file.
 * @returns {Object} - the content of the policy file
 */
export function parse(policyPath: string): Config {
  return parseYaml(readFileSync(policyPath, 'utf-8'));
}

/**
 * Resolves an array of paths relative to the basedir
 * @param {string} basedir - the basedir used for resolving the paths
 * @param {Array} paths - the paths to be resolved
 * @returns {Array} - the resolved paths
 */
export function toAbsolutePaths(
  basedir: string,
  paths: readonly string[] = [],
): Path[] {
  return paths.map((p) => resolve(basedir, p));
}

/**
 * Resolves an array of paths relative to the basedir
 * @param {string} expires - date string
 * @returns {boolean} - whether or not the provided date has expired
 */
export function hasExpired(expires?: string | null): boolean {
  if (expires === null || expires === undefined) {
    return false;
  }

  if (isNaN(Date.parse(expires))) {
    throw `Invalid date format provided dates should be formatted as "yyyy-MM-ddTHH:mm:ss.fffZ"`;
  }

  return new Date() > new Date(expires);
}
