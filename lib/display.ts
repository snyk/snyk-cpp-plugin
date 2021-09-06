import * as chalk from 'chalk';

import { DepGraph, createFromJSON } from '@snyk/dep-graph';
import {
  DepsFilePaths,
  Issue,
  IssuesData,
  Options,
  ScanResult,
  TestResult,
} from './types';

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

function findDependencyLines(
  depGraph: DepGraph,
  options: Options | undefined,
  depsFilePaths?: DepsFilePaths,
) {
  const showDepsFilePaths = (options && options['print-dep-paths']) || false;
  const isAllowedToShowDependenciesWithFilePaths =
    showDepsFilePaths && depsFilePaths && Object.keys(depsFilePaths).length > 0;

  if (isAllowedToShowDependenciesWithFilePaths) {
    return displayDependenciesWithFilePaths(depGraph, depsFilePaths);
  }

  const isAllowedToShowDependencies =
    (options && options['print-deps']) || false;

  const emptyDependencySection = '\n';

  return isAllowedToShowDependencies
    ? displayDependencies(depGraph)
    : [emptyDependencySection];
}

export async function 
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

export function leftPad(text: string, padding: number = 4): string {
  return padding <= 0 ? text : ' '.repeat(padding) + text;
}

function selectDisplayStrategy(
  options: Options | undefined,
  depGraph: DepGraph,
  testResult: TestResult,
) {
  const { depsFilePaths, issues, issuesData } = testResult;
  const dependencySection = findDependencyLines(
    depGraph,
    options,
    depsFilePaths,
  );
  const issuesSection = displayIssues(depGraph, issues, issuesData);
  return [dependencySection, issuesSection];
}

function displayDependencies(depGraph: DepGraph): string[] {
  const result: string[] = [];
  const depCount = depGraph?.getDepPkgs()?.length || 0;
  if (depCount > 0) {
    result.push(chalk.whiteBright('\nDependencies:\n'));
  }

  for (const pkg of depGraph?.getDepPkgs() || []) {
    result.push(leftPad(`${pkg.name}@${pkg.version}`, 2));
  }

  if (result.length) {
    result.push('');
  }
  return result;
}

function displayDependenciesWithFilePaths(
  depGraph: DepGraph,
  depsFilePaths?: DepsFilePaths,
): string[] {
  const result: string[] = [];
  const depCount = depGraph?.getDepPkgs()?.length || 0;
  if (depCount > 0) {
    result.push(chalk.whiteBright('\nDependencies:'));
  }
  const maxFilePathsToBeDisplayed = 3;
  for (const pkg of depGraph?.getDepPkgs() || []) {
    const pkgId = `${pkg.name}@${pkg.version}`;

    result.push(`\n${leftPad(pkgId, 2)}`);

    if (depsFilePaths && depsFilePaths[pkgId]) {
      result.push(`${leftPad('matching files:', 2)}`);
      const filePathsToDisplay = depsFilePaths[pkgId].slice(
        0,
        maxFilePathsToBeDisplayed,
      );

      for (const filePathToDisplay of filePathsToDisplay) {
        result.push(leftPad(`- ${filePathToDisplay}`, 4));
      }

      const hasToHideAndSayDepsFilePathsCount = depsFilePaths[pkgId].length > 3;
      if (hasToHideAndSayDepsFilePathsCount) {
        result.push(
          leftPad(
            `... and ${depsFilePaths[pkgId].length -
              maxFilePathsToBeDisplayed} more files`,
            4,
          ),
        );
      }
    }
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
    result.push(chalk.whiteBright('Issues:'));
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
