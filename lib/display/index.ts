import * as chalk from 'chalk';
import { debug } from '../debug';
import { createFromJSON } from '@snyk/dep-graph';
import { Options, ScanResult, TestResult } from '../types';
import {
  displayErrors,
  displaySignatures,
  selectDisplayStrategy,
} from './display';
import { ExitCode, exitWith } from '../utils/error';

export async function display(
  scanResults: ScanResult[],
  testResults: TestResult[],
  errors: string[],
  options?: Options,
): Promise<string> {
  if (errors.length > 0) {
    exitWith(ExitCode.Error, displayErrors(errors).join('\n'));
  }

  let result: string[] = [];

  let hasVulnerabilities = false;

  try {
    if (options?.path) {
      const prefix = chalk.bold.white(`\nTesting ${options.path}...\n`);
      result = result.concat(prefix);
    }

    if (options?.debug) {
      result = result.concat(displaySignatures(scanResults));
    }

    for (const testResult of testResults) {
      const depGraph = createFromJSON(testResult.depGraphData);
      const [dependencies, issues] = selectDisplayStrategy(
        options,
        depGraph,
        testResult,
      );

      if (testResult.issues.length > 0) {
        hasVulnerabilities = true;
      }

      result = result.concat(dependencies, issues);
    }
  } catch (error) {
    debug((error as any).message || `Error displaying the results: ${error}`);
    exitWith(ExitCode.Error, 'Error displaying results.');
  }

  const output = result.join('\n');

  if (hasVulnerabilities) {
    exitWith(ExitCode.VulnerabilitiesFound, output, testResults);
  }

  return output;
}
