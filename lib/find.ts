import * as fs from 'fs';
import * as path from 'path';
import { SupportFileExtensions } from './types';
import Debug from 'debug';

const debug = Debug('snyk-cpp-plugin');

export async function find(dir: string): Promise<string[]> {
  const result: string[] = [];

  const dirStat = fs.statSync(dir);
  if (!dirStat.isDirectory()) {
    throw new Error(`${dir} is not a directory`);
  }

  const paths = fs.readdirSync(dir);

  for (const relativePath of paths) {
    const absolutePath = path.join(dir, relativePath);
    try {
      const stat = fs.statSync(absolutePath);
      if (stat.isDirectory()) {
        const subFiles = await find(absolutePath);
        result.push(...subFiles);
      }
      if (stat.isFile()) {
        const ext = path.extname(absolutePath);
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
