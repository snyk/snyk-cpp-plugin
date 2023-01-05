import { promises } from 'fs';
import { FileContent, FilePath, SignatureResult } from './types';
import { computeHash } from './hash';
import { HASHING_CONCURRENCY_LEVEL } from './common';
import { debug } from './debug';

import pMap = require('p-map');

const { readFile } = promises;

export async function computeSignaturesConcurrently(
  paths: FilePath[],
): Promise<SignatureResult[]> {
  const start = Date.now();

  const result = pMap(
    paths,
    async (path: FilePath) => {
      const content: FileContent = await readFile(path);
      return await computeHash(path, content);
    },
    { concurrency: HASHING_CONCURRENCY_LEVEL },
  );

  const totalMilliseconds = Date.now() - start;
  debug(`elapsed time in pMap: ${totalMilliseconds} ms \n`);

  return result;
}
