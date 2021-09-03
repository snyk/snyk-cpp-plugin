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
          data: "aT6a+E09/MceZA4AW9xeLg"  //TODO: Verify with Daniel
        },
      ],
    };
    const actual = getDubHashSignature(filePath, fileContents);
    expect(actual?.hashes_ffm[0].data.length).toEqual(22);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash', 'test00');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 1,
          data: "Bp5by58MFpH4B4WNuaY6IA"
        },
        {
          format: 1,
          data: "hRE1s4V2n2r4wqv9PsA8eA"
        },
      ],
    };
    const actual = getDubHashSignature(filePath, fileContents);
    expect(actual?.hashes_ffm[0].data.length).toEqual(22);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file with only whitespace', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash', 'test01');
    const fileContents = await readFile(filePath);
    const expected: SignatureResult = {
      path: filePath,
      hashes_ffm: [
        {
          format: 1,
          data: "EQg6H/stTYlTTdj7pgxZyw"
        },
        {
          format: 1,
          data: "p3vWq80izGXx0MYbu1pKZg"
        },
      ],
    };
    const actual = getDubHashSignature(filePath, fileContents);
    expect(actual?.hashes_ffm[0].data.length).toEqual(22);
    expect(actual).toStrictEqual(expected);
  });
});
