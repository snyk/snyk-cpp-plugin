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

export interface Fingerprint {
  filePath: string;
  hash: string;
}

export async function scan(): Promise<ScannedArtifact> {
  const fingerprints: Fingerprint[] = [];
  return {
    type: 'cpp-fingerprints',
    data: fingerprints,
  };
}
