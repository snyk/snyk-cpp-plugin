import { promises } from 'fs';
import { SignatureFormat, SignatureResult } from './types';
import { getDubHashSignature } from './dubhash';
import { getUhashSignature } from './uhash';
import pMap = require('p-map');
import { join } from 'path';

const { readFile } = promises;

type Signer = (path: string, content: Buffer) => SignatureResult | null;
interface SignatureFormatMap {
  [SignatureFormat: string]: Signer;
}

const algorithms: SignatureFormatMap = {
  dubhash: getDubHashSignature,
  uhash: getUhashSignature,
};

export async function getSignaturesByAlgorithm(
  baseDir: string,
  filePaths: string[],
  hashType: SignatureFormat = 'dubhash',
): Promise<(SignatureResult | null)[]> {
  const getSignature = algorithms[hashType];

  if (getSignature === undefined) {
    throw new Error(`Unsupported hashType ${hashType}`);
  }

  const generateSignatureFromPath = async (path: string) => {
    const absolutePath = join(baseDir, path);
    const fileContents = await readFile(absolutePath);

    if (fileContents.length === 0) return null;

    return getSignature(path, fileContents);
  };

  return await pMap(filePaths, generateSignatureFromPath, {
    concurrency: 20,
  });
}
