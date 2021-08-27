import * as fs from 'fs';
import * as path from 'path';

import { Analytics, Facts, Options, PluginResponse, ScanResult } from './types';
import { SignatureResult } from './types';
import { debug } from './debug';
import { find } from './find';
import { fromUrl } from 'hosted-git-info';
import { getSignature } from './signatures';
import { getTarget } from './git';

const processSignatures = async (
  signatures: Promise<SignatureResult | null>[],
  allSignatures: SignatureResult[],
) => {
  const signaturesResult = await Promise.all(signatures);
  const signaturesFiltered = <SignatureResult[]>(
    signaturesResult.filter((signature) => !!signature)
  );
  allSignatures.push(...signaturesFiltered);
  signatures = [];
};

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
    const signatures: Promise<SignatureResult | null>[] = [];
    const allSignatures: SignatureResult[] = [];
    const signatureConcurrency = 20;
    for (const filePath of filePaths) {
      const signature = getSignature(filePath);
      signatures.push(signature);
      if (signatures.length === signatureConcurrency) {
        await processSignatures(signatures, allSignatures);
      }
    }

    if (signatures.length > 0) {
      await processSignatures(signatures, allSignatures);
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
