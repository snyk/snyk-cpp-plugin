import { promises } from 'fs';
import { SignatureHashAlgorithm, SignatureResult } from './types';
import { getDubHashSignature } from './dubhash';
import { getUhashSignature } from './uhash';
import pMap = require('p-map');

const { readFile } = promises;

export async function getSignaturesByAlgorithm(
  filePaths: string[],
  hashType: SignatureHashAlgorithm = 'dubhash',
): Promise<(SignatureResult | null)[]> {
  if (hashType !== 'dubhash' && hashType !== 'uhash') {
    throw new Error(`Unsupported hashType ${hashType}`);
  }
  let signatureMapperToBeUsed = getDubHashSignatureMapper;
  if (hashType === 'uhash') {
    signatureMapperToBeUsed = getUHashSignatureMapper;
  }
  return await pMap(filePaths, signatureMapperToBeUsed, { concurrency: 20 });
}

async function getDubHashSignatureMapper(
  filePath: string,
): Promise<SignatureResult | null> {
  const fileContents = await readFile(filePath);
  if (fileContents.length === 0) return null;
  return getDubHashSignature(filePath, fileContents);
}

async function getUHashSignatureMapper(
  filePath: string,
): Promise<SignatureResult | null> {
  const fileContents = await readFile(filePath);
  if (fileContents.length === 0) return null;
  return getUhashSignature(filePath, fileContents);
}
