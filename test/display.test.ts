import * as path from 'path';

import stripAnsi from 'strip-ansi';

import * as displayModule from '../lib/display/display';
import { display, Options, scan, ScanResult } from '../lib';
import { readFixture } from './read-fixture';
import {
  withDepOneIssueAndFix,
  withDepFourIssues,
  withDepNoIssues,
  noDepOrIssues,
} from './fixtures/hello-world-display/test-results';
import { isWindowsOS } from '../lib/common';
import { ExitCode } from '../lib/utils/error';

const helloWorldPath = path.join('test', 'fixtures', 'hello-world');

describe('display', () => {
  it('should throw VulnerabilitiesFound error containing expected text for one dependency, four issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-four-issues-no-errors.txt',
    );

    try {
      await display(scanResults, withDepFourIssues, errors);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.VulnerabilitiesFound);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should throw VulnerabilitiesFound error containing expected text for one dependency, four issues (using https://security.snyk.io/), no errors using', async () => {
    const path = helloWorldPath;
    const { scanResults } = await scan({ path });
    const errors: string[] = [];
    const options: Options = {
      path,
      supportUnmanagedVulnDB: true,
    };
    const osName = isWindowsOS() ? 'windows' : 'unix';
    const expected = await readFixture(
      'display-snyk-security-details-url',
      `one-dep-four-issues-no-errors-${osName}.txt`,
    );

    try {
      await display(scanResults, withDepFourIssues, errors, options);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.VulnerabilitiesFound);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should return expected text when one dependency, no issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-no-issues-no-errors.txt',
    );

    const result = await display(scanResults, withDepNoIssues, errors);
    expect(stripAnsi(result)).toEqual(stripAnsi(expected));
  });

  it('should throw NoSupportedFiles when no dependencies, no issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );

    try {
      await display(scanResults, noDepOrIssues, errors);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.NoSupportedFiles);
      expect(stripAnsi(error.message)).toContain(stripAnsi(expected));
    }
  });

  it('should throw NoSupportedFiles when no projects', async () => {
    const scanResult: ScanResult[] = [];
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );

    try {
      await display(scanResult, noDepOrIssues, errors);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.NoSupportedFiles);
      expect(stripAnsi(error.message)).toContain(stripAnsi(expected));
    }
  });

  it('should throw NoSupportedFiles when invalid artifact data', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );

    try {
      await display([1, 2, 3] as any, noDepOrIssues, errors);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.NoSupportedFiles);
      expect(stripAnsi(error.message)).toContain(stripAnsi(expected));
    }
  });

  it('should throw NoSupportedFiles when invalid artifacts', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );

    try {
      await display(
        [{ artifacts: ['a', 'b', 'c'] }] as any,
        noDepOrIssues,
        errors,
      );
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.NoSupportedFiles);
      expect(stripAnsi(error.message)).toContain(stripAnsi(expected));
    }
  });

  it('should throw NoSupportedFiles when invalid artifact data', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );

    try {
      await display(
        [{ artifacts: [{ type: 'test', data: [1, 2, 3] }] }] as any,
        noDepOrIssues,
        errors,
      );
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.NoSupportedFiles);
      expect(stripAnsi(error.message)).toContain(stripAnsi(expected));
    }
  });

  it('should throw NoSupportedFiles containing expected text for error', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid',
    ];
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-one-issue-one-error.txt',
    );

    try {
      await display(scanResults, withDepOneIssueAndFix, errors);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.Error);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should throw VulnerabilitiesFound error containing one dependency, one issue (using https://security.snyk.io/)', async () => {
    const path = helloWorldPath;
    const { scanResults } = await scan({ path });
    const options: Options = {
      path,
      supportUnmanagedVulnDB: true,
    };
    const osName = isWindowsOS() ? 'windows' : 'unix';
    const expected = await readFixture(
      'display-snyk-security-details-url',
      `one-dep-one-issue-one-error-${osName}.txt`,
    );

    try {
      await display(scanResults, withDepOneIssueAndFix, [], options);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.VulnerabilitiesFound);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should throw Error containing two errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid1',
      'Could not test dependencies in test/fixtures/invalid2',
    ];
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-no-issues-two-errors.txt',
    );

    try {
      await display(scanResults, withDepNoIssues, errors);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.Error);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should throw VulnerabilitiesFound error containing test path in output if path present', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project' };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path.txt',
    );

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.VulnerabilitiesFound);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should throw VulnerabilitiesFound error containing the proper vulns', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project' };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path.txt',
    );

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.VulnerabilitiesFound);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should throw VulnerabilitiesFound error containing also the signatures when debug enabled', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project', debug: true };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path-with-debug.txt',
    );

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.VulnerabilitiesFound);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should throw VulnerabilitiesFound error containing deps', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project', 'print-deps': true };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path-with-deps.txt',
    );

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.VulnerabilitiesFound);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should throw VulnerabilitiesFound error containing deps and paths', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project', 'print-dep-paths': true };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path-with-deps-filepaths.txt',
    );

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.VulnerabilitiesFound);
      expect(stripAnsi(error.message)).toEqual(stripAnsi(expected));
    }
  });

  it('should throw a proper exception when an unexpected error within the chain happens', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project' };
    jest
      .spyOn(displayModule, 'selectDisplayStrategy')
      .mockImplementation(() => {
        throw new Error('test error');
      });

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      expect(stripAnsi(error.code)).toEqual(ExitCode.Error);
      expect(stripAnsi(error.message)).toEqual('Error displaying results.');
    }
  });
});
