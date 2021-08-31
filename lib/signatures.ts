import { promises } from 'fs';
import { SignatureResult } from './types';
import { getUhashSignature } from './uhash';

const { readFile } = promises;

export async function getSignature(
  filePath: string,
): Promise<SignatureResult | null> {
  try {
    const fileContents = await readFile(filePath);
    if (fileContents.length === 0) return null;

    return getUhashSignature(filePath, fileContents);
  } catch (err) {
    console.error(err);
    throw err;
  }
}
