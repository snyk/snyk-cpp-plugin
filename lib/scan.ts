import * as fs from 'fs';
import * as path from 'path';

import {
  Analytics,
  Facts,
  FilePath,
  Options,
  PluginResponse,
  ScanResult,
  SignatureResult,
} from './types';
import { debug } from './debug';
import { find } from './find';
import { fromUrl } from 'hosted-git-info';
import { computeSignaturesConcurrently } from './signatures';
import { getTarget } from './git';
import { extract, filterArchives } from './extract';
import { DEFAULT_DECOMPRESSING_DEPTH, EXTRACTED_DIR_SUFFIX } from './common';
import { createTemporaryDir } from './utils/fs';

export async function scan(options: Options): Promise<PluginResponse> {
  try {
    debug.enabled = !!options?.debug;
    debug('options %o \n', options);
    const extractionDepthLimit =
      options['max-depth'] !== undefined
        ? options['max-depth']
        : DEFAULT_DECOMPRESSING_DEPTH;

    if (extractionDepthLimit < 0) {
      throw 'invalid options: --max-depth should be a positive number.';
    }

    if (!options.path) {
      throw 'invalid options: no path provided.';
    }

    if (!fs.existsSync(options.path)) {
      throw `'${options.path}' does not exist.`;
    }

    const start = Date.now();

    const paths: FilePath[] = await find(options.path);
    const archives: FilePath[] = filterArchives(paths);

    let temporaryDir: FilePath | null = null;

    if (archives.length > 0) {
      temporaryDir = await createTemporaryDir();

      await extract(archives, temporaryDir, extractionDepthLimit);
      paths.push(...(await find(temporaryDir)));
    }

    debug('%d files found \n', paths.length);

    const signatures: SignatureResult[] = await computeSignaturesConcurrently(
      paths,
    );

    signatures.forEach((s) => {
      if (temporaryDir && s.path.includes(temporaryDir)) {
        s.path = path
          .relative(temporaryDir, s.path)
          .replace(new RegExp(EXTRACTED_DIR_SUFFIX, 'g'), '');
      } else {
        s.path = path.relative(options.path, s.path);
      }
    });

    const end = Date.now();

    const totalMilliseconds = end - start;
    const totalFileSignatures = signatures.length;
    const totalSecondsElapsedToGenerateFileSignatures = Math.floor(
      totalMilliseconds / 1000,
    );

    debug(`total fileSignatures: ${totalFileSignatures} \n`);
    debug(
      `elapsed time in seconds to generate fileSignatures: ${totalSecondsElapsedToGenerateFileSignatures}s \n`,
    );

    const facts: Facts[] = [{ type: 'fileSignatures', data: signatures }];

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
