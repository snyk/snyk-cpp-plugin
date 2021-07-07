import * as path from 'path';

import stripAnsi from 'strip-ansi';

import { display, Options, scan, ScanResult } from '../lib';
import { usePosixPath } from '../lib/display';
import { readFixture } from './read-fixture';
import {
  withDepOneIssueAndFix,
  withDepThreeIssues,
  withDepNoIssues,
  noDepOrIssues,
} from './fixtures/hello-world/test-results';

const helloWorldPath = path.join('test', 'fixtures', 'hello-world');

describe('display', () => {
  it('should return expected text for one dependency, one issue with fix, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = JSON.stringify(
      stripAnsi(await display(scanResults, withDepOneIssueAndFix, errors)),
    );
    const expected = JSON.stringify(
      stripAnsi(
        await readFixture(
          'hello-world',
          'display-one-dep-one-issue-with-fix-no-errors.txt',
        ),
      ),
    );
    expect(actual).toEqual(expected);
  });

  it('should return expected text for one dependency, three issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = await display(scanResults, withDepThreeIssues, errors);
    const expected = await readFixture(
      'hello-world',
      'display-one-dep-three-issues-no-errors.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text for one dependency, one issue with fix, no errors when debug true', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options: Options = { path: '', debug: true };
    const actual = await display(
      usePosixPath(scanResults),
      withDepOneIssueAndFix,
      errors,
      options,
    );
    const expected = await readFixture(
      'hello-world',
      'display-one-dep-one-issue-with-fix-no-error-debug.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text when one dependency, no issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = await display(scanResults, withDepNoIssues, errors);
    const expected = await readFixture(
      'hello-world',
      'display-one-dep-no-issues-no-errors.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text when no dependencies, no issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = await display(scanResults, noDepOrIssues, errors);
    const expected = await readFixture(
      'hello-world',
      'display-no-deps-no-issues-no-errors.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text string when no projects', async () => {
    const scanResult: ScanResult[] = [];
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world',
      'display-no-scan-results.txt',
    );
    const actual = await display(scanResult, noDepOrIssues, errors);
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text string when invalid projects', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world',
      'display-no-scan-results.txt',
    );
    const actual = await display([1, 2, 3] as any, noDepOrIssues, errors);
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });

  it('should return expected text when invalid artifacts', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world',
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
      'hello-world',
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
      'hello-world',
      'display-one-dep-one-issue-one-error.txt',
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
      'hello-world',
      'display-one-dep-no-issues-two-errors.txt',
    );
    expect(stripAnsi(actual)).toEqual(stripAnsi(expected));
  });
});
