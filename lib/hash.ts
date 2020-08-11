import * as crypto from 'crypto';
import * as fs from 'fs';

export async function hash(
  filePath: string,
  fileEncoding = 'utf8',
  hashAlgorithm = 'md5',
  hashEncoding: crypto.HexBase64Latin1Encoding = 'hex',
): Promise<string> {
  const fileStream = fs.createReadStream(filePath, { encoding: fileEncoding });
  const fileHash = crypto.createHash(hashAlgorithm);
  return new Promise((resolve, reject) => {
    fileStream.on('data', (data) => fileHash.update(data));
    fileStream.on('end', () => resolve(fileHash.digest(hashEncoding)));
    fileStream.on('error', (error) => reject(error));
  });
}
