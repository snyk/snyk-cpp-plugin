import * as chalk from 'chalk';

import { DepGraph, createFromJSON } from '@snyk/dep-graph';
import { Issue, IssuesData, Options, ScanResult, TestResult } from './types';

import { debug } from './debug';

function displaySignatures(scanResults: ScanResult[]): string[] {
  const result: string[] = [chalk.whiteBright('Signatures')];
  for (const { facts = [] } of scanResults) {
    for (const { data = [] } of facts) {
      for (const { path, hashes_ffm } of data) {
        if (path && hashes_ffm?.length && hashes_ffm[0].data) {
          result.push(`${hashes_ffm[0].data} ${path}`);
        }
      }
    }
  }
  if (result.length) {
    result.push('');
  }
  return result;
}
function displayDependencies(depGraph: DepGraph): string[] {
  const result: string[] = [];
  const depCount = depGraph?.getDepPkgs()?.length || 0;
  if (depCount > 0) {
    result.push(chalk.whiteBright('Dependencies\n'));
  }
  for (const pkg of depGraph?.getDepPkgs() || []) {
    result.push(leftPad(`${pkg.name}@${pkg.version}`));
  }
  if (result.length) {
    result.push('');
  }
  return result;
}

function displayIssues(
  depGraph: DepGraph,
  issues: Issue[],
  issuesData: IssuesData,
): string[] {
  const result: string[] = [];
  const pkgCount = depGraph?.getDepPkgs()?.length || 0;
  const depCount = pkgCount == 1 ? '1 dependency' : `${pkgCount} dependencies`;
  const issuesCount =
    issues.length == 1 ? '1 issue' : `${issues.length} issues`;

  if (pkgCount > 0 && issues.length > 0) {
    result.push(chalk.whiteBright('Issues'));
  }

  for (const {
    pkgName: name,
    pkgVersion: version,
    issueId: vulnId,
  } of issues) {
    const { title, severity } = issuesData[vulnId];
    let color;
    switch (severity) {
      case 'low':
        color = chalk.blueBright;
        break;
      case 'medium':
        color = chalk.yellowBright;
        break;
      case 'high':
        color = chalk.redBright;
        break;
      default:
        color = chalk.whiteBright;
        break;
    }
    const severityAndTitle = color(`\n ✗ [${severity}] ${title}`);
    const nvdUrl = `https://nvd.nist.gov/vuln/detail/${vulnId}`;
    const introducedThrough = leftPad(`Introduced through: ${name}@${version}`);
    const urlText = leftPad(`URL: ${nvdUrl}`);
    result.push(severityAndTitle);
    result.push(introducedThrough);
    result.push(urlText);
  }

  if (issues.length) {
    result.push('');
  }

  const issuesFound =
    issues.length > 0
      ? chalk.redBright(issuesCount)
      : chalk.greenBright(issuesCount);

  const identifiedUnmanagedDeps = `Tested ${depCount} for known issues, found ${issuesFound}.\n`;
  const failedToIdentifyUnmanagedDeps = `\nCould not identify unmanaged dependencies to be tested.`;

  const endlineMsg =
    pkgCount > 0 ? identifiedUnmanagedDeps : failedToIdentifyUnmanagedDeps;

  result.push(endlineMsg);

  return result;
}

function displayErrors(errors: string[]): string[] {
  const result: string[] = [];
  if (errors.length) {
    result.push(chalk.redBright('Errors'));
  }
  for (const error of errors) {
    result.push(error);
  }
  if (result.length) {
    result.push('');
  }
  return result;
}

export async function display(
  scanResults: ScanResult[],
  testResults: TestResult[],
  errors: string[],
  options?: Options,
): Promise<string> {
  try {
    const result: string[] = [];
    if (options?.debug) {
      const signatureLines = displaySignatures(scanResults);
      result.push(...signatureLines);
    }
    for (const testResult of testResults) {
      const depGraph = createFromJSON(testResult.depGraphData);
      const dependencyLines = displayDependencies(depGraph);
      result.push(...dependencyLines);
      const issueLines = displayIssues(
        depGraph,
        testResult.issues,
        testResult.issuesData,
      );
      result.push(...issueLines);
    }
    const errorLines = displayErrors(errors);
    result.push(...errorLines);
    return result.join('\n');
  } catch (error) {
    debug(error.message || 'Error displaying results. ' + error);
    return 'Error displaying results.';
  }
}

export function leftPad(text: string, padding = 4): string {
  return padding <= 0 ? text : ' '.repeat(padding) + text;
}
