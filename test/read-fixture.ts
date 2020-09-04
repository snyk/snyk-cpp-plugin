import { readFile } from 'fs';
import { join } from 'path';

export function readFixture(
  fixture: string,
  filename: string,
): Promise<string> {
  const dir = join('./', 'test', 'fixtures', fixture);
  const file = join(dir, filename);
  return new Promise((resolve, reject) => {
    readFile(file, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
