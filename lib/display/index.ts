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

  const result: string[] = [];
  let hasDependencies = false;
  let hasVulnerabilities = false;

  try {
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

      if (testResult.depGraphData.pkgs.length > 1) {
        hasDependencies = true;
      }

      if (testResult.issues.length > 0) {
        hasVulnerabilities = true;
      }

      result.push(...dependencySection, ...issuesSection);
    }
  } catch (error) {
    debug(error.message || `Error displaying the results: ${error}`);
    exitWith(ExitCode.Error, 'Error displaying results.');
  }

  if (hasVulnerabilities) {
    exitWith(ExitCode.VulnerabilitiesFound, result.join('\n'));
  }

  if (!hasDependencies) {
    result.push(`Could not detect supported target files in ${options?.path}`);
    exitWith(ExitCode.NoSupportedFiles, result.join('\n'));
  }

  return result.join('\n');
}
