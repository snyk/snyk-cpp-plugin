import * as fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { MAX_SUPPORTED_FILE_SIZE } from './common';
import { debug } from './debug';

const readdir = promisify(fs.readdir);
export const stat = promisify(fs.stat);

export async function find(dir: string): Promise<string[]> {
  const dirStat = await stat(dir);
  if (!dirStat.isDirectory()) {
    throw new Error(`${dir} is not a directory`);
  }

  const paths = await readdir(dir);
  const absolutePaths: string[] = [];
  for (const relativePath of paths) {
    absolutePaths.push(join(dir, relativePath));
  }

  return await extractFilePaths(absolutePaths);
}

export async function extractFilePaths(
  absolutePaths: string[],
): Promise<string[]> {
  const result: string[] = [];
  for (const absolutePath of absolutePaths) {
    try {
      const fileStats = await stat(absolutePath);
      if (fileStats.isDirectory()) {
        const subFiles = await find(absolutePath);
        result.push(...subFiles);
      } else if (fileStats.isFile()) {
        if (fileStats.size > MAX_SUPPORTED_FILE_SIZE) {
          continue;
        }
        result.push(absolutePath);
      }
    } catch (error) {
      debug(error.message || `Error reading file ${absolutePath}. ${error}`);
    }
  }

  return result;
}
