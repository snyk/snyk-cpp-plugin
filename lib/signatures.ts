import { promises } from 'fs';
import { SignatureResult } from './types';
import { getUhashSignature } from './uhash';
import { getDubHashSignature } from './dubhash';

const { readFile } = promises;

// This will be replaced with a proper argument after discussing with Antonio
const SIGNATURE_FORMAT = 'dubhash';

export async function getSignature(
  filePath: string,
): Promise<SignatureResult | null> {
  try {
    const fileContents = await readFile(filePath);
    if (fileContents.length === 0) return null;
    return SIGNATURE_FORMAT === 'dubhash' ? getDubHashSignature(filePath, fileContents) : getUhashSignature(filePath, fileContents); 
  } catch (err) {
    console.error(err);
    throw err;
  }
}
