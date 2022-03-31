import { join } from 'path';

import { hasExpired, parse, toAbsolutePaths } from '../../lib/utils/dotsnyk';
import { Config } from '../../lib/utils/dotsnyk/types';

describe('parseDotSnyk', () => {
  it('should parse valid policy file with glob-patterns', async () => {
    const path = join(__dirname, '..', 'fixtures', 'to-exclude-paths', '.snyk');
    const result: Config = parse(path);

    expect(result).toEqual({
      exclude: {
        global: [
          'headers/one/headers/file-to-exclude.cpp',
          'one',
          'templates/**/test.tpl',
          {
            './deps/grep-ok-*': {
              created: '2022-03-28T08:36:02.845Z',
              expires: '2122-10-28T08:36:02.845Z',
              reason: 'this will always work',
            },
          },
          {
            './deps/grep-expired-*': {
              created: '2022-03-28T08:36:02.845Z',
              expires: '2021-10-28T08:36:02.845Z',
              reason: 'this has expired',
            },
          },
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

describe('hasExpired', () => {
  it('should return true if value is less than today', () => {
    const result = hasExpired('2000-01-01T00:00:00.000Z');
    expect(result).toEqual(true);
  });

  it('should return false if value is greater than today', () => {
    const result = hasExpired('3000-01-01T00:00:00.000Z');
    expect(result).toEqual(false);
  });

  it('should return false if null or undefined provided', () => {
    let result = hasExpired(null);
    expect(result).toEqual(false);

    result = hasExpired(undefined);
    expect(result).toEqual(false);
  });

  it('throws an error if the string can not be parsed', () => {
    try {
      hasExpired('not a date');
    } catch (err) {
      expect(err).toEqual(
        'Invalid date format provided dates should be formatted as "yyyy-MM-ddTHH:mm:ss.fffZ"',
      );
    }
  });
});
