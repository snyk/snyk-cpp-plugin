import { ScanResult, TestResults } from './types';
import { createFromJSON } from '@snyk/dep-graph';

export async function display(
  scanResults: ScanResult[],
  testResults: TestResults[],
): Promise<string> {
  const result = [];
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
  if (result.length) {
    result.push('');
  }
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
    result.push(`Tested ${dependencies} for known issues, found ${issues}.\n`);
    for (const { pkg, issues } of Object.values(
      testResult.affectedPkgs || [],
    )) {
      for (const issueId of Object.keys(issues)) {
        const issue = testResult.issuesData[issueId];
        result.push(
          `✗ ${issue.title} [${issue.severity} severity][https://snyk.io/vuln/${issue.id}] in ${pkg.name}@${pkg.version}`,
        );
      }
    }
  }
  return result.join('\n');
}
