import * as path from 'path';
import { computeSignaturesConcurrently } from '../lib/signatures';

describe('getSignature', () => {
  it('should return a correct scan result containing both single hash and uhash and file size', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'example', 'main.cc');
    const expected = [
      {
        path: filePath,
        hashes_ffm: [
          {
            data: 'WY0eT7ZYA9PlMPjm2oSZ2g',
            format: 1,
          },
          {
            data: '15b464e1ed112524ebfae35b',
            format: 3,
          },
        ],
        size: 95,
      },
    ];
    const actual = await computeSignaturesConcurrently([filePath]);
    expect(actual).toStrictEqual(expected);
  });

  it('binary file - correctly returns single hash & uhash and the size', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dog.jpg');
    const expected = [
      {
        path: filePath,
        hashes_ffm: [
          {
            data: 'lfDsE17jjwfgeFfW9pLWJQ',
            format: 1,
          },
          {
            data: '95f0ec135ee38f07e07857d6',
            format: 3,
          },
        ],
        size: 7574,
      },
    ];
    const actual = await computeSignaturesConcurrently([filePath]);
    expect(actual).toStrictEqual(expected);
  });
});
