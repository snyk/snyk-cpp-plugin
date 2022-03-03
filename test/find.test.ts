import * as path from 'path';
import * as findModule from '../lib/find';
import * as fs from 'fs';
import { promisify } from 'util';

describe('find', () => {
  it('should produce list of files found in directory', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'example');
    const [actual] = await findModule.find(fixturePath);
    const expected = [
      // md file
      path.join(fixturePath, 'README.md'),
      // c* files
      path.join(fixturePath, 'test.c'),
      path.join(fixturePath, 'main.cpp'),
      path.join(fixturePath, 'main.cc'),
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

  it('should produce list of files found in directory', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'example');
    const toExclude = [
      path.join(fixturePath, 'one'),
      path.join(fixturePath, 'test.c'),
    ];
    const [actual] = await findModule.find(fixturePath, toExclude);
    const expected = [
      path.join(fixturePath, 'README.md'),
      path.join(fixturePath, 'main.cpp'),
      path.join(fixturePath, 'main.cc'),
      path.join(fixturePath, 'headers', 'test.h'),
      path.join(fixturePath, 'headers', 'one', 'one.hh'),
      path.join(fixturePath, 'headers', 'one', 'two', 'two.hxx'),
      path.join(fixturePath, 'headers', 'one', 'two', 'three', 'three.h++'),
      path.join(fixturePath, 'headers', 'main.hpp'),
      path.join(fixturePath, 'templates', 'test.i'),
      path.join(fixturePath, 'templates', 'test.ii'),
      path.join(fixturePath, 'templates', 'test.ipp'),
      path.join(fixturePath, 'templates', 'test.ixx'),
      path.join(fixturePath, 'templates', 'test.txx'),
      path.join(fixturePath, 'templates', 'test.tpp'),
      path.join(fixturePath, 'templates', 'sub', 'test.tpl'),
    ];
    expect(actual.sort()).toEqual(expected.sort());
  });

  it('should produce an empty list when file path is invalid', async () => {
    const filePath = 'path/does/not/exist';
    try {
      await findModule.find(filePath);
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
      await findModule.find(fixturePath);
    } catch (err) {
      expect(err).toEqual(expected);
    }
  });

  it('should ignore symlinks', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'with-symlink');

    const symlinkTarget = path.join(fixturePath, 'to-include');
    const symlinkPath = path.join(fixturePath, 'to-exclude');
    const expected = [path.join(symlinkTarget, 'file.txt')];

    await promisify(fs.symlink)(symlinkTarget, symlinkPath, 'dir');

    const [actual] = await findModule.find(fixturePath);

    expect(actual).toHaveLength(1);
    expect(actual).toEqual(expected);

    await promisify(fs.unlink)(symlinkPath);
  });
});
