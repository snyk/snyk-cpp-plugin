// This module implements the "uhash" signature specification described in docs/signature_specification.md
import * as crypto from 'crypto';
import { SignatureResult } from './types';
import { isBinary } from './utils/binary';

const hashAlgorithm = 'md5';
const Utf8Bom = Buffer.from(new Uint8Array([0xef, 0xbb, 0xbf]));

export function getUhashSignature(
  filePath: string,
  fileContents: Buffer,
): SignatureResult {
  const digest = getUhashDigest(fileContents, isBinary(fileContents));
  const data = digest.slice(0, 24);
  return {
    path: filePath,
    hashes_ffm: [
      {
        data,
        format: 3,
      },
    ],
  };
}

function getUhashDigest(fileContents: Buffer, isBinary: boolean): string {
  if (hashAlgorithm !== 'md5') {
    // placeholder for non-md5 hashing algorithm, e.g. xxhash
    throw new Error(`hashAlgorithm ${hashAlgorithm} is not supported`);
  }
  const file = isBinary ? fileContents : removeUnwantedBytes(fileContents);
  const hash = crypto.createHash(hashAlgorithm).update(file);
  return hash.digest('hex');
}

function removeUnwantedBytes(fileBuffer: Buffer): Buffer {
  const startingIndex = isUtf8BomPresent(fileBuffer) ? 3 : 0;
  return removeWhitespaceBytewise(fileBuffer, startingIndex);
}

function isUtf8BomPresent(fileBuffer: Buffer): boolean {
  if (fileBuffer.length < 3) return false;
  return Utf8Bom.compare(fileBuffer.subarray(0, 3)) === 0;
}

function removeWhitespaceBytewise(
  fileBuffer: Buffer,
  startingIndex: number,
): Buffer {
  const BYTES_TO_REMOVE = new Uint8Array([0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20]);
  let writeIndex = 0;
  for (
    let readIndex = startingIndex;
    readIndex < fileBuffer.length;
    readIndex++
  ) {
    if (!BYTES_TO_REMOVE.includes(fileBuffer[readIndex])) {
      fileBuffer[writeIndex] = fileBuffer[readIndex];
      writeIndex++;
    }
  }
  return fileBuffer.slice(0, writeIndex);
}
