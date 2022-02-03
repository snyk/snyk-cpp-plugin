import * as crypto from 'crypto';
import { FileContent, FilePath, FullFileHash, SignatureResult } from './types';
import { isBinary } from './utils/binary';
import { removeWhitespaces } from './utils/format';

enum DigestFormat {
  BASE64 = 'base64',
  HEX = 'hex',
}

enum HashAlgorithm {
  MD5 = 'md5',
  OTHER = 'other',
}

const usedHashAlgorithm: HashAlgorithm = HashAlgorithm.MD5;

export async function computeHash(
  path: FilePath,
  content: FileContent,
): Promise<SignatureResult> {
  const hashes: FullFileHash[] = await Promise.all([
    computeSingleHash(content),
    computeUHash(content),
  ]);

  return {
    path: path,
    size: content.length,
    hashes_ffm: hashes,
  };
}

export async function computeSingleHash(
  content: FileContent,
): Promise<FullFileHash> {
  const hash = crypto.createHash(usedHashAlgorithm).update(content);
  const base64Digest = hash.digest(DigestFormat.BASE64).replace(/=/g, '');

  return {
    data: base64Digest,
    format: 1,
  };
}

export async function computeUHash(
  content: FileContent,
): Promise<FullFileHash> {
  const file = isBinary(content) ? content : removeWhitespaces(content);

  const hash = crypto.createHash(usedHashAlgorithm).update(file);
  const hexDigest = hash.digest(DigestFormat.HEX).slice(0, 24);

  return {
    data: hexDigest,
    format: 3,
  };
}
