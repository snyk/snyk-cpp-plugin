import * as path from 'path';
import { find } from '../lib/find';

describe('find', () => {
  it('should produce list of files found in directory', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'example');
    const actual = await find(fixturePath);
    const expected = [
      path.join(fixturePath, 'main.cpp'),
      path.join(fixturePath, 'test.c'),
      path.join(fixturePath, 'headers', 'test.h'),
      path.join(fixturePath, 'headers', 'main.hpp'),
    ];
    expect(actual.sort()).toEqual(expected.sort());
  });

  it('should produce an empty list when directory has no support files in', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'empty');
    const actual = await find(fixturePath);
    const expected: string[] = [];
    expect(actual).toEqual(expected);
  });

  it('should produce an empty list when file path is invalid', async () => {
    const filePath = 'path/does/not/exist';
    try {
      await find(filePath);
    } catch (err) {
      expect(err).toMatchObject({
        path: filePath,
        "code": "ENOENT",
        "errno": -2,
      });
    }
  });

  it('should produce an empty list when a file path is given', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'example', 'main.cpp');
    const expected = new Error(`${fixturePath} is not a directory`);
    try {
      await find(fixturePath);
    } catch (err) {
      expect(err).toEqual(expected);
    }
  });
});
