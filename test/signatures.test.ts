import * as path from 'path';

import { getSignature } from '../lib/signatures';

describe('getSignature', () => {
  it('should return a correct scan result', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'example', 'main.cc');
    const expected = {
      path: filePath,
      hashes_ffm: [{ format: 1, data: 'WY0eT7ZYA9PlMPjm2oSZ2g' }],
    };
    const actual = await getSignature(filePath);
    expect(actual).toStrictEqual(expected);
  });

  it('should return null for empty file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'empty', '.keep');
    const actual = await getSignature(filePath);
    expect(actual).toStrictEqual(null);
  });

  it('binaryfile', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dog.jpg');
    const expected = {
      path: filePath,
      hashes_ffm: [{ format: 1, data: 'lfDsE17jjwfgeFfW9pLWJQ' }],
    };
    const actual = await getSignature(filePath);
    expect(actual).toStrictEqual(expected);
  });
});
