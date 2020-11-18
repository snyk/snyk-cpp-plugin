import * as fs from 'fs';
import { join, extname } from 'path';
import { promisify } from 'util';
import { SupportFileExtensions } from './types';
import { debug } from './debug';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export async function find(dir: string): Promise<string[]> {
  const result: string[] = [];

  const dirStat = await stat(dir);
  if (!dirStat.isDirectory()) {
    throw new Error(`${dir} is not a directory`);
  }

  const paths = await readdir(dir);

  for (const relativePath of paths) {
    const absolutePath = join(dir, relativePath);
    try {
      const fileStat = await stat(absolutePath);
      if (fileStat.isDirectory()) {
        const subFiles = await find(absolutePath);
        for (const file of subFiles) {
          result.push(file);
        }
      }
      if (fileStat.isFile()) {
        const ext = extname(absolutePath);
        if (SupportFileExtensions.includes(ext)) {
          result.push(absolutePath);
        }
      }
    } catch (error) {
      debug(error.message || `Error reading file ${relativePath}. ${error}`);
    }
  }

  return result;
}
