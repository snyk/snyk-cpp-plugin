import { Stats, promises } from 'fs';
import { join } from 'path';
import { isSupportedSize } from './common';
import { debug } from './debug';
import { FilePath, Path, Predicate } from './types';
import { isArchive } from './extract';
import * as minimatch from 'minimatch';
import { Glob } from './utils/dotsnyk/types';

export const { readdir, lstat } = promises;

interface FileHandler {
  (path: FilePath, stats: Stats): void;
}

export async function find(
  src: Path,
  excludePatterns: readonly Glob[] = [],
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

  const isExcluded: Predicate<Path> = (path) => {
    return !!excludePatterns.find((pattern) => minimatch(path, pattern));
  };

  await traverse(src, handler, isExcluded);

  return [fileResults, archiveResults];
}

async function traverse(
  src: Path,
  handle: FileHandler,
  isExcluded: Predicate<Path>,
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
