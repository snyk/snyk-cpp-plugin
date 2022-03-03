import { Stats, promises } from 'fs';
import { join } from 'path';
import { isSupportedSize } from './common';
import { debug } from './debug';
import { FilePath, Path, Predicate } from './types';
import { isArchive } from './extract';

export const { readdir, lstat } = promises;

interface FileHandler {
  (path: FilePath, stats: Stats): void;
}

export async function find(
  src: string,
  excluded: readonly Path[] = [],
): Promise<[FilePath[], FilePath[]]> {
  const fileResults: FilePath[] = [];
  const archiveResults: FilePath[] = [];

  const handler = async (path: FilePath, stats: Stats) => {
    if (!isSupportedSize(stats.size)) {
      return;
    }

    if (isArchive(path)) {
      archiveResults.push(path);
      return;
    }

    fileResults.push(path);
  };

  await traverse(src, handler, (p) => excluded.includes(p));

  return [fileResults, archiveResults];
}

async function traverse(
  src: string,
  handle: FileHandler,
  isExcluded: Predicate<Path, boolean>,
) {
  try {
    if (isExcluded(src)) {
      return;
    }

    const stats = await lstat(src);

    if (stats.isSymbolicLink()) {
      return;
    }

    if (stats.isFile()) {
      handle(src, stats);
      return;
    }

    if (stats.isDirectory()) {
      const entries = await readdir(src);

      for (const entry of entries) {
        const absolute = join(src, entry);

        await traverse(absolute, handle, isExcluded);
      }
    }
  } catch (error) {
    debug(error.message || `Error reading file ${src}. ${error}`);
  }
}
