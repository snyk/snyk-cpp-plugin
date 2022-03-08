import { join } from 'path';

import { parse, toAbsolutePaths } from '../lib/utils/dotsnyk';

describe('parseDotSnyk', () => {
  it('should parse valid policy file with glob-patterns', async () => {
    const path = join(__dirname, 'fixtures', 'to-exclude-paths', '.snyk');
    const result: { exclude: { unmanaged: string[] } } = parse(path);

    expect(result).toEqual({
      exclude: {
        unmanaged: [
          'headers/one/headers/file-to-exclude.cpp',
          'one',
          'templates/**/test.tpl',
        ],
      },
    });
  });
});

describe('toAbsolutePaths', () => {
  it('support empty array', async () => {
    const result = toAbsolutePaths(__dirname, []);
    expect(result).toEqual([]);
  });

  it('support undefined array', async () => {
    const result = toAbsolutePaths(__dirname, undefined);
    expect(result).toEqual([]);
  });

  it('support no array', async () => {
    const result = toAbsolutePaths(__dirname);
    expect(result).toEqual([]);
  });

  it('convert both abs, and rel. list of paths to absolute path', async () => {
    const result = toAbsolutePaths(__dirname, [
      join(__dirname, 'fixtures', 'to-exclude-paths'),
      join('.', 'fixtures', 'to-exclude-paths'),
      join('.', 'fixtures', 'missing-file'),
      join('.'),
      join('.', 'missing-dir'),
    ]);

    expect(result).toEqual([
      join(__dirname, 'fixtures', 'to-exclude-paths'),
      join(__dirname, 'fixtures', 'to-exclude-paths'),
      join(__dirname, 'fixtures', 'missing-file'),
      join(__dirname),
      join(__dirname, 'missing-dir'),
    ]);
  });
});
