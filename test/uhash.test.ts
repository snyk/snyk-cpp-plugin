import { promises } from 'fs';
import * as path from 'path';
import { SignatureResult } from '../lib/types';
import { getUhashSignature } from '../lib/uhash';
const { readFile } = promises;

describe('getUhashSignature', () => {
  it('returns correct SignatureResult for binary file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dog.jpg');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          data: '95f0ec135ee38f07e07857d6',
          format: 3,
        },
      ],
    };
    const actual = getUhashSignature(filePath, fileContents);
    expect(actual.hashes_ffm[0].data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });

  it.only('returns correct SignatureResult for text file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'hello-world', 'add.cpp');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          data: 'd53b2679a07eb6ab82e60dbb',
          format: 3,
        },
      ],
    };
    const actual = getUhashSignature(filePath, fileContents);
    expect(actual.hashes_ffm[0].data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });
});
