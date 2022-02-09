import { Stats, promises } from 'fs';
import { join } from 'path';
import { isSupportedSize } from './common';
import { debug } from './debug';
import { FilePath } from './types';

export const { readdir, lstat } = promises;

interface FileHandler {
  (path: FilePath, stats: Stats): void;
}

export async function find(src: string): Promise<FilePath[]> {
  const result: FilePath[] = [];

  await traverse(src, async (path: FilePath, stats: Stats) => {
    if (!isSupportedSize(stats.size)) {
      return;
    }

    result.push(path);
  });

  return result;
}

async function traverse(src: string, handle: FileHandler) {
  try {
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

        await traverse(absolute, handle);
      }
    }
  } catch (error) {
    debug(error.message || `Error reading file ${src}. ${error}`);
  }
}
