import * as fs from 'fs';
import { SignatureResult } from './types';
import { fossidNative } from 'fossid-native';

export async function getSignature(filePath: string): Promise<SignatureResult> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data: Uint8Array) => {
      if (err) reject(err);
      resolve(JSON.parse(fossidNative.getSignature(filePath, data)));
    });
  });
}
