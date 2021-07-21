import * as fs from 'fs';
import * as path from 'path';

import { Analytics, Facts, Options, PluginResponse, ScanResult } from './types';
import { SignatureResult } from './types';
import { debug } from './debug';
import { find } from './find';
import { fromUrl } from 'hosted-git-info';
import { getSignature } from './signatures';
import { getTarget } from './git';

export async function scan(options: Options): Promise<PluginResponse> {
  try {
    debug.enabled = !!options?.debug;

    debug('options %o \n', options);
    if (!options.path) {
      throw 'invalid options no path provided.';
    }
    if (!fs.existsSync(options.path)) {
      throw `'${options.path}' does not exist.`;
    }
    const start = Date.now();
    const filePaths = await find(options.path);
    debug('%d files found \n', filePaths.length);
    let signatures: Promise<SignatureResult>[] = [];
    let allSignatures: SignatureResult[] = [];
    for (const filePath of filePaths) {
      /**
       * TODO (@snyk/tundra): apply concurrency to generate signatures
       * for n files at the time to be resolved as chunk with Promise.all?*
       */
      if (signatures.length === 20) {
        const signaturesResult = await Promise.all(signatures);
        allSignatures = allSignatures.concat(signaturesResult);
        signatures = [];
      }

      const signature = getSignature(filePath);
      signatures.push(signature);
    }

    const end = Date.now();
    const totalMilliseconds = end - start;

    const totalFileSignatures = allSignatures.length;
    const totalSecondsElapsedToGenerateFileSignatures = Math.floor(
      totalMilliseconds / 1000,
    );

    debug(`total fileSignatures: ${totalFileSignatures} \n`);
    debug(
      `elapsed time in seconds to generate fileSignatures: ${totalSecondsElapsedToGenerateFileSignatures}s \n`,
    );

    const facts: Facts[] = [{ type: 'fileSignatures', data: allSignatures }];
    const analytics: Analytics[] = [
      {
        name: 'fileSignaturesAnalyticsContext',
        data: {
          totalFileSignatures,
          totalSecondsElapsedToGenerateFileSignatures,
        },
      },
    ];

    const target = await getTarget();
    debug('target %o \n', target);
    const gitInfo = fromUrl(target.remoteUrl);
    const name =
      options.projectName || gitInfo?.project || path.basename(options.path);
    debug('name %o \n', name);
    const scanResults: ScanResult[] = [
      {
        facts,
        identity: {
          type: 'cpp',
        },
        name,
        target,
        analytics,
      },
    ];
    return {
      scanResults,
    };
  } catch (error) {
    throw new Error(`Could not scan C/C++ project, ${error}`);
  }
}
