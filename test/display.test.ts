import * as fs from 'fs';
import * as path from 'path';
import { TestResults, display, scan } from '../lib';
import { DepGraphBuilder } from '@snyk/dep-graph';

describe('display', () => {
  it('should return human readable text for one dependency and one issue', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-one-dep-one-issue.txt',
    );
    const scanResult = await scan({ path: fixturePath });
    const dep = { name: 'hello-world', version: '1.2.3' };
    const nodeId = 'hello-world@1.2.3';
    const builder = new DepGraphBuilder({ name: 'cpp' });
    builder.addPkgNode(dep, nodeId);
    builder.connectDep(builder.rootNodeId, nodeId);
    const depGraph = builder.build().toJSON();
    const testResults: TestResults[] = [
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
    const actual = await display(scanResult, testResults);
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    expect(actual).toBe(expected);
  });
  it('should return human readable text when one dep no issues', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-one-dep-no-issues.txt',
    );
    const scanResult = await scan({ path: fixturePath });
    const dep = { name: 'hello-world', version: '1.2.3' };
    const nodeId = 'hello-world@1.2.3';
    const builder = new DepGraphBuilder({ name: 'cpp' });
    builder.addPkgNode(dep, nodeId);
    builder.connectDep(builder.rootNodeId, nodeId);
    const depGraph = builder.build().toJSON();
    const testResults: TestResults[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const actual = await display(scanResult, testResults);
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    expect(actual).toBe(expected);
  });
  it('should return human readable text when no deps no issues', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-no-deps-no-issues.txt',
    );
    const scanResult = await scan({ path: fixturePath });
    const depGraph = new DepGraphBuilder({ name: 'cpp' }).build().toJSON();
    const testResults: TestResults[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const actual = await display(scanResult, testResults);
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
    const testResults: TestResults[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    const actual = await display([], testResults);
    expect(actual).toBe(expected);
  });
  it('should return empty string when invalid projects', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-no-scan-results.txt',
    );
    const depGraph = new DepGraphBuilder({ name: 'cpp' }).build().toJSON();
    const testResults: TestResults[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    const actual = await display([1, 2, 3] as any, testResults);
    expect(actual).toBe(expected);
  });
  it('should return empty string when invalid artifacts', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(
      fixturePath,
      'display-no-scan-results.txt',
    );
    const depGraph = new DepGraphBuilder({ name: 'cpp' }).build().toJSON();
    const testResults: TestResults[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    const actual = await display(
      [{ artifacts: ['a', 'b', 'c'] }] as any,
      testResults,
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
    const testResults: TestResults[] = [
      {
        depGraph,
        affectedPkgs: {},
        issuesData: {},
      },
    ];
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    const actual = await display(
      [{ artifacts: [{ type: 'test', data: [1, 2, 3] }] }] as any,
      testResults,
    );
    expect(actual).toBe(expected);
  });
});
