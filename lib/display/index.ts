import * as chalk from 'chalk';
import { debug } from '../debug';
import { createFromJSON } from '@snyk/dep-graph';
import { Options, ScanResult, TestResult } from '../types';
import {
  displaySignatures,
  selectDisplayStrategy,
  displayErrors,
} from './display';

export async function display(
  scanResults: ScanResult[],
  testResults: TestResult[],
  errors: string[],
  options?: Options,
): Promise<string> {
  try {
    const result: string[] = [];
    if (options?.path) {
      const prefix = chalk.bold.white(`\nTesting ${options.path}...\n`);
      result.push(prefix);
    }
    if (options?.debug) {
      const signatureLines = displaySignatures(scanResults);
      result.push(...signatureLines);
    }
    for (const testResult of testResults) {
      const depGraph = createFromJSON(testResult.depGraphData);
      const [dependencySection, issuesSection] = selectDisplayStrategy(
        options,
        depGraph,
        testResult,
      );

      result.push(...dependencySection, ...issuesSection);
    }
    const errorLines = displayErrors(errors);
    result.push(...errorLines);
    return result.join('\n');
  } catch (error) {
    debug(error.message || 'Error displaying results. ' + error);
    return 'Error displaying results.';
  }
}
