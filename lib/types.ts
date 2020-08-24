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

// TODO: use snyk-cli-interface
export interface Artifact {
  type: string;
  data: any;
  meta: { [key: string]: any };
}

export interface ScanResult {
  type: string;
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

export interface TestResults {
  depGraph: DepGraphData;
  affectedPkgs: {
    [pkgId: string]: {
      pkg: {
        name: string;
        version: string;
      };
      issues: {
        [issueId: string]: {
          issueId: string;
        };
      };
    };
  };
  issuesData: {
    [issueId: string]: {
      id: string;
      severity: string;
      title: string;
    };
  };
}
