import * as chalk from 'chalk';
import { debug } from './debug';
import { DepGraph, createFromJSON } from '@snyk/dep-graph';
import { Issue, IssuesData, Options, ScanResult, TestResult } from './types';

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
    result.push(chalk.whiteBright('Dependencies'));
  }
  for (const pkg of depGraph?.getDepPkgs() || []) {
    result.push(`${pkg.name}@${pkg.version}`);
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
  result.push(chalk.whiteBright('Issues'));
  for (const { pkgName, pkgVersion, issueId } of issues) {
    const { title, severity } = issuesData[issueId];

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
    const issueText = color(`\n ✗ [${severity}] ${title}`);
    const issueUrl = `https://nvd.nist.gov/vuln/detail/${issueId}`;
    const introducedThrough = ` Introduced through: ${pkgName}@${pkgVersion}`;
    const vulnUrl = ` URL: ${issueUrl}`;
    result.push(issueText);
    result.push(introducedThrough);
    result.push(vulnUrl);
  }
  if (issues.length) {
    result.push('');
  }
  const issuesFound =
    issues.length > 0
      ? chalk.redBright(issuesCount)
      : chalk.greenBright(issuesCount);
  result.push(`Tested ${depCount} for known issues, found ${issuesFound}.\n`);
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
      const fingerprintLines = displaySignatures(scanResults);
      result.push(...fingerprintLines);
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
