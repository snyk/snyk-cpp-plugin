import * as fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { debug } from './debug';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const MAX_FILE_SIZE: number = 2 * 1024 * 1024 * 1024;

interface SkippedFile {
  path: string;
  reason: string;
}

interface FindResult {
  filePaths: string[];
  skippedFiles: SkippedFile[];
}

export async function find(dir: string): Promise<FindResult> {
  const result: FindResult = { filePaths: [], skippedFiles: [] };

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

        result.filePaths = result.filePaths.concat(subFiles.filePaths);
        result.skippedFiles = result.skippedFiles.concat(subFiles.skippedFiles);
      } else if (fileStat.isFile()) {
        if (fileStat.size >= MAX_FILE_SIZE) {
          result.skippedFiles.push({
            path: absolutePath,
            reason: 'file too large',
          });
        } else {
          result.filePaths.push(absolutePath);
        }
      }
    } catch (error) {
      debug(error.message || `Error reading file ${relativePath}. ${error}`);
    }
  }

  return result;
}
