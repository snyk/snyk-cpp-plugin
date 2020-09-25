import * as fs from 'fs';
import { find } from './find';
import { hash } from './hash';
import {
  ScanResult,
  Options,
  Fingerprint,
  Facts,
  PluginResponse,
} from './types';

export async function scan(options: Options): Promise<PluginResponse> {
  try {
    if (!options.path) {
      throw 'invalid options no path provided.';
    }
    if (!fs.existsSync(options.path)) {
      throw `'${options.path}' does not exist.`;
    }
    const filePaths = await find(options.path);
    const fingerprints: Fingerprint[] = [];
    for (const filePath of filePaths) {
      const md5 = await hash(filePath);
      fingerprints.push({
        filePath,
        hash: md5,
      });
    }
    const facts: Facts[] = [{ type: 'cpp-fingerprints', data: fingerprints }];
    const scanResults: ScanResult[] = [
      {
        facts,
        identity: {
          type: 'cpp',
        },
      },
    ];
    return {
      scanResults,
    };
  } catch (error) {
    throw new Error(`Could not scan C/C++ project, ${error}`);
  }
}
