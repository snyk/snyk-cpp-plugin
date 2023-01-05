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
import { isWin } from '../lib/common';
import { ExitCode } from '../lib/utils/error';
import { DepGraph, createFromJSON } from '@snyk/dep-graph';

const helloWorldPath = path.join('test', 'fixtures', 'hello-world');

describe('display', () => {
  it('should work with huge set of file signatures', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });

    const length = 125053 * 2;
    const errors: string[] = [];
    const template = scanResults[0].facts[0];

    scanResults[0].facts = new Array(length);

    for (let i = 0; i < length; i++) {
      scanResults[0].facts[i] = template;
    }

    let errorReceived: any = null;

    try {
      const options: Options = { debug: true, path: helloWorldPath };
      await display(scanResults, withDepFourIssues, errors, options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
  });

  it('should throw VulnerabilitiesFound error containing expected text for one dependency, four issues, no errors', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-four-issues-no-errors.txt',
    );

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepFourIssues, errors);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
  });

  it('should throw VulnerabilitiesFound error containing expected text for one dependency, four issues (using https://security.snyk.io/), no errors using', async () => {
    const path = helloWorldPath;
    const { scanResults } = await scan({ path });
    const errors: string[] = [];
    const options: Options = {
      path,
    };
    const osName = isWin ? 'windows' : 'unix';
    const expected = await readFixture(
      'display-snyk-security-details-url',
      `one-dep-four-issues-no-errors-${osName}.txt`,
    );

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepFourIssues, errors, options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
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

    let errorReceived: any = null;

    try {
      await display(scanResults, noDepOrIssues, errors);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.NoSupportedFiles);
    expect(stripAnsi(errorReceived.message)).toContain(stripAnsi(expected));
    expect(stripAnsi(errorReceived.userMessage)).toContain(stripAnsi(expected));
  });

  it('should throw NoSupportedFiles when no projects', async () => {
    const scanResult: ScanResult[] = [];
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );

    let errorReceived: any = null;

    try {
      await display(scanResult, noDepOrIssues, errors);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.NoSupportedFiles);
    expect(stripAnsi(errorReceived.message)).toContain(stripAnsi(expected));
    expect(stripAnsi(errorReceived.userMessage)).toContain(stripAnsi(expected));
  });

  it('should throw NoSupportedFiles when invalid artifact data', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );

    let errorReceived: any = null;

    try {
      await display([1, 2, 3] as any, noDepOrIssues, errors);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.NoSupportedFiles);
    expect(stripAnsi(errorReceived.message)).toContain(stripAnsi(expected));
    expect(stripAnsi(errorReceived.userMessage)).toContain(stripAnsi(expected));
  });

  it('should throw NoSupportedFiles when invalid artifacts', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );

    let errorReceived: any = null;

    try {
      await display(
        [{ artifacts: ['a', 'b', 'c'] }] as any,
        noDepOrIssues,
        errors,
      );
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.NoSupportedFiles);
    expect(stripAnsi(errorReceived.message)).toContain(stripAnsi(expected));
    expect(stripAnsi(errorReceived.userMessage)).toContain(stripAnsi(expected));
  });

  it('should throw NoSupportedFiles when invalid artifact data', async () => {
    const errors: string[] = [];
    const expected = await readFixture(
      'hello-world-display',
      'display-no-scan-results.txt',
    );

    let errorReceived: any = null;

    try {
      await display(
        [{ artifacts: [{ type: 'test', data: [1, 2, 3] }] }] as any,
        noDepOrIssues,
        errors,
      );
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.NoSupportedFiles);
    expect(stripAnsi(errorReceived.message)).toContain(stripAnsi(expected));
    expect(stripAnsi(errorReceived.userMessage)).toContain(stripAnsi(expected));
  });

  it('should throw Error containing expected text for error', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid',
    ];
    const expected = await readFixture(
      'hello-world-display',
      'display-one-dep-one-issue-one-error.txt',
    );

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepOneIssueAndFix, errors);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.Error);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
  });

  it('should throw VulnerabilitiesFound error containing one dependency, one issue', async () => {
    const path = helloWorldPath;
    const { scanResults } = await scan({ path });
    const options: Options = {
      path,
    };
    const osName = isWin ? 'windows' : 'unix';
    const expected = await readFixture(
      'display-snyk-security-details-url',
      `one-dep-one-issue-one-error-${osName}.txt`,
    );

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepOneIssueAndFix, [], options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
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

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepNoIssues, errors);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.Error);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
  });

  it('should throw VulnerabilitiesFound error containing test path in output if path present', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project' };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path.txt',
    );

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
  });

  it('should throw VulnerabilitiesFound error containing the proper vulns', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project' };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path.txt',
    );

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
  });

  it('should throw VulnerabilitiesFound error containing also the signatures when debug enabled', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project', debug: true };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path-with-debug.txt',
    );

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
  });

  it('should throw VulnerabilitiesFound error containing deps', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project', 'print-deps': true };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path-with-deps.txt',
    );

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
  });

  it('should throw VulnerabilitiesFound error containing deps and paths', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project', 'print-dep-paths': true };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path-with-deps-filepaths.txt',
    );

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
  });

  it('should throw VulnerabilitiesFound error containing the deps and json output', async () => {
    const { scanResults } = await scan({ path: helloWorldPath });
    const errors: string[] = [];
    const options = { path: '/path/to/project' };
    const expected = await readFixture(
      'hello-world-display',
      'display-testing-file-path.txt',
    );

    const expectedJsonOutput = {
      depGraphData: {
        schemaVersion: '1.2.0',
        pkgManager: { name: 'cpp' },
        pkgs: [
          { id: '_root@0.0.0', info: { name: '_root', version: '0.0.0' } },
          {
            id: 'hello-world@1.2.3',
            info: { name: 'hello-world', version: '1.2.3' },
          },
        ],
        graph: {
          rootNodeId: 'root-node',
          nodes: [
            {
              nodeId: 'root-node',
              pkgId: '_root@0.0.0',
              deps: [{ nodeId: 'hello-world@1.2.3' }],
            },
            {
              nodeId: 'hello-world@1.2.3',
              pkgId: 'hello-world@1.2.3',
              deps: [],
            },
          ],
        },
      },
      issues: [
        {
          pkgName: 'hello-world',
          pkgVersion: '1.2.3',
          issueId: 'cpp:hello-world:20161130',
          fixInfo: { nearestFixedInVersion: '1.2.4' },
        },
      ],
      issuesData: {
        'cpp:hello-world:20161130': {
          id: 'cpp:hello-world:20161130',
          severity: 'medium',
          title: 'Cross-site Scripting (XSS)',
        },
      },
      depsFilePaths: {
        'hello-world@1.2.3': [
          '/path/to/project/a',
          '/path/to/project/a/b',
          '/path/to/project/a/b/c',
          '/path/to/project/a/b/c/d',
          '/path/to/project/a/b/c/d/e',
        ],
      },
      fileSignaturesDetails: {
        'hello-world@1.2.3': {
          confidence: 1,
          filePaths: [
            '/path/to/project/a',
            '/path/to/project/a/b',
            '/path/to/project/a/b/c',
            '/path/to/project/a/b/c/d',
            '/path/to/project/a/b/c/d/e',
          ],
        },
      },
    };

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.VulnerabilitiesFound);
    expect(stripAnsi(errorReceived.message)).toEqual(stripAnsi(expected));
    expect(JSON.parse(errorReceived.jsonStringifiedResults)).toEqual(
      expectedJsonOutput,
    );
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

    let errorReceived: any = null;

    try {
      await display(scanResults, withDepOneIssueAndFix, errors, options);
    } catch (error) {
      errorReceived = error;
    }

    expect(errorReceived.code).toEqual(ExitCode.Error);
    expect(stripAnsi(errorReceived.message)).toEqual(
      'Error displaying results.',
    );
  });
});

describe('displayDependecies', () => {
  it('should accept ID with mixed casing', async () => {
    const depGraph: DepGraph = createFromJSON({
      schemaVersion: '1.2.0',
      pkgManager: { name: 'cpp' },
      pkgs: [
        {
          id: 'root-node@0.0.0',
          info: { name: 'root-node', version: '0.0.0' },
        },
        {
          id: 'rOoT@1.0.0',
          info: { name: 'rOoT', version: '1.0.0' },
        },
      ],
      graph: {
        rootNodeId: 'root-node',
        nodes: [
          {
            nodeId: 'root-node',
            pkgId: 'root-node@0.0.0',
            deps: [
              {
                nodeId: 'rOoT@1.0.0',
              },
            ],
          },
          {
            nodeId: 'rOoT@1.0.0',
            pkgId: 'rOoT@1.0.0',
            deps: [],
          },
        ],
      },
    });

    const expected: string[] = [
      '\nDependencies:\n',
      '\n  rOoT@1.0.0',
      '  confidence: 1.000',
      '  matching files:',
      '    - proj/foo.c',
      '',
    ];

    const depsFilePaths: any = { 'rOoT@1.0.0': ['proj/foo.c'] };
    const details: any = {
      'rOoT@1.0.0': { confidence: 1.0, filePaths: ['proj/foo.c'] },
    };

    const result: string[] = displayModule.displayDependencies(
      depGraph,
      details,
      depsFilePaths,
    );

    expect(stripAnsi(expected.join('\n'))).toEqual(
      stripAnsi(result.join('\n')),
    );
  });

  it('should support packages without version number', async () => {
    const depGraph: DepGraph = createFromJSON({
      schemaVersion: '1.2.0',
      pkgManager: { name: 'cpp' },
      pkgs: [
        {
          id: 'root-node@0.0.0',
          info: { name: 'root-node', version: '0.0.0' },
        },
        {
          id: 'rOoT@',
          info: { name: 'rOoT' },
        },
      ],
      graph: {
        rootNodeId: 'root-node',
        nodes: [
          {
            nodeId: 'root-node',
            pkgId: 'root-node@0.0.0',
            deps: [
              {
                nodeId: 'rOoT@',
              },
            ],
          },
          {
            nodeId: 'rOoT@',
            pkgId: 'rOoT@',
            deps: [],
          },
        ],
      },
    });

    // NOTE: Output should contain unknown if we lack version
    const expected: string[] = [
      '\nDependencies:\n',
      '\n  rOoT@unknown',
      '  confidence: 1.000',
      '  matching files:',
      '    - proj/foo.c',
      '',
    ];

    const depsFilePaths: any = { 'rOoT@': ['proj/foo.c'] };
    const details: any = {
      'rOoT@': { confidence: 1.0, filePaths: ['proj/foo.c'] },
    };

    const result: string[] = displayModule.displayDependencies(
      depGraph,
      details,
      depsFilePaths,
    );

    expect(stripAnsi(expected.join('\n'))).toEqual(
      stripAnsi(result.join('\n')),
    );
  });
});
