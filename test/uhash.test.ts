import { promises } from 'fs';
import * as path from 'path';
import { SignatureResult } from '../lib/types';
import { getUhashSignature } from '../lib/uhash';
const { readFile } = promises;

describe('getUhashSignature', () => {
  it('returns correct SignatureResult for binary file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test02');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          data: '693e9af84d3dfcc71e640e00',
          format: 3,
        },
      ],
    };
    const actual = getUhashSignature(filePath, fileContents);
    expect(actual.hashes_ffm[0].data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test00');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          data: 'ecdb03f0e1e3630f7d70a9d5',
          format: 3,
        },
      ],
    };
    const actual = getUhashSignature(filePath, fileContents);
    expect(actual.hashes_ffm[0].data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file formatted with Windows line endings', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'config.bat');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 3,
          data: 'c908322f19dbf75e695b7517',
        },
      ],
    };
    const actual = getUhashSignature(filePath, fileContents);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file with only whitespace', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test01');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 3,
          data: 'd41d8cd98f00b204e9800998',
        },
      ],
    };
    const actual = getUhashSignature(filePath, fileContents);
    expect(actual?.hashes_ffm[0].data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file containing a UTF-8 BOM', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test03');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 3,
          data: 'd41d8cd98f00b204e9800998',
        },
      ],
    };
    const actual = getUhashSignature(filePath, fileContents);
    expect(actual.hashes_ffm[0].data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });
});
