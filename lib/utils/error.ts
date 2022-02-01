export enum ExitCode {
  VulnerabilitiesFound = 'VULNS',
  Error = 2,
  NoSupportedFiles = 3,
}

export function exitWith(exitCode: ExitCode, message: string): void {
  const err = new Error() as any;
  err.message = message;
  err.code = exitCode.valueOf();

  throw err;
}
