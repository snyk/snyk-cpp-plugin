// This module implements the uhash specification (v1.0) described in docs/uhash1-0
// import * as xxhash from 'xxhash';
import * as crypto from 'crypto';
import { SignatureResult } from './types';
import { isBinary } from './utils/binary';

const hashAlgorithm = 'md5';
const regex = /\s/g;

export const getUhashSignature = (
  filePath: string,
  fileContents: Buffer,
): SignatureResult => {
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
};

const getUhashDigest = (fileContents: Buffer, isBinary: boolean): string => {
  const file = isBinary
    ? fileContents
    : removeWhiteSpace(fileContents.toString());
  if (hashAlgorithm == 'md5') {
    const hash = crypto.createHash(hashAlgorithm).update(file);
    return hash.digest('hex');
  } else {
    // return xxhash.hash64(fileContents, 0xcafebabe).digest();
    return '';
  }
};

const removeWhiteSpace = (fileContents: string): string => {
  return fileContents.replace(regex, '');
};
