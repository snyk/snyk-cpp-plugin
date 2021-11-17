import { DepGraphData } from '@snyk/dep-graph';
export interface PluginResponse {
  scanResults: ScanResult[];
}

export interface ScanResult {
  identity: Identity;
  facts: Facts[];
  name?: string;
  policy?: string;
  target: GitTarget;
  analytics?: Analytics[];
}

export interface DepsFilePaths {
  [pkgKey: string]: string[];
}

export interface Analytics {
  name: string;
  data: unknown;
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
  'print-deps'?: boolean;
  'print-dep-paths'?: boolean;
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
  depsFilePaths?: DepsFilePaths;
}

export interface SignatureResult {
  path: string;
  size: number;
  hashes_ffm: FullFileHash[];
}

interface FullFileHash {
  format: number;
  data: string;
}
