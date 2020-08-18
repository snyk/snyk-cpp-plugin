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
export interface ScannedArtifact {
  type:
    | 'depTree'
    | 'depGraph'
    | 'callGraph'
    | 'manifestFile'
    | 'binaries'
    | 'hashes'
    | 'dockerLayers'
    | 'cpp-fingerprints';
  data: any;
  meta?: { [key: string]: any };
}

export interface ScannedProject {
  artifacts: ScannedArtifact[];
}

export interface Fingerprint {
  filePath: string;
  hash: string;
}

export interface Options {
  path: string;
}
