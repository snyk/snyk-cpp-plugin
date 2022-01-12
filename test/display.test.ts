import * as path from 'path';

import stripAnsi from 'strip-ansi';

import { display, Options, scan, ScanResult } from '../lib';
import { readFixture } from './read-fixture';
import {
  withDepOneIssueAndFix,
  withDepThreeIssues,
  withDepNoIssues,
  noDepOrIssues,
} from './fixtures/hello-world-display/test-results';
import { isWindowsOS } from '../lib/common';

const helloWorldPath = path.join('test', 'fixtures', 'hello-world');

describe('display', () => {
  it('should return expected text for one dependency, three issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = await display(scanResults, withDepThreeIssues, errors);
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-three-issues-no-errors.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text for one dependency, three issues (using https://security.snyk.io/), no errors using', async () => {
    const path = helloWorldPath;
    const { scanResults } = await scan({ path });
    const errors: string[] = [];
    const options: Options = {
      path,
      supportUnmanagedVulnDB: true,
    };
    const actual = await display(
      scanResults,
      withDepThreeIssues,
      errors,
      options,
    );

    const osName = isWindowsOS() ? 'windows' : 'unix';
    const expected = await readFixture(
      'display-snyk-security-details-url',
      `one-dep-three-issues-no-errors-${osName}.txt`,
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text when one dependency, no issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = await display(scanResults, withDepNoIssues, errors);
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-no-issues-no-errors.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text when no dependencies, no issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = await display(scanResults, noDepOrIssues, errors);
    const expected = await readFixture(
      'hello-world-display',
      'display-no-deps-no-issues-no-errors.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text string when no projects', async () => {
    const scanResult: ScanResult[] = [];
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );
    const actual = await display(scanResult, noDepOrIssues, errors);
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text string when invalid projects', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );
    const actual = await display([1, 2, 3] as any, noDepOrIssues, errors);
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text when invalid artifacts', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );
    const actual = await display(
      [{ artifacts: ['a', 'b', 'c'] }] as any,
      noDepOrIssues,
      errors,
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text when invalid artifact data', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );
    const actual = await display(
      [{ artifacts: [{ type: 'test', data: [1, 2, 3] }] }] as any,
      noDepOrIssues,
      errors,
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text for one dependency, one issue, one error', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid',
    ];
    const actual = await display(scanResults, withDepOneIssueAndFix, errors);
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-one-issue-one-error.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text for one dependency, one issue (using https://security.snyk.io/), one error', async () => {
    const path = helloWorldPath;
    const { scanResults } = await scan({ path });
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid',
    ];
    const options: Options = {
      path,
      supportUnmanagedVulnDB: true,
    };

    const actual = await display(
      scanResults,
      withDepOneIssueAndFix,
      errors,
      options,
    );

    const osName = isWindowsOS() ? 'windows' : 'unix';
    const expected = await readFixture(
      'display-snyk-security-details-url',
      `one-dep-one-issue-one-error-${osName}.txt`,
    );

    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text for one dependency, no issues, two errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid1',
      'Could not test dependencies in test/fixtures/invalid2',
    ];
    const actual = await display(scanResults, withDepNoIssues, errors);
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-no-issues-two-errors.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should show test path in output if path present', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project' };
    const actual = await display(
      scanResults,
      withDepOneIssueAndFix,
      errors,
      options,
    );
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path.txt',
    );
    expect(stripAnsi(actual)).toEqual(expected);
  });
});
