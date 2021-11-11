import { promises } from 'fs';
import { SignatureResult } from './types';
import { getHashSignature } from './hash';
import pMap = require('p-map');

const { readFile } = promises;

export async function getSignatures(
  filePaths: string[],
): Promise<(SignatureResult | null)[]> {
  return await pMap(
    filePaths,
    async (path: string) => {
      const contents = await readFile(path);
      return contents.length > 0 ? getHashSignature(path, contents) : null;
    },
    { concurrency: 20 },
  );
}
