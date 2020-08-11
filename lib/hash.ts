import * as fs from 'fs';
import * as crypto from 'crypto';

async function readFile(
  fileStream: fs.ReadStream,
  encoding = 'utf8',
): Promise<string> {
  fileStream.setEncoding(encoding);
  return new Promise((resolve, reject) => {
    let data = '';
    fileStream.on('data', (chunk) => (data += chunk));
    fileStream.on('end', () => resolve(data));
    fileStream.on('error', (error) => reject(error));
  });
}

export async function hash(filePath: string): Promise<string> {
  const fileStream = fs.createReadStream(filePath);
  const fileContent = await readFile(fileStream);
  return crypto
    .createHash('md5')
    .update(fileContent)
    .digest('hex');
}
