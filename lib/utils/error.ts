import { TestResult } from '../types';

export enum ExitCode {
  VulnerabilitiesFound = 'VULNS',
  Error = 2,
  NoSupportedFiles = 3,
}

export function exitWith(
  exitCode: ExitCode,
  message: string,
  testResults: TestResult[] = [],
): void {
  const err = new Error() as any;
  err.message = message;
  err.userMessage = message;
  err.code = exitCode.valueOf();

  if (0 < testResults.length) {
    const jsonData = testResults.length === 1 ? testResults[0] : testResults;
    err.jsonStringifiedResults = JSON.stringify(jsonData);
  }

  throw err;
}
