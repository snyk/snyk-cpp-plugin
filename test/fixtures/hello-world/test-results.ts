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

export const withDepIssuesAndFix: TestResult[] = [
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