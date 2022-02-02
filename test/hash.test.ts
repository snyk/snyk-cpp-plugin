import * as fs from 'fs';
import * as path from 'path';
import { FileContent } from '../lib/types';
import { computeSingleHash, computeUHash, computeHash } from '../lib/hash';

const tests = [
  [
    'binary file with Windows LF',
    './test/fixtures/hashing-unit-data/windows/binary-windows',
    './test/fixtures/hashing-unit-data/windows/binary-windows-output.json',
  ],
  [
    'text file with Windows LF',
    './test/fixtures/hashing-unit-data/windows/text-windows.txt',
    './test/fixtures/hashing-unit-data/windows/text-windows-output.json',
  ],
  [
    'binary file with Linux LF',
    './test/fixtures/hashing-unit-data/linux/binary-linux',
    './test/fixtures/hashing-unit-data/linux/binary-linux-output.json',
  ],
  [
    'text file with Linux LF',
    './test/fixtures/hashing-unit-data/linux/text-linux.txt',
    './test/fixtures/hashing-unit-data/linux/text-linux-output.json',
  ],
  [
    'no-whitespaces-trailing file with Linux LF',
    './test/fixtures/hashing-unit-data/linux/no-whitespaces-trailing-linux',
    './test/fixtures/hashing-unit-data/linux/no-whitespaces-trailing-linux-output.json',
  ],
  [
    'no-whitespaces-trailing file with Windows LF',
    './test/fixtures/hashing-unit-data/windows/no-whitespaces-trailing-windows',
    './test/fixtures/hashing-unit-data/windows/no-whitespaces-trailing-windows-output.json',
  ],
  [
    'with-utf8-bom file with Linux LF',
    './test/fixtures/hashing-unit-data/linux/with-utf8-bom-linux',
    './test/fixtures/hashing-unit-data/linux/with-utf8-bom-linux-output.json',
  ],
  [
    'with-utf8-bom file with Windows LF',
    './test/fixtures/hashing-unit-data/windows/with-utf8-bom-windows',
    './test/fixtures/hashing-unit-data/windows/with-utf8-bom-windows-output.json',
  ],
];

describe('Unit tests for getHashSignature and associated functions', () => {
  it.each(tests)('%s', async (_description, path, expected) => {
    const content: FileContent = fs.readFileSync(path);
    const output = JSON.parse(fs.readFileSync(expected, 'utf8'));

    const result = await computeHash(path, content);

    expect(result).toEqual(output);
  });
});

describe('single hashing', () => {
  it('returns correct SignatureResult for binary file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test02');
    const fileContents = await fs.readFileSync(filePath);
    const expected = {
      data: 'aT6a+E09/MceZA4AW9xeLg',
      format: 1,
    };
    const hash = await computeSingleHash(fileContents);

    expect(hash).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test00');
    const fileContents = await fs.readFileSync(filePath);
    const expected = {
      data: 'Bp5by58MFpH4B4WNuaY6IA',
      format: 1,
    };
    const hash = await computeSingleHash(fileContents);

    expect(hash).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file formatted with Windows line endings', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'config.bat');
    const fileContents = await fs.readFileSync(filePath);
    const expected = {
      data: '1v0eLq0XfTInpamMdqk8Zw',
      format: 1,
    };
    const hash = await computeSingleHash(fileContents);

    expect(hash).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file with only whitespace', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test01');
    const fileContents = await fs.readFileSync(filePath);
    const expected = {
      data: 'EQg6H/stTYlTTdj7pgxZyw',
      format: 1,
    };
    const hash = await computeSingleHash(fileContents);

    expect(hash).toStrictEqual(expected);
  });
});

describe('getUhashDigest', () => {
  it('returns correct SignatureResult for binary file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test02');
    const fileContents = await fs.readFileSync(filePath);
    const expected = {
      data: '693e9af84d3dfcc71e640e00',
      format: 3,
    };
    const actual = await computeUHash(fileContents);
    expect(actual.data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test00');
    const fileContents = await fs.readFileSync(filePath);
    const expected = {
      data: 'ecdb03f0e1e3630f7d70a9d5',
      format: 3,
    };
    const actual = await computeUHash(fileContents);
    expect(actual.data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file formatted with Windows line endings', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'config.bat');
    const fileContents = await fs.readFileSync(filePath);
    const expected = {
      data: 'c908322f19dbf75e695b7517',
      format: 3,
    };
    const actual = await computeUHash(fileContents);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file with only whitespace', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test01');
    const fileContents = await fs.readFileSync(filePath);
    const expected = {
      data: 'd41d8cd98f00b204e9800998',
      format: 3,
    };
    const actual = await computeUHash(fileContents);
    expect(actual.data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });

  it('returns correct SignatureResult for text file containing a UTF-8 BOM', async () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'dubhash-uhash', 'test03');
    const fileContents = await fs.readFileSync(filePath);
    const expected = {
      data: 'd41d8cd98f00b204e9800998',
      format: 3,
    };
    const actual = await computeUHash(fileContents);
    expect(actual.data.length).toEqual(24);
    expect(actual).toStrictEqual(expected);
  });
});
