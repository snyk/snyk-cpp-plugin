import * as fs from 'fs';
import * as path from 'path';

import { Facts, Options, PluginResponse, ScanResult } from './types';

import { SignatureResult } from './types';
import { debug } from './debug';
import { find } from './find';
import { fromUrl } from 'hosted-git-info';
import { getSignature } from './signatures';
import { getTarget } from './git';

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
    const signatures: Promise<SignatureResult>[] = [];
    for (const filePath of filePaths) {
      // const md5 = await hash(filePath);
      const signature = getSignature(filePath);
      signatures.push(signature);
    }
    const allSignatures = await Promise.all(signatures);

    const facts: Facts[] = [{ type: 'cpp-signatures', data: allSignatures }];
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
