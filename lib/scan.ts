import * as fs from 'fs';
import * as path from 'path';

import { Analytics, Facts, Options, PluginResponse, ScanResult } from './types';
import { SignatureResult } from './types';
import { debug } from './debug';
import { find } from './find';
import { fromUrl } from 'hosted-git-info';
import { getSignaturesByAlgorithm } from './signatures';
import { getTarget } from './git';

export async function scan(options: Options): Promise<PluginResponse> {
  try {
    debug.enabled = !!options?.debug;

    debug('options %o \n', options);
    if (!options.path) {
      throw 'invalid options: no path provided.';
    }
    if (!fs.existsSync(options.path)) {
      throw `'${options.path}' does not exist.`;
    }
    const start = Date.now();
    const filePaths = await find(options.path);
    debug('%d files found \n', filePaths.length);

    const allSignatures: (SignatureResult | null)[] = await getSignaturesByAlgorithm(
      options.path,
      filePaths,
    );

    const filteredSignatures: SignatureResult[] = allSignatures.filter((s) => {
      return s !== null;
    }) as SignatureResult[];

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

    const facts: Facts[] = [
      { type: 'fileSignatures', data: filteredSignatures },
    ];

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
    throw new Error(`Could not scan C/C++ project: ${error}`);
  }
}
