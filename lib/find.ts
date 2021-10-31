import * as fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { MAX_SUPPORTED_FILE_SIZE } from './config';
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
      const fileStat = await stat(absolutePath);
      if (fileStat.isDirectory()) {
        const subFiles = await find(absolutePath);
        for (const file of subFiles) {
          result.push(file);
        }
      }
      if (fileStat.isFile()) {
        if (fileStat.size > MAX_SUPPORTED_FILE_SIZE) {
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
