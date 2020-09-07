import { join } from 'path';
import { display, scan, ScanResult } from '../lib';
import { readFixture } from './read-fixture';
import {
  withDepIssuesAndFix,
  withDepNoIssues,
  noDepOrIssues,
} from './fixtures/hello-world/test-results';

const helloWorldPath = join('./', 'test', 'fixtures', 'hello-world');

describe('display', () => {
  it('should return expected text for one dependency, one issue with fix, no errors', async () => {
    const scanResult = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = await display(scanResult, withDepIssuesAndFix, errors);
    const expected = await readFixture(
      'hello-world',
      'display-one-dep-one-issue-with-fix-no-errors.txt',
    );
    expect(actual).toBe(expected);
  });
  it('should return expected text when one dependency, no issues, no errors', async () => {
    const scanResult = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = await display(scanResult, withDepNoIssues, errors);
    const expected = await readFixture(
      'hello-world',
      'display-one-dep-no-issues-no-errors.txt',
    );
    expect(actual).toBe(expected);
  });
  it('should return expected text when no dependencies, no issues, no errors', async () => {
    const scanResult = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const actual = await display(scanResult, noDepOrIssues, errors);
    const expected = await readFixture(
      'hello-world',
      'display-no-deps-no-issues-no-errors.txt',
    );
    expect(actual).toBe(expected);
  });
  it('should return expected text string when no projects', async () => {
    const scanResult: ScanResult[] = [];
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world',
      'display-no-scan-results.txt',
    );
    const actual = await display(scanResult, noDepOrIssues, errors);
    expect(actual).toBe(expected);
  });
  it('should return expected text string when invalid projects', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world',
      'display-no-scan-results.txt',
    );
    const actual = await display([1, 2, 3] as any, noDepOrIssues, errors);
    expect(actual).toBe(expected);
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
    expect(actual).toBe(expected);
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
    expect(actual).toBe(expected);
  });
  it('should return expected text for one dependency, one issue, one error', async () => {
    const scanResult = await scan({ path: helloWorldPath });
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid',
    ];
    const actual = await display(scanResult, withDepIssuesAndFix, errors);
    const expected = await readFixture(
      'hello-world',
      'display-one-dep-one-issue-one-error.txt',
    );
    expect(actual).toBe(expected);
  });
  it('should return expected text for one dependency, no issues, two errors', async () => {
    const scanResult = await scan({ path: helloWorldPath });
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid1',
      'Could not test dependencies in test/fixtures/invalid2',
    ];
    const actual = await display(scanResult, withDepNoIssues, errors);
    const expected = await readFixture(
      'hello-world',
      'display-one-dep-no-issues-two-errors.txt',
    );
    expect(actual).toBe(expected);
  });
});
