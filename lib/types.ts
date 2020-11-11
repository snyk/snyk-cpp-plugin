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

export interface PluginResponse {
  scanResults: ScanResult[];
}

export interface ScanResult {
  identity: Identity;
  facts: Facts[];
  name?: string;
  policy?: string;
  target: GitTarget;
}

export interface Identity {
  type: string;
  targetFile?: string;
  args?: { [key: string]: string };
}

export interface Facts {
  type: string;
  data: any;
}

export interface GitTarget {
  remoteUrl: string;
  branch: string;
}

export interface Fingerprint {
  filePath: string;
  hash: string;
}

export interface Options {
  path: string;
  debug?: boolean;
  projectName?: string;
}

export interface Issue {
  pkgName: string;
  pkgVersion?: string;
  issueId: string;
  fixInfo: {
    nearestFixedInVersion?: string;
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
