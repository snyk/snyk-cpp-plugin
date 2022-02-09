import { promises } from 'fs';
import { join, extname, basename, relative } from 'path';
import { FilePath } from './types';
import {
  DECOMPRESSING_CONCURRENCY_LEVEL,
  EXTRACTED_DIR_SUFFIX,
} from './common';
import { debug } from './debug';

const pMap = require('p-map');
const AdmZip = require('adm-zip');
const tar = require('tar');

const { mkdir } = promises;

const zipFormats = ['.zip', '.zipx'];
const tarFormats = ['.tar', '.gz', '.tgz'];

interface ExtractionHandler {
  (path: FilePath): void;
}

async function handleExtraction(
  path: FilePath,
  temporaryDir: FilePath,
  childArchiveHandler: ExtractionHandler,
) {
  const extractionTarget: FilePath = join(
    temporaryDir,
    path.includes(temporaryDir)
      ? relative(temporaryDir, `${path}${EXTRACTED_DIR_SUFFIX}`)
      : basename(path),
  );

  await mkdir(extractionTarget, { recursive: true });

  if (isTar(path)) {
    await tar.x({
      file: path,
      cwd: extractionTarget,
      sync: true,
      onentry: (entry: any) => {
        const childAbsolutePath = join(extractionTarget, entry.path);

        if (isArchive(childAbsolutePath)) {
          childArchiveHandler(childAbsolutePath);
        }
      },
    });
  } else if (isZip(path)) {
    const zip = new AdmZip(path);
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
      await handleExtraction(archive, temporaryDir, (childArchive: FilePath) =>
        childArchives.push(childArchive),
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

export function filterArchives(paths: readonly FilePath[]): FilePath[] {
  return paths.filter((path) => isArchive(path));
}
