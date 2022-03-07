import * as fs from 'fs';
import * as path from 'path';
import { join, resolve } from 'path';

import {
  Analytics,
  Facts,
  FilePath,
  Options,
  Path,
  PluginResponse,
  ScanResult,
  SignatureResult,
} from './types';
import { debug } from './debug';
import { find } from './find';
import { fromUrl } from 'hosted-git-info';
import { computeSignaturesConcurrently } from './signatures';
import { getTarget } from './git';
import { extract } from './extract';
import { createTemporaryDir } from './utils/fs';
import { DECOMPRESSING_WORKSPACE_DIR } from './common';

export function toAbsolutePaths(
  basedir: Path,
  paths: readonly Path[] = [],
): Path[] {
  return paths.map((p) => resolve(basedir, p));
}

export async function scan(options: Options): Promise<PluginResponse> {
  try {
    debug.enabled = !!options?.debug;
    debug('options %o \n', options);
    const extractionDepthLimit = options['max-depth'] || 0;

    if (extractionDepthLimit < 0) {
      throw 'invalid options: --max-depth should be greater than or equal to 0.';
    }

    if (!options.path) {
      throw 'invalid options: no path provided.';
    }

    if (!fs.existsSync(options.path)) {
      throw `'${options.path}' does not exist.`;
    }

    const start = Date.now();

    const excludedPaths: FilePath[] = toAbsolutePaths(
      options.path,
      options.excludedPaths,
    );
    const [filePaths, archivePaths] = await find(options.path, excludedPaths);

    let extractionWorkspace: FilePath | null = null;

    if (0 < extractionDepthLimit && 0 < archivePaths.length) {
      const temporaryDir = await createTemporaryDir();
      extractionWorkspace = join(temporaryDir, DECOMPRESSING_WORKSPACE_DIR);

      await extract(archivePaths, temporaryDir, extractionDepthLimit);
      const [newFilePaths, newArchivePaths] = await find(
        extractionWorkspace,
        excludedPaths,
      );

      filePaths.push(...newFilePaths, ...newArchivePaths);
    } else {
      filePaths.push(...archivePaths);
    }

    debug('%d files found \n', filePaths.length);

    const signatures: SignatureResult[] = await computeSignaturesConcurrently(
      filePaths,
    );

    signatures.forEach((s) => {
      const src: FilePath =
        extractionWorkspace && s.path.includes(extractionWorkspace)
          ? extractionWorkspace
          : options.path;

      s.path = path.relative(src, s.path);
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
