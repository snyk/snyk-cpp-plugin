import * as path from 'path';
import { find } from '../lib/find';

describe('find', () => {
  it('should produce list of files found in directory', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'example');
    const actual = await find(fixturePath);
    const expected = [
      // c* files
      path.join(fixturePath, 'test.c'),
      path.join(fixturePath, 'main.cpp'),
      path.join(fixturePath, 'one', 'one.cc'),
      path.join(fixturePath, 'one', 'two', 'two.cxx'),
      path.join(fixturePath, 'one', 'two', 'three', 'three.c++'),
      // h* files
      path.join(fixturePath, 'headers', 'test.h'),
      path.join(fixturePath, 'headers', 'one', 'one.hh'),
      path.join(fixturePath, 'headers', 'one', 'two', 'two.hxx'),
      path.join(fixturePath, 'headers', 'one', 'two', 'three', 'three.h++'),
      path.join(fixturePath, 'headers', 'main.hpp'),
      // i* files
      path.join(fixturePath, 'templates', 'test.i'),
      path.join(fixturePath, 'templates', 'test.ii'),
      path.join(fixturePath, 'templates', 'test.ipp'),
      path.join(fixturePath, 'templates', 'test.ixx'),
      // t* files
      path.join(fixturePath, 'templates', 'test.txx'),
      path.join(fixturePath, 'templates', 'test.tpp'),
      path.join(fixturePath, 'templates', 'sub', 'test.tpl'),
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
      expect(err).toEqual(
        expect.objectContaining({
          path: expect.any(String),
          code: 'ENOENT',
          errno: expect.any(Number),
        }),
      );
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

  it('should handle broken files and continue to find other files', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'handle-broken');
    const actual = await find(fixturePath);
    const expected: string[] = [path.join(fixturePath, 'main.cpp')];
    expect(actual).toEqual(expected);
  });
});
