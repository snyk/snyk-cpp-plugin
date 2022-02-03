import { TestResult } from '../../../lib';
import { DepGraphData, DepGraphBuilder } from '@snyk/dep-graph';

function withDep(): DepGraphData {
  const dep = { name: 'hello-world', version: '1.2.3' };
  const nodeId = 'hello-world@1.2.3';
  const builder = new DepGraphBuilder({ name: 'cpp' });
  builder.addPkgNode(dep, nodeId);
  builder.connectDep(builder.rootNodeId, nodeId);
  const depGraph = builder.build();
  return depGraph.toJSON();
}

function noDeps(): DepGraphData {
  const builder = new DepGraphBuilder({ name: 'cpp' });
  const depGraph = builder.build();
  return depGraph.toJSON();
}

export const withDepOneIssueAndFix: TestResult[] = [
  {
    depGraphData: withDep(),
    issues: [
      {
        pkgName: 'hello-world',
        pkgVersion: '1.2.3',
        issueId: 'cpp:hello-world:20161130',
        fixInfo: {
          nearestFixedInVersion: '1.2.4'
        },
      },
    ],
    issuesData: {
      ['cpp:hello-world:20161130']: {
        id: 'cpp:hello-world:20161130',
        severity: 'medium',
        title: 'Cross-site Scripting (XSS)',
      },
    },
    depsFilePaths: {
      "hello-world@1.2.3": [
        '/path/to/project/a',
        '/path/to/project/a/b',
        '/path/to/project/a/b/c',
        '/path/to/project/a/b/c/d',
        '/path/to/project/a/b/c/d/e'
      ],
    },
    fileSignaturesDetails: {
      "hello-world@1.2.3": {
        confidence: 1,
        filePaths: [
          '/path/to/project/a',
          '/path/to/project/a/b',
          '/path/to/project/a/b/c',
          '/path/to/project/a/b/c/d',
          '/path/to/project/a/b/c/d/e'
        ],
      }
    },
  },
];

export const withDepFourIssues: TestResult[] = [
  {
    depGraphData: withDep(),
    issues: [
      {
        pkgName: 'hello-world',
        pkgVersion: '1.2.3',
        issueId: 'cpp:hello-world:000',
        fixInfo: {},
      },
      {
        pkgName: 'hello-world',
        pkgVersion: '1.2.3',
        issueId: 'cpp:hello-world:123',
        fixInfo: {},
      },
      {
        pkgName: 'hello-world',
        pkgVersion: '1.2.3',
        issueId: 'cpp:hello-world:456',
        fixInfo: {},
      },
      {
        pkgName: 'hello-world',
        pkgVersion: '1.2.3',
        issueId: 'cpp:hello-world:789',
        fixInfo: {},
      },
    ],
    issuesData: {
      ['cpp:hello-world:000']: {
        id: 'cpp:hello-world:20161130',
        severity: 'critical',
        title: 'Information Exposure',
      },
      ['cpp:hello-world:123']: {
        id: 'cpp:hello-world:20161130',
        severity: 'high',
        title: 'Information Exposure',
      },
      ['cpp:hello-world:456']: {
        id: 'cpp:hello-world:20161130',
        severity: 'medium',
        title: 'Use of Insufficiently Random Values',
      },
      ['cpp:hello-world:789']: {
        id: 'cpp:hello-world:20161130',
        severity: 'low',
        title: 'Missing Encryption of Sensitive Data',
      },
    },
  },
];

export const withDepNoIssues: TestResult[] = [
  {
    depGraphData: withDep(),
    issues: [],
    issuesData: {},
  },
];

export const noDepOrIssues: TestResult[] = [
  {
    depGraphData: noDeps(),
    issues: [],
    issuesData: {},
  },
];