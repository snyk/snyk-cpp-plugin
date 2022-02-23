import * as chalk from 'chalk';
import { DepGraph } from '@snyk/dep-graph';
import {
  DepsFilePaths,
  Issue,
  IssuesData,
  Options,
  ScanResult,
  TestResult,
  FileSignaturesDetails,
} from '../types';
import { capitalize, getColorBySeverity, leftPad } from './common';
import { isEmpty } from '../utils/object';

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
  fileSignaturesDetails?: FileSignaturesDetails,
): string[] {
  const displayDepsWithPaths = (options && options['print-dep-paths']) || false;
  const displayDeps = (options && options['print-deps']) || false;

  if (displayDepsWithPaths) {
    return displayDependencies(depGraph, fileSignaturesDetails, depsFilePaths);
  } else if (displayDeps) {
    return displayDependencies(depGraph, fileSignaturesDetails);
  }

  return [];
}

export function selectDisplayStrategy(
  options: Options | undefined,
  depGraph: DepGraph,
  testResult: TestResult,
): string[][] {
  const {
    depsFilePaths,
    issues,
    issuesData,
    fileSignaturesDetails,
  } = testResult;
  const dependencySection = findDependencyLines(
    depGraph,
    options,
    depsFilePaths,
    fileSignaturesDetails,
  );
  const issuesSection = displayIssues(depGraph, issues, issuesData);
  return [dependencySection, issuesSection];
}

function computeDependencyName(name: string, version?: string): string {
  return `${name}@${version || 'unknown'}`;
}

function computeDependencyId(name: string, version?: string): string {
  return `${name}@${version || ''}`;
}

export function displayDependencies(
  depGraph: DepGraph,
  fileSignaturesDetails?: FileSignaturesDetails,
  depsFilePaths: DepsFilePaths = {},
): string[] {
  let result: string[] = [];
  const dependencies = depGraph?.getDepPkgs();
  const hasDependencies = dependencies?.length > 0;

  if (!hasDependencies) {
    return result;
  }

  result.push(chalk.whiteBright('\nDependencies:\n'));
  for (const { name, version } of dependencies) {
    const dependencyId = computeDependencyId(name, version);
    const dependencyName = computeDependencyName(name, version);

    result.push(`\n${leftPad(dependencyName, 2)}`);

    if (
      fileSignaturesDetails &&
      fileSignaturesDetails[dependencyId]?.confidence
    ) {
      result.push(
        leftPad(
          `confidence: ${fileSignaturesDetails[dependencyId].confidence.toFixed(
            3,
          )}`,
          2,
        ),
      );
    }

    if (!isEmpty(depsFilePaths)) {
      const displayDepsFilePathsOutput = displayDepsFilePaths(
        depsFilePaths,
        dependencyId,
      );
      result = [...result, ...displayDepsFilePathsOutput];
    }
  }

  if (result.length) {
    result.push('');
  }
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

  if (depsFilePaths[dependencyId].length > 3) {
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
      const severityAndTitle = color(`\n ✗ [${capitalize(severity)}] ${title}`);
      const dependencyName = computeDependencyName(name, version);
      const vulnDetailsUrl = `https://security.snyk.io/vuln/${vulnId}`;

      const introducedThrough = leftPad(
        `Introduced through: ${dependencyName}`,
      );

      const urlText = leftPad(`URL: ${vulnDetailsUrl}`);

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
  if (dependencies?.length > 0) {
    result.push(identifiedUnmanagedDeps);
  }

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
