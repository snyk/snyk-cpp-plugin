import * as fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { MAX_SUPPORTED_FILE_SIZE } from './common';
import { debug } from './debug';

const readdir = promisify(fs.readdir);
export const stat = promisify(fs.stat);

interface FileHandler {
  (filePath: string, stats: fs.Stats): void;
}

export async function find(src: string): Promise<string[]> {
  const result: string[] = [];

  await traverse(src, (filePath: string, stats: fs.Stats) => {
    if (!stats.isFile() || stats.size > MAX_SUPPORTED_FILE_SIZE) {
      return;
    }

    result.push(filePath);
  });

  return result;
}

async function traverse(src: string, handle: FileHandler) {
  try {
    const stats = await stat(src);

    if (!stats.isDirectory()) {
      handle(src, stats);
      return;
    }

    const entries = await readdir(src);

    for (const entry of entries) {
      const absolute = join(src, entry);

      await traverse(absolute, handle);
    }
  } catch (error) {
    debug(error.message || `Error reading file ${src}. ${error}`);
  }
}
