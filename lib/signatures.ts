import { promises } from 'fs';
import { SignatureHashAlgorithm, SignatureResult } from './types';
import { getDubHashSignature } from './dubhash';
import { getUhashSignature } from './uhash';
import pMap = require('p-map');
import { join } from 'path';

const { readFile } = promises;

export async function getSignaturesByAlgorithm(
  baseDir: string,
  filePaths: string[],
  hashType: SignatureHashAlgorithm = 'dubhash',
): Promise<(SignatureResult | null)[]> {
  if (hashType !== 'dubhash' && hashType !== 'uhash') {
    throw new Error(`Unsupported hashType ${hashType}`);
  }
  let signatureMapperToBeUsed = getDubHashSignatureMapper(baseDir);
  if (hashType === 'uhash') {
    signatureMapperToBeUsed = getUHashSignatureMapper(baseDir);
  }
  return await pMap(filePaths, signatureMapperToBeUsed, {
    concurrency: 20,
  });
}

interface HashSignatureMapper {
  (path: string): Promise<SignatureResult | null>;
}

function getDubHashSignatureMapper(baseDir: string): HashSignatureMapper {
  return async function(filePath: string): Promise<SignatureResult | null> {
    const absolutePath = join(baseDir, filePath);
    const fileContents = await readFile(absolutePath);

    if (fileContents.length === 0) return null;
    return getDubHashSignature(filePath, fileContents);
  };
}

function getUHashSignatureMapper(baseDir: string): HashSignatureMapper {
  return async function(filePath: string): Promise<SignatureResult | null> {
    const absolutePath = join(baseDir, filePath);
    const fileContents = await readFile(absolutePath);

    if (fileContents.length === 0) return null;
    return getUhashSignature(filePath, fileContents);
  };
}
