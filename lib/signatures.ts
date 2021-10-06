import { promises } from 'fs';
import { SignatureHashAlgorithm, SignatureResult } from './types';
import { debug } from './debug';
import { getDubHashSignature } from './dubhash';
import { getUhashSignature } from './uhash';
import pMap = require('p-map');

const { readFile } = promises;

const getAltHash = false;

export async function getSignaturesByAlgorithm(
  filePaths: string[],
  hashType: SignatureHashAlgorithm = 'uhash',
): Promise<(SignatureResult | null)[]> {
  if (hashType !== 'dubhash' && hashType !== 'uhash') {
    throw new Error(`Unsupported hashType ${hashType}`);
  }
  let signatureMapperToBeUsed = getHalfDubHashSignatureMapper;
  if (hashType === 'uhash') {
    signatureMapperToBeUsed = getUHashSignatureMapper;
  } else if (getAltHash) {
    signatureMapperToBeUsed = getDubHashSignatureMapper;
  }
  debug(`Creating signatures using ${hashType}\n`)
  if (hashType === 'dubhash') {
    debug(`getAltHash: ${getAltHash}\n`)
  }
  return await pMap(filePaths, signatureMapperToBeUsed, { concurrency: 20 });
}

async function getDubHashSignatureMapper(
  filePath: string,
): Promise<SignatureResult | null> {
  const fileContents = await readFile(filePath);
  if (fileContents.length === 0) return null;
  return getDubHashSignature(filePath, fileContents, true);
}

async function getHalfDubHashSignatureMapper(
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
