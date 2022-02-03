import { promises } from 'fs';
import { FileContent, FilePath, SignatureResult } from './types';
import { computeHash } from './hash';
import { CONCURRENCY_LEVEL } from './common';

import pMap = require('p-map');

const { readFile } = promises;

export async function computeSignaturesConcurrently(
  paths: FilePath[],
): Promise<SignatureResult[]> {
  return pMap(
    paths,
    async (path: FilePath) => {
      const content: FileContent = await readFile(path);
      return await computeHash(path, content);
    },
    { concurrency: CONCURRENCY_LEVEL },
  );
}
