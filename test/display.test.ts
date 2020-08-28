import * as fs from 'fs';
import * as path from 'path';
import { TestResult, display, scan } from '../lib';
import { DepGraphBuilder } from '@snyk/dep-graph';

describe('display', () => {
  it('should return human readable text for one dependency, one issue, no errors', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-one-dep-one-issue-no-errors.txt',
    );
    const scanResult = await scan({ path: fixturePath });
    const dep = { name: 'hello-world', version: '1.2.3' };
    const nodeId = 'hello-world@1.2.3';
    const builder = new DepGraphBuilder({ name: 'cpp' });
    builder.addPkgNode(dep, nodeId);
    builder.connectDep(builder.rootNodeId, nodeId);
    const depGraph = builder.build().toJSON();
    const testResults: TestResult[] = [
      {
        depGraph,
        affectedPkgs: {
          ['hello-world@1.2.3']: {
            pkg: {
              name: 'hello-world',
              version: '1.2.3',
            },
            issues: {
              ['cpp:hello-world:20161130']: {
                issueId: 'cpp:hello-world:20161130',
              },
            },
          },
        },
        issuesData: {
          ['cpp:hello-world:20161130']: {
            id: 'cpp:hello-world:20161130',
            severity: 'medium',
            title: 'Cross-site Scripting (XSS)',
          },
        },
      },
    ];
    const errors: string[] = [];
    const actual = await display(scanResult, testResults, errors);
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    expect(actual).toBe(expected);
  });
  it('should return human readable text when one dependency, no issues, no errors', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-one-dep-no-issues-no-errors.txt',
    );
    const scanResult = await scan({ path: fixturePath });
    const dep = { name: 'hello-world', version: '1.2.3' };
    const nodeId = 'hello-world@1.2.3';
    const builder = new DepGraphBuilder({ name: 'cpp' });
    builder.addPkgNode(dep, nodeId);
    builder.connectDep(builder.rootNodeId, nodeId);
    const depGraph = builder.build().toJSON();
    const testResults: TestResult[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const errors: string[] = [];
    const actual = await display(scanResult, testResults, errors);
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    expect(actual).toBe(expected);
  });
  it('should return human readable text when no dependencies, no issues, no errors', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-no-deps-no-issues-no-errors.txt',
    );
    const scanResult = await scan({ path: fixturePath });
    const depGraph = new DepGraphBuilder({ name: 'cpp' }).build().toJSON();
    const testResults: TestResult[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const errors: string[] = [];
    const actual = await display(scanResult, testResults, errors);
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    expect(actual).toBe(expected);
  });
  it('should return empty string when no projects', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-no-scan-results.txt',
    );
    const depGraph = new DepGraphBuilder({ name: 'cpp' }).build().toJSON();
    const testResults: TestResult[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const errors: string[] = [];
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    const actual = await display([], testResults, errors);
    expect(actual).toBe(expected);
  });
  it('should return empty string when invalid projects', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-no-scan-results.txt',
    );
    const depGraph = new DepGraphBuilder({ name: 'cpp' }).build().toJSON();
    const testResults: TestResult[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const errors: string[] = [];
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    const actual = await display([1, 2, 3] as any, testResults, errors);
    expect(actual).toBe(expected);
  });
  it('should return empty string when invalid artifacts', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-no-scan-results.txt',
    );
    const depGraph = new DepGraphBuilder({ name: 'cpp' }).build().toJSON();
    const testResults: TestResult[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const errors: string[] = [];
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    const actual = await display(
      [{ artifacts: ['a', 'b', 'c'] }] as any,
      testResults,
      errors,
    );
    expect(actual).toBe(expected);
  });
  it('should return empty string when invalid artifact data', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-no-scan-results.txt',
    );
    const depGraph = new DepGraphBuilder({ name: 'cpp' }).build().toJSON();
    const testResults: TestResult[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const errors: string[] = [];
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    const actual = await display(
      [{ artifacts: [{ type: 'test', data: [1, 2, 3] }] }] as any,
      testResults,
      errors,
    );
    expect(actual).toBe(expected);
  });
  it('should return human readable text for one dependency, one issue, one error', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-one-dep-one-issue-one-error.txt',
    );
    const scanResult = await scan({ path: fixturePath });
    const dep = { name: 'hello-world', version: '1.2.3' };
    const nodeId = 'hello-world@1.2.3';
    const builder = new DepGraphBuilder({ name: 'cpp' });
    builder.addPkgNode(dep, nodeId);
    builder.connectDep(builder.rootNodeId, nodeId);
    const depGraph = builder.build().toJSON();
    const testResults: TestResult[] = [
      {
        depGraph,
        affectedPkgs: {
          ['hello-world@1.2.3']: {
            pkg: {
              name: 'hello-world',
              version: '1.2.3',
            },
            issues: {
              ['cpp:hello-world:20161130']: {
                issueId: 'cpp:hello-world:20161130',
              },
            },
          },
        },
        issuesData: {
          ['cpp:hello-world:20161130']: {
            id: 'cpp:hello-world:20161130',
            severity: 'medium',
            title: 'Cross-site Scripting (XSS)',
          },
        },
      },
    ];
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid',
    ];
    const actual = await display(scanResult, testResults, errors);
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    expect(actual).toBe(expected);
  });
  it('should return human readable text for one dependency, no issues, two errors', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-one-dep-no-issues-two-errors.txt',
    );
    const scanResult = await scan({ path: fixturePath });
    const dep = { name: 'hello-world', version: '1.2.3' };
    const nodeId = 'hello-world@1.2.3';
    const builder = new DepGraphBuilder({ name: 'cpp' });
    builder.addPkgNode(dep, nodeId);
    builder.connectDep(builder.rootNodeId, nodeId);
    const depGraph = builder.build().toJSON();
    const testResults: TestResult[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const errors: string[] = [
      'Could not test dependencies in test/fixtures/invalid1',
      'Could not test dependencies in test/fixtures/invalid2',
    ];
    const actual = await display(scanResult, testResults, errors);
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    expect(actual).toBe(expected);
  });
});
