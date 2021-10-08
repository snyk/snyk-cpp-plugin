import * as path from 'path';
import { getSignaturesByAlgorithm } from '../lib/signatures';
import { SignatureHashAlgorithm } from '../lib/types';

describe('getSignature', () => {
  it('should return a correct scan result - dubhash', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join('example', 'main.cc');
    const expected = [
      {
        path: filePath,
        hashes_ffm: [{ format: 1, data: 'WY0eT7ZYA9PlMPjm2oSZ2g' }],
      },
    ];
    const actual = await getSignaturesByAlgorithm(fixturePath, [filePath]);
    expect(actual).toStrictEqual(expected);
  });

  it('should return a correct scan result - uhash', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join('example', 'main.cc');
    const expected = [
      {
        path: filePath,
        hashes_ffm: [{ format: 3, data: '15b464e1ed112524ebfae35b' }],
      },
    ];
    const actual = await getSignaturesByAlgorithm(
      fixturePath,
      [filePath],
      'uhash',
    );
    expect(actual).toStrictEqual(expected);
  });

  it('should return null for empty file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join('empty', '.keep');
    const actual = await getSignaturesByAlgorithm(fixturePath, [filePath]);
    expect(actual).toStrictEqual([null]);
  });

  it('binaryfile - dubhash', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = 'dog.jpg';
    const expected = [
      {
        path: filePath,
        hashes_ffm: [{ format: 1, data: 'lfDsE17jjwfgeFfW9pLWJQ' }],
      },
    ];
    const actual = await getSignaturesByAlgorithm(fixturePath, [filePath]);
    expect(actual).toStrictEqual(expected);
  });

  it('binaryfile - uhash', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = 'dog.jpg';
    const expected = [
      {
        path: filePath,
        hashes_ffm: [{ format: 3, data: '95f0ec135ee38f07e07857d6' }],
      },
    ];
    const actual = await getSignaturesByAlgorithm(
      fixturePath,
      [filePath],
      'uhash',
    );
    expect(actual).toStrictEqual(expected);
  });

  it('should throw exception if unsupported hashType is specified', async () => {
    expect.assertions(1);
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = 'dog.jpg';
    const expected = new Error('Unsupported hashType non-existing-hash-type');
    const invalidHashAlgorithmType = 'non-existing-hash-type' as SignatureHashAlgorithm;
    expect(
      async () =>
        await getSignaturesByAlgorithm(
          fixturePath,
          [filePath],
          invalidHashAlgorithmType,
        ),
    ).rejects.toThrow(expected);
  });
});
