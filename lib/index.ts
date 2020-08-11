import { find } from './find';
import { hash } from './hash';

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

export async function scan(dir: string): Promise<ScannedArtifact> {
  try {
    const filePaths = await find(dir);
    const fingerprints: Fingerprint[] = [];
    for (const filePath of filePaths) {
      const md5 = await hash(filePath);
      fingerprints.push({
        filePath,
        hash: md5,
      });
    }
    return {
      type: 'cpp-fingerprints',
      data: fingerprints,
    };
  } catch (error) {
    throw new Error(`Could not scan ${dir}. ${error}`);
  }
}
