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
  meta?: { [key: string]: any };
}

export interface ScanResult {
  artifacts: Artifact[];
}

export interface Fingerprint {
  filePath: string;
  hash: string;
}

export interface Options {
  path: string;
}
