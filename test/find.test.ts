import * as path from 'path';

import { find } from '../lib/find';

describe('find', () => {
  it('should produce list of files found in directory', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'example');
    const actual = await find(fixturePath);
    const expected = [
      // md file
      path.join('README.md'),
      // c* files
      path.join('test.c'),
      path.join('main.cpp'),
      path.join('main.cc'),
      path.join('one', 'one.cc'),
      path.join('one', 'two', 'two.cxx'),
      path.join('one', 'two', 'three', 'three.c++'),
      // h* files
      path.join('headers', 'test.h'),
      path.join('headers', 'one', 'one.hh'),
      path.join('headers', 'one', 'two', 'two.hxx'),
      path.join('headers', 'one', 'two', 'three', 'three.h++'),
      path.join('headers', 'main.hpp'),
      // i* files
      path.join('templates', 'test.i'),
      path.join('templates', 'test.ii'),
      path.join('templates', 'test.ipp'),
      path.join('templates', 'test.ixx'),
      // t* files
      path.join('templates', 'test.txx'),
      path.join('templates', 'test.tpp'),
      path.join('templates', 'sub', 'test.tpl'),
    ];
    expect(actual.sort()).toEqual(expected.sort());
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
});
