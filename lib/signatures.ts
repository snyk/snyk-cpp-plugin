import { promises } from 'fs';
import { FileContent, FilePath, SignatureResult } from './types';
import { getHashSignature } from './hash';
import pMap = require('p-map');

const { readFile } = promises;

export async function getSignatures(
  paths: FilePath[],
): Promise<(SignatureResult | null)[]> {
  return pMap(
    paths,
    async (path: FilePath) => {
      const content: FileContent = await readFile(path);

      return content.length > 0 ? await getHashSignature(path, content) : null;
    },
    { concurrency: 20 },
  );
}
