import { ExitCode, exitWith } from '../../lib/utils/error';

describe('exitWith', () => {
  it.each([
    [
      ExitCode.VulnerabilitiesFound,
      'vulns found error',
      createError(ExitCode.VulnerabilitiesFound, 'vulns found error'),
    ],
    [
      ExitCode.Error,
      'generic error',
      createError(ExitCode.Error, 'generic error'),
    ],
    [
      ExitCode.NoSupportedFiles,
      'no supported files error',
      createError(ExitCode.NoSupportedFiles, 'no supported files error'),
    ],
  ])('should return proper error', (exitCode, message, expected) => {
    expect(() => {
      exitWith(exitCode, message);
    }).toThrow(expected);
  });
});

function createError(exitCode: ExitCode, message: string) {
  const err = new Error() as any;
  err.message = message;
  err.code = exitCode.valueOf();

  return err;
}
