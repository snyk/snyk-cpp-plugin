import { promises } from 'fs';
import { SignatureResult } from './types';
import { getDubHashSignature } from './dubhash';

const { readFile } = promises;

export async function getSignature(
  filePath: string,
): Promise<SignatureResult | null> {
  try {
    const fileContents = await readFile(filePath);
    if (fileContents.length === 0) return null;
    return getDubHashSignature(filePath, fileContents);
  } catch (err) {
    console.error(err);
    throw err;
  }
}
