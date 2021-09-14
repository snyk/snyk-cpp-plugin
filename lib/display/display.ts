import * as chalk from 'chalk';
import { DepGraph } from '@snyk/dep-graph';
import {
  DepsFilePaths,
  Issue,
  IssuesData,
  Options,
  ScanResult,
  TestResult,
} from '../types';
import { getColorBySeverity, leftPad } from './common';

export function displaySignatures(scanResults: ScanResult[]): string[] {
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

  const emptyDependencySection = '';

  return isAllowedToShowDependencies
    ? displayDependencies(depGraph)
    : [emptyDependencySection];
}

export function selectDisplayStrategy(
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

export function displayDependencies(depGraph: DepGraph): string[] {
  const result: string[] = [];
  const dependencies = depGraph?.getDepPkgs();
  const hasDependencies = dependencies?.length > 0;

  if (!hasDependencies) {
    return result;
  }

  result.push(chalk.whiteBright('\nDependencies:\n'));
  for (const { name, version } of dependencies || []) {
    result.push(leftPad(`${name}@${version}`, 2));
  }

  if (result.length) {
    result.push('');
  }
  return result;
}

export function displayDependenciesWithFilePaths(
  depGraph: DepGraph,
  depsFilePaths?: DepsFilePaths,
): string[] {
  let result: string[] = [];
  const dependencies = depGraph?.getDepPkgs();
  const hasDependencies = dependencies?.length > 0;

  if (!hasDependencies) {
    return result;
  }

  result.push(chalk.whiteBright('\nDependencies:'));
  for (const { name, version } of dependencies) {
    const dependencyId = `${name}@${version}`;
    result.push(`\n${leftPad(dependencyId, 2)}`);

    if (depsFilePaths && depsFilePaths[dependencyId]) {
      const displayDepsFilePathsOutput = displayDepsFilePaths(
        depsFilePaths,
        dependencyId,
      );
      result = [...result, ...displayDepsFilePathsOutput];
    }
  }
  result.push('');
  return result;
}

function displayDepsFilePaths(
  depsFilePaths: DepsFilePaths,
  dependencyId: string,
): string[] {
  const maxFilePathsToBeDisplayed = 3;
  const result: string[] = [];
  result.push(`${leftPad('matching files:', 2)}`);
  const filePathsToDisplay = depsFilePaths[dependencyId].slice(
    0,
    maxFilePathsToBeDisplayed,
  );

  for (const filePathToDisplay of filePathsToDisplay) {
    result.push(leftPad(`- ${filePathToDisplay}`, 4));
  }

  const hasToHideAndSayDepsFilePathsCount =
    depsFilePaths[dependencyId].length > 3;
  if (hasToHideAndSayDepsFilePathsCount) {
    result.push(
      leftPad(
        `... and ${depsFilePaths[dependencyId].length -
          maxFilePathsToBeDisplayed} more files`,
        4,
      ),
    );
  }

  return result;
}

export function displayIssues(
  depGraph: DepGraph,
  issues: Issue[],
  issuesData: IssuesData,
): string[] {
  const result: string[] = [];
  const dependencies = depGraph?.getDepPkgs();
  const dependenciesCountMsg =
    dependencies?.length == 1
      ? '1 dependency'
      : `${dependencies?.length} dependencies`;

  const issuesCount =
    issues.length == 1 ? '1 issue' : `${issues.length} issues`;

  const hasIssues = issues.length > 0;

  if (hasIssues) {
    result.push(chalk.whiteBright('Issues:'));
    for (const {
      pkgName: name,
      pkgVersion: version,
      issueId: vulnId,
    } of issues) {
      const { title, severity } = issuesData[vulnId];
      const color = getColorBySeverity(severity);
      const severityAndTitle = color(`\n ✗ [${severity}] ${title}`);
      const nvdUrl = `https://nvd.nist.gov/vuln/detail/${vulnId}`;
      const introducedThrough = leftPad(
        `Introduced through: ${name}@${version}`,
      );
      const urlText = leftPad(`URL: ${nvdUrl}`);
      result.push(severityAndTitle);
      result.push(introducedThrough);
      result.push(urlText);
    }
    result.push('');
  }

  const issuesFound = hasIssues
    ? chalk.redBright(issuesCount)
    : chalk.greenBright(issuesCount);

  const identifiedUnmanagedDeps = `Tested ${dependenciesCountMsg} for known issues, found ${issuesFound}.\n`;
  const failedToIdentifyUnmanagedDeps = `Could not identify unmanaged dependencies to be tested.`;

  const endlineMsg =
    dependencies?.length > 0
      ? identifiedUnmanagedDeps
      : failedToIdentifyUnmanagedDeps;

  result.push(endlineMsg);

  return result;
}

export function displayErrors(errors: string[]): string[] {
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
