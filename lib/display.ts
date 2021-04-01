import * as chalk from 'chalk';
import { createFromJSON, DepGraph } from '@snyk/dep-graph';
import { debug } from './debug';
import { ScanResult, TestResult, IssuesData, Issue, Options } from './types';

function displayFingerprints(scanResults: ScanResult[]): string[] {
  const result: string[] = [];
  for (const { facts = [] } of scanResults) {
    for (const { data = [] } of facts) {
      for (const { filePath, hash } of data) {
        if (filePath && hash) {
          if (!result.length) {
            result.push(chalk.whiteBright('Fingerprints'));
          }
          result.push(`${hash} ${filePath}`);
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
  for (const { pkgName, pkgVersion, issueId, fixInfo } of issues) {
    const { title, severity } = issuesData[issueId];
    const fix = fixInfo.nearestFixedInVersion
      ? `fix version ${fixInfo.nearestFixedInVersion}`
      : 'no fix available';
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
    const issueUrl = `https://snyk.io/vuln/${issueId}`;
    const issueText = color(`✗ ${title} [${severity}]`);
    result.push(issueText);
    result.push(`  ${issueUrl}`);
    result.push(`  in ${pkgName}@${pkgVersion}`);
    result.push(`  ${fix}`);
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

interface Result {
  scanResult: ScanResult;
  testResult: TestResult;
}
export async function display(
  results: Result[],
  errors: string[],
  options?: Options,
): Promise<string> {
  try {
    const result: string[] = [];
    if (options?.debug) {
      const fingerprintLines = displayFingerprints(
        results.map((i) => i.scanResult),
      );
      result.push(...fingerprintLines);
    }
    for (const res of results) {
      const { testResult } = res;
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
