import * as fs from 'fs';
import { join } from 'path';
import { relative } from 'path';
import { promisify } from 'util';
import { debug } from './debug';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export async function find(dir: string, basedir?: string): Promise<string[]> {
  if (basedir === undefined) {
    basedir = dir;
  }

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
        const subFiles = await find(absolutePath, basedir);
        for (const file of subFiles) {
          result.push(file);
        }
      }

      if (fileStat.isFile()) {
        result.push(relative(basedir, absolutePath));
      }
    } catch (error) {
      debug(error.message || `Error reading file ${relativePath}. ${error}`);
    }
  }

  return result;
}
