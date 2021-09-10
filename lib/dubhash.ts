// This module implements the "double hash" signature specification described in docs/signature_specification.md
import * as crypto from 'crypto';
import { SignatureResult } from './types';
import { isBinary } from './utils/binary';

const hashAlgorithm = 'md5';

const regex = /=/g;

enum LineEndingFormat {
  LINUX,
  WINDOWS,
  UNKNOWN,
}

const CR = 0x0d;
const LF = 0x0a;

type DubHashResult = [string, string] | [string, null];

export function getDubHashSignature(
  filePath: string,
  fileContents: Buffer,
  getAltHash = false,
): SignatureResult | null {
  // Unless getAltHash is true, we only need a single hash, AKA the "half double hash".
  if (!getAltHash) {
    return {
      path: filePath,
      hashes_ffm: [
        {
          data: getSingleDigest(fileContents),
          format: 1,
        },
      ],
    };
  }

  const [digest1, digest2] = getDubHashDigests(
    fileContents,
    isBinary(fileContents),
  );
  if (!digest1) throw Error(`Failed to generate hash of ${filePath}`);
  if (digest1 && !digest2) {
    return {
      path: filePath,
      hashes_ffm: [
        {
          data: digest1,
          format: 1,
        },
      ],
    };
  }
  return {
    path: filePath,
    hashes_ffm: [
      {
        data: digest1,
        format: 1,
      },
      {
        data: digest2 as string, // digest2 is guaranteed not to be null, due to earlier return
        format: 1,
      },
    ],
  };
}

function getDubHashDigests(
  fileContents: Buffer,
  isBinary: boolean,
): DubHashResult {
  // If the file is binary, you only produce one hash
  // If the file does not have line endings, you treat it like a binary file
  // If the LF character is not found, the line endings are UNKNOWN, and we produce only one hash.
  const lineEndingFormat: LineEndingFormat = detectLineEndingFormat(
    fileContents,
  );
  if (
    isBinary ||
    !hasLineEndings(fileContents) ||
    lineEndingFormat === LineEndingFormat.UNKNOWN
  ) {
    return [getSingleDigest(fileContents), null];
  }
  // NB: You MUST calculate the digest for the original file and store it, since transformLineEndings
  // will modify fileContents buffer.
  const digestForOriginal = getSingleDigest(fileContents);
  const transformedFile = transformLineEndings(fileContents, lineEndingFormat);
  return [digestForOriginal, getSingleDigest(transformedFile)];
}

function hasLineEndings(fileContents: Buffer): boolean {
  const lineEndingBytes = new Uint8Array([LF, CR]);
  for (let readIndex = 0; readIndex < fileContents.length; readIndex++) {
    if (lineEndingBytes.includes(fileContents[readIndex])) {
      return true;
    }
  }
  return false;
}

function detectLineEndingFormat(fileContents: Buffer): LineEndingFormat {
  for (let readIndex = 0; readIndex < fileContents.length; readIndex++) {
    if (fileContents[readIndex] !== LF) {
      continue;
    }
    // If the first character in the file is LF (0x0a), the file is of type LINUX.
    if (readIndex === 0) {
      return LineEndingFormat.LINUX;
    }
    // If the file has a LF character (0x0a), check if the previous character is 0x0d (CR),
    // then the newline type is WINDOWS
    if (fileContents[readIndex - 1] === CR) {
      return LineEndingFormat.WINDOWS;
    }
    return LineEndingFormat.LINUX;
  }
  // If the LF character is not found, the line endings are UNKNOWN.
  return LineEndingFormat.UNKNOWN;
}

function transformLinuxToWindows(fileContents: Buffer): Buffer {
  // In worst case, file is all 0x0a bytes, so we need to allocate double the memory
  const transformedFile = Buffer.alloc(2 * fileContents.length);
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < fileContents.length; readIndex++) {
    // if byte is CR (0x0d), do not write byte
    if (fileContents[readIndex] === CR) {
      continue;
    }
    // if byte is LF and targetLineEndingFormat is WINDOWS, write CR (0x0d) LF (0x0a)
    // NB1: Check for targetLineEndingFormat === LineEndingFormat.WINDOWS is obviously not necessary here,
    // NB2: LineEndingFormat.UNKOWN is also not possible here, due to early return in getDubHashDigests
    if (fileContents[readIndex] === LF) {
      transformedFile[writeIndex] = CR;
      transformedFile[writeIndex + 1] = LF;
      writeIndex += 2;
      continue;
    }
    // else: write byte
    transformedFile[writeIndex] = fileContents[readIndex];
    writeIndex++;
  }
  return transformedFile.slice(0, writeIndex);
}

function transformWindowsToLinux(fileContents: Buffer): Buffer {
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < fileContents.length; readIndex++) {
    // if byte is CR (0x0d), do not write byte
    if (fileContents[readIndex] === CR) {
      continue;
    }
    // if byte is LF (0x0a): if target line ending is UNIX, write LF (0x0a)
    // NB1: Check for targetLineEndingFormat === LineEndingFormat.WINDOWS is obviously not necessary here,
    // NB2: LineEndingFormat.UNKOWN is also not possible here, due to early return in getDubHashDigests
    if (fileContents[readIndex] === LF) {
      if (readIndex !== writeIndex) fileContents[writeIndex] = LF;
      writeIndex++;
      continue;
    }
    // else: write byte
    if (readIndex !== writeIndex)
      fileContents[writeIndex] = fileContents[readIndex];
    writeIndex++;
  }
  return fileContents.slice(0, writeIndex);
}

function transformLineEndings(
  fileContents: Buffer,
  lineEndingFormat: LineEndingFormat,
): Buffer {
  const targetLineEndingFormat =
    lineEndingFormat === LineEndingFormat.LINUX
      ? LineEndingFormat.WINDOWS
      : LineEndingFormat.LINUX;
  if (targetLineEndingFormat === LineEndingFormat.WINDOWS)
    return transformLinuxToWindows(fileContents);
  if (targetLineEndingFormat === LineEndingFormat.LINUX)
    return transformWindowsToLinux(fileContents);
  // This line is unreachable, but Typescript doesn't know it because of LineEndingFormat.UNKNOWN.
  return Buffer.from('');
}

function getSingleDigest(fileContents: Buffer): string {
  if (hashAlgorithm == 'md5') {
    const hash = crypto.createHash(hashAlgorithm).update(fileContents);
    return hash.digest('base64').replace(regex, '');
  } else {
    // Placeholder for other planned hash algorithms, e.g. xxhash
    // return xxhash.hash64(fileContents, 0xcafebabe).digest();
    return '';
  }
}
