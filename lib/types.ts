import { DepGraphData } from '@snyk/dep-graph';

export const SupportFileExtensions = [
  '.c',
  '.cc',
  '.cpp',
  '.cxx',
  '.c++',
  '.h',
  '.hh',
  '.hpp',
  '.hxx',
  '.h++',
  '.i',
  '.ii',
  '.ixx',
  '.ipp',
  '.txx',
  '.tpp',
  '.tpl',
];

export interface Artifact {
  type: string;
  data: any;
  meta: { [key: string]: any };
}

export interface ScanResult {
  artifacts: Artifact[];
  meta: { [key: string]: any };
}

export interface Fingerprint {
  filePath: string;
  hash: string;
}

export interface Options {
  path: string;
}

export interface Issue {
  pkgName: string;
  pkgVersion?: string;
  issueId: string;
  fixInfo: {
    nearestFixedInVersion?: string; // TODO: add more fix info
  };
}

export interface IssuesData {
  [issueId: string]: {
    id: string;
    severity: string;
    title: string;
  };
}

export interface TestResult {
  issues: Issue[];
  issuesData: IssuesData;
  depGraphData: DepGraphData;
}
