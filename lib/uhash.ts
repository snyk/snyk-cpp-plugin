// This module implements the uhash specification (v1.0) described in docs/signature_specification.md
// import * as xxhash from 'xxhash';
// The version in this branch contains several different implementation options, which are intended for
// benchmarking purposes
import * as crypto from 'crypto';
import { SignatureResult } from './types';
import { isBinary } from './utils/binary';

const hashAlgorithm = 'md5';
// const regex = /\s/g;

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
    : removeWhitespace(fileContents);
  if (hashAlgorithm == 'md5') {
    const hash = crypto.createHash(hashAlgorithm).update(file);
    return hash.digest('hex');
  } else {
    // placeholder for non-md5 hashing algorithm, e.g. xxhash
    // return xxhash.hash64(fileContents, 0xcafebabe).digest();
    return '';
  }
};

export const removeWhitespace = (fileContents: Buffer): Buffer => {
  return removeWhitespaceBytewise(fileContents);
};

const regex = /\s/g;

export const removeWhitespaceRegex = (fileContents: Buffer): Buffer => {
  return Buffer.from(fileContents.toString().replace(regex, ''));
};

// hex => integer as follows: 09 => 9, 0a => 10, 0b => 11, 0c => 12, 0d => 13, 20 => 32
// WARNING: The below methods don't actually work! Was still searching for a
// regex that could be used for operating on a hex string
// const regex2 = /(09|0a|0b|0c|0d|20)(?=(?:[\da-f]{2})*$)/g;
const regex2 = /(?:..)*?(09|0a|0b|0c|0d|20)/g;

export const removeWhitespaceRegex2 = (fileContents: Buffer): Buffer => {
  return Buffer.from(fileContents.toString('hex').replace(regex2, ''), 'hex');
};

export const removeWhitespaceBytewise = (fileBuffer: Buffer): Buffer => {
  const BYTES_TO_REMOVE = new Uint8Array([0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20]);
  const filteredBuffer = removeBytesFromBuffer(fileBuffer, BYTES_TO_REMOVE);
  return filteredBuffer;
};

export const removeWhitespaceBytewise2 = (fileBuffer: Buffer): Buffer => {
  const BYTES_TO_REMOVE = [9, 10, 11, 12, 13, 32];
  const filteredBuffer = removeBytesFromBuffer2(fileBuffer, BYTES_TO_REMOVE);
  return filteredBuffer;
};

export const removeWhitespaceBytewise3 = (fileBuffer: Buffer): Buffer => {
  const BYTES_TO_REMOVE = new Uint8Array([0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20]);
  const filteredBuffer = removeBytesFromBuffer3(fileBuffer, BYTES_TO_REMOVE);
  return filteredBuffer;
};

export const removeWhitespaceBytewise4 = (fileBuffer: Buffer): Buffer => {
  const BYTES_TO_REMOVE = new Uint8Array([0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20]);
  const filteredBuffer = removeBytesFromBuffer4(fileBuffer, BYTES_TO_REMOVE);
  return filteredBuffer;
};

export const removeWhitespaceBytewise5 = (fileBuffer: Uint8Array): Uint8Array => {
  const BYTES_TO_REMOVE = new Uint8Array([0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20]);
  const filteredBuffer = removeBytesFromBuffer5(fileBuffer, BYTES_TO_REMOVE);
  return filteredBuffer;
};

export const removeWhitespaceBytewise6 = (fileBuffer: Buffer): Uint8Array => {
  const BYTES_TO_REMOVE = new Uint8Array([0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20]);
  const filteredBuffer = removeBytesFromBuffer6(fileBuffer, BYTES_TO_REMOVE);
  return filteredBuffer;
};

export const removeBytesFromBuffer = (
  buffer: Buffer,
  valuesToRemove: Uint8Array,
): Buffer => {
  return buffer.filter((el) => {
    return !valuesToRemove.includes(el);
  }) as Buffer;
};

const removeBytesFromBuffer2 = (
  buffer: Buffer,
  valuesToRemove: number[],
): Buffer => {
  return buffer.filter((el) => {
    return !valuesToRemove.includes(el);
  }) as Buffer;
};

const removeBytesFromBuffer3 = (
  fileBuffer: Buffer,
  valuesToRemove: Uint8Array,
): Buffer => {
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < fileBuffer.length; readIndex++) {
    if (!valuesToRemove.includes(fileBuffer[readIndex])) {
      fileBuffer[writeIndex] = fileBuffer[readIndex];
      writeIndex++;
    }
  }
  const filteredBuffer = fileBuffer.subarray(0, writeIndex);
  return Buffer.from(filteredBuffer);
};

const removeBytesFromBuffer4 = (
  fileBuffer: Buffer,
  valuesToRemove: Uint8Array,
): Buffer => {
  let writeIndex = 0;
  fileBuffer.forEach((byte) => {
    if (!valuesToRemove.includes(byte)) {
      fileBuffer[writeIndex] = byte;
      writeIndex++;
    }
  });
  const filteredBuffer = fileBuffer.subarray(0, writeIndex);
  return Buffer.from(filteredBuffer);
};

const removeBytesFromBuffer5 = (
  fileBuffer: Uint8Array,
  valuesToRemove: Uint8Array,
): Uint8Array => {
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < fileBuffer.length; readIndex++) {
    if (!valuesToRemove.includes(fileBuffer[readIndex])) {
      fileBuffer[writeIndex] = fileBuffer[readIndex];
      writeIndex++;
    }
  }
  return fileBuffer.subarray(0, writeIndex);
};

const removeBytesFromBuffer6 = (
  fileBuffer: Buffer,
  valuesToRemove: Uint8Array,
): Buffer => {
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < fileBuffer.length; readIndex++) {
    if (!valuesToRemove.includes(fileBuffer[readIndex])) {
      fileBuffer[writeIndex] = fileBuffer[readIndex];
      writeIndex++;
    }
  }
  return fileBuffer.slice(0, writeIndex);
};