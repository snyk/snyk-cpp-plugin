import { promises } from 'fs';
import * as path from 'path';
import { SignatureResult } from '../lib/types';
import { getDubHashSignature } from '../lib/dubhash';
const { readFile } = promises;

describe('getDubHashSignature', () => {
  it('returns correct SignatureResult for binary file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash', 'test02');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 1,
          data: 'aT6a+E09/MceZA4AW9xeLg',
        },
      ],
    };
    const actual = getDubHashSignature(filePath, fileContents);
    expect(actual?.hashes_ffm[0].data.length).toEqual(22);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file - both hashes', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash', 'test00');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 1,
          data: 'Bp5by58MFpH4B4WNuaY6IA',
        },
        {
          format: 1,
          data: 'hRE1s4V2n2r4wqv9PsA8eA',
        },
      ],
    };
    const actual = getDubHashSignature(filePath, fileContents, true);
    expect(actual?.hashes_ffm[0].data.length).toEqual(22);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file - single hash', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash', 'test00');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 1,
          data: 'Bp5by58MFpH4B4WNuaY6IA',
        },
      ],
    };
    const actual = getDubHashSignature(filePath, fileContents);
    expect(actual?.hashes_ffm.length).toEqual(1);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file formatted with Windows line endings - both hashes', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash', 'config.bat');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 1,
          data: '1v0eLq0XfTInpamMdqk8Zw',
        },
        {
          format: 1,
          data: 'pnWT0d2x+dZ36tv2f9ykgg',
        },
      ],
    };
    const actual = getDubHashSignature(filePath, fileContents, true);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file with only whitespace - both hashes', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash', 'test01');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 1,
          data: 'EQg6H/stTYlTTdj7pgxZyw',
        },
        {
          format: 1,
          data: 'p3vWq80izGXx0MYbu1pKZg',
        },
      ],
    };
    const actual = getDubHashSignature(filePath, fileContents, true);
    expect(actual?.hashes_ffm[0].data.length).toEqual(22);
    expect(actual).toStrictEqual(expected);
  });
});
