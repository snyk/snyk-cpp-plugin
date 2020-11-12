import * as fs from 'fs';
import { fromUrl } from 'hosted-git-info';
import * as path from 'path';
import { find } from './find';
import { getTarget } from './git';
import { hash } from './hash';
import { debug } from './debug';
import {
  ScanResult,
  Options,
  Fingerprint,
  Facts,
  PluginResponse,
} from './types';

export async function scan(options: Options): Promise<PluginResponse> {
  try {
    debug('options %o', options);
    if (!options.path) {
      throw 'invalid options no path provided.';
    }
    if (!fs.existsSync(options.path)) {
      throw `'${options.path}' does not exist.`;
    }
    const filePaths = await find(options.path);
    debug('%d files found', filePaths.length);
    const fingerprints: Fingerprint[] = [];
    for (const filePath of filePaths) {
      const md5 = await hash(filePath);
      fingerprints.push({
        filePath,
        hash: md5,
      });
    }
    const facts: Facts[] = [{ type: 'cpp-fingerprints', data: fingerprints }];
    const target = await getTarget();
    debug('target %o', target);
    const gitInfo = fromUrl(target.remoteUrl);
    const name =
      options.projectName || gitInfo?.project || path.basename(options.path);
    debug('name %o', name);
    const scanResults: ScanResult[] = [
      {
        facts,
        identity: {
          type: 'cpp',
        },
        name,
        target,
      },
    ];
    return {
      scanResults,
    };
  } catch (error) {
    throw new Error(`Could not scan C/C++ project, ${error}`);
  }
}
