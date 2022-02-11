import { promises } from 'fs';
import { join, extname, basename, relative, dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FilePath } from './types';
import {
  DECOMPRESSING_CONCURRENCY_LEVEL,
  DECOMPRESSING_IGNORE_DIR,
  DECOMPRESSING_WORKSPACE_DIR,
} from './common';
import { debug } from './debug';

const pMap = require('p-map');
const AdmZip = require('adm-zip');
const tar = require('tar');

const { mkdir, rename } = promises;

const zipFormats = ['.zip', '.zipx'];
const tarFormats = ['.tar', '.gz', '.tgz'];

interface ExtractionHandler {
  (path: FilePath): void;
}

async function handleExtraction(
  path: FilePath,
  temporaryDir: FilePath,
  keepArchive: boolean,
  childArchiveHandler: ExtractionHandler,
) {
  const extractionSource: FilePath = keepArchive
    ? path
    : join(
        temporaryDir,
        DECOMPRESSING_IGNORE_DIR,
        `${uuidv4()}-${basename(path)}`,
      );

  if (!keepArchive) {
    await mkdir(dirname(extractionSource), { recursive: true });
    await rename(path, extractionSource);
  }

  const extractionTarget: FilePath = join(
    temporaryDir,
    DECOMPRESSING_WORKSPACE_DIR,

    path.includes(temporaryDir)
      ? relative(join(temporaryDir, DECOMPRESSING_WORKSPACE_DIR), path)
      : basename(path),
  );

  await mkdir(extractionTarget, { recursive: true });

  if (isTar(extractionSource)) {
    await tar.x({
      file: extractionSource,
      cwd: extractionTarget,
      sync: true,
      onentry: (entry: any) => {
        const childAbsolutePath = join(extractionTarget, entry.path);

        if (isArchive(childAbsolutePath)) {
          childArchiveHandler(childAbsolutePath);
        }
      },
    });
  } else if (isZip(extractionSource)) {
    const zip = new AdmZip(extractionSource);
    await pMap(
      zip.getEntries(),
      (entry: any) => {
        const childAbsolutePath = join(extractionTarget, entry.entryName);
        zip.extractEntryTo(entry.entryName, extractionTarget, true, true);

        if (isArchive(childAbsolutePath)) {
          childArchiveHandler(childAbsolutePath);
        }
      },
      { concurrency: DECOMPRESSING_CONCURRENCY_LEVEL },
    );
  }
}

export async function extract(
  archives: readonly FilePath[],
  temporaryDir: FilePath,
  depthLimit: number,
  depth = 0,
): Promise<void> {
  if (depth >= depthLimit) {
    return;
  }

  const childArchives: FilePath[] = [];

  for (const archive of archives) {
    try {
      const keepArchive = 0 === depth;

      await handleExtraction(
        archive,
        temporaryDir,
        keepArchive,
        (childArchive: FilePath) => childArchives.push(childArchive),
      );
    } catch (err) {
      debug(`Could not extract archive: ${archive} ${err}`);
    }
  }

  if (childArchives.length > 0) {
    await extract(childArchives, temporaryDir, depthLimit, depth + 1);
  }
}

export function isTar(path: FilePath): boolean {
  return tarFormats.includes(extname(path));
}

export function isZip(path: FilePath): boolean {
  return zipFormats.includes(extname(path));
}

export function isArchive(path: FilePath): boolean {
  return isTar(path) || isZip(path);
}
