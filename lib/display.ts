import { ScanResult, TestResult } from './types';
import { createFromJSON } from '@snyk/dep-graph';
import Debug from 'debug';

const debug = Debug('snyk-cpp-plugin');

function displayFingerprints(scanResults: ScanResult[]): string[] {
  const result: string[] = [];
  for (const { artifacts = [] } of scanResults) {
    for (const { data = [] } of artifacts) {
      for (const { filePath, hash } of data) {
        if (filePath && hash) {
          if (!result.length) {
            result.push('Dependency Fingerprints');
            result.push('-----------------------');
          }
          result.push(`${hash} ${filePath}`);
        }
      }
    }
  }
  return result;
}

function displayTestResults(testResults: TestResult[]): string[] {
  const result: string[] = [];
  for (const testResult of testResults) {
    const depGraph = createFromJSON(testResult.depGraph);
    const depCount = depGraph?.getDepPkgs()?.length || 0;
    const dependencies =
      depCount == 1 ? '1 dependency' : `${depCount} dependencies`;
    const issueCount = Object.keys(testResult.issuesData || {}).length;
    const issues = issueCount == 1 ? '1 issue' : `${issueCount} issues`;
    if (depCount > 0) {
      result.push('Dependencies');
      result.push('------------');
    }
    for (const pkg of depGraph?.getDepPkgs() || []) {
      result.push(`${pkg.name}@${pkg.version}`);
    }
    if (depCount > 0) {
      result.push('');
    }
    result.push('Issues');
    result.push('------');
    result.push(`Tested ${dependencies} for known issues, found ${issues}.`);

    const affectedPkgs = Object.values(testResult.affectedPkgs || []);
    if (affectedPkgs.length) {
      result.push('');
    }
    for (const { pkg, issues } of affectedPkgs) {
      for (const issueId of Object.keys(issues)) {
        const issue = testResult.issuesData[issueId];
        result.push(
          `✗ ${issue.title} [${issue.severity} severity][https://snyk.io/vuln/${issue.id}] in ${pkg.name}@${pkg.version}`,
        );
      }
    }
  }
  return result;
}

function displayErrors(errors: string[]): string[] {
  const result: string[] = [];
  if (errors.length) {
    result.push('Errors');
    result.push('------');
  }
  for (const error of errors) {
    result.push(error);
  }
  return result;
}

export async function display(
  scanResults: ScanResult[],
  testResults: TestResult[],
  errors: string[],
): Promise<string> {
  try {
    const result = displayFingerprints(scanResults);
    if (result.length) {
      result.push('');
    }
    result.push(...displayTestResults(testResults));
    if (errors.length && result.length) {
      result.push('');
    }
    result.push(...displayErrors(errors));
    if (result.length) {
      result.push('');
    }
    return result.join('\n');
  } catch (error) {
    debug(error.message || 'Error displaying results. ' + error);
    return 'Error displaying results.';
  }
}
