import { join } from 'path';
import { PluginResponse, scan } from '../lib';
import { Facts } from '../lib/types';
import { DEFAULT_DECOMPRESSING_DEPTH } from '../lib/common';

const helloWorldFixturePath = join(__dirname, 'fixtures', 'hello-world');
const helloWorldSignatures: Facts[] = [
  {
    type: 'fileSignatures',
    data: [
      {
        path: 'add.cpp',
        hashes_ffm: [
          {
            format: 1,
            data: 'UtGwRgR9ueoMWByv1MaP5Q',
          },
          {
            format: 3,
            data: 'd53b2679a07eb6ab82e60dbb',
          },
        ],
        size: 41,
      },
      {
        path: 'add.h',
        hashes_ffm: [
          {
            format: 1,
            data: 'rspxpuOfmaJOz0wIju6cuA',
          },
          {
            format: 3,
            data: '5b49d65b10acfac0f3754b51',
          },
        ],
        size: 22,
      },
      {
        path: 'main.cpp',
        hashes_ffm: [
          {
            format: 1,
            data: 'rTNlszcO9rHD53j4dQVfGQ',
          },
          {
            format: 3,
            data: 'd7432de58aeeeea23d70d8ce',
          },
        ],
        size: 126,
      },
    ],
  },
];

const bigFixturePath = join(__dirname, 'fixtures', 'big-fixture');

describe('scan', () => {
  it('should produce scanned projects', async () => {
    const actual = await scan({ path: helloWorldFixturePath });
    const expected: PluginResponse = {
      scanResults: [
        {
          facts: helloWorldSignatures,
          identity: {
            type: 'cpp',
          },
          name: 'snyk-cpp-plugin',
          target: {
            remoteUrl: expect.any(String),
            branch: expect.any(String),
          },
          analytics: [
            {
              data: {
                totalFileSignatures: 3,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
              name: 'fileSignaturesAnalyticsContext',
            },
          ],
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should produce correct number of signatures for large project', async () => {
    const actual = await scan({ path: bigFixturePath });
    expect(actual.scanResults).toBeDefined();
    expect(actual.scanResults[0].facts[0].data.length).toEqual(21);
  });

  it('should produce scanned projects with project name option', async () => {
    const fixturePath = join(__dirname, 'fixtures', 'hello-world');
    const actual = await scan({ path: fixturePath, projectName: 'my-app' });
    const expected: PluginResponse = {
      scanResults: [
        {
          facts: helloWorldSignatures,
          identity: {
            type: 'cpp',
          },
          name: 'my-app',
          target: {
            remoteUrl: expect.any(String),
            branch: expect.any(String),
          },
          analytics: [
            {
              data: {
                totalFileSignatures: 3,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
              name: 'fileSignaturesAnalyticsContext',
            },
          ],
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should throw exception when invalid directory path', async () => {
    expect.assertions(1);
    const filePath = 'does/not/exist';
    const expected = new Error(
      `Could not scan C/C++ project: 'does/not/exist' does not exist.`,
    );
    try {
      await scan({ path: filePath });
    } catch (err) {
      expect(err).toEqual(expected);
    }
  });

  it('should throw exception when invalid options', async () => {
    expect.assertions(1);
    const expected = new Error(
      `Could not scan C/C++ project: invalid options: no path provided.`,
    );
    try {
      await scan({} as any);
    } catch (err) {
      expect(err).toEqual(expected);
    }
  });

  it('should scan and extract tarballs', async () => {
    const fixturePath = join(
      __dirname,
      'fixtures',
      'extraction',
      'flat',
      'tar',
    );

    const actual = await scan({ path: fixturePath });
    const expected: PluginResponse = {
      scanResults: [
        {
          facts: [
            {
              type: 'fileSignatures',
              data: [
                {
                  path: 'lib-a.tar',
                  size: 2560,
                  hashes_ffm: [
                    {
                      data: 'ddY4m4Sq6rC1co2FsCZ9Ng',
                      format: 1,
                    },
                    {
                      data: '75d6389b84aaeab0b5728d85',
                      format: 3,
                    },
                  ],
                },
                {
                  path: 'lib-b.tar.gz',
                  size: 250,
                  hashes_ffm: [
                    {
                      data: 'XyaldffaOsdBgrzR2O53ig',
                      format: 1,
                    },
                    {
                      data: '5f26a575f7da3ac74182bcd1',
                      format: 3,
                    },
                  ],
                },
                {
                  path: 'lib-c.tgz',
                  size: 250,
                  hashes_ffm: [
                    {
                      data: '8lGUJcUkXsVPo0MnvugbPA',
                      format: 1,
                    },
                    {
                      data: 'f2519425c5245ec54fa34327',
                      format: 3,
                    },
                  ],
                },
                {
                  path: 'main.cpp',
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('lib-a.tar', 'lib-a', 'main.cpp'),
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('lib-b.tar.gz', 'lib-b', 'main.cpp'),
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('lib-c.tgz', 'lib-c', 'main.cpp'),
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
              ],
            },
          ],
          identity: {
            type: 'cpp',
          },
          name: 'snyk-cpp-plugin',
          target: {
            remoteUrl: expect.any(String),
            branch: expect.any(String),
          },
          analytics: [
            {
              name: 'fileSignaturesAnalyticsContext',
              data: {
                totalFileSignatures: 7,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
            },
          ],
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('should scan and extract zip archives', async () => {
    const fixturePath = join(
      __dirname,
      'fixtures',
      'extraction',
      'flat',
      'zip',
    );

    const actual = await scan({ path: fixturePath });
    const expected: PluginResponse = {
      scanResults: [
        {
          facts: [
            {
              type: 'fileSignatures',
              data: [
                {
                  path: 'lib-a.zip',
                  size: 429,
                  hashes_ffm: [
                    {
                      data: 'Meh8ayPvHT6VuGKR5wjdXg',
                      format: 1,
                    },
                    {
                      data: '31e87c6b23ef1d3e95b86291',
                      format: 3,
                    },
                  ],
                },
                {
                  path: 'lib-b.zip',
                  size: 429,
                  hashes_ffm: [
                    {
                      data: '81lo+auqnFMCnqaU5szYXg',
                      format: 1,
                    },
                    {
                      data: 'f35968f9abaa9c53029ea694',
                      format: 3,
                    },
                  ],
                },
                {
                  path: 'lib-c.zip',
                  size: 429,
                  hashes_ffm: [
                    {
                      data: 'v8uyfCAxRngknfDtYACgNw',
                      format: 1,
                    },
                    {
                      data: 'bfcbb27c20314678249df0ed',
                      format: 3,
                    },
                  ],
                },
                {
                  path: 'main.cpp',
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('lib-a.zip', 'lib-a', 'main.cpp'),
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('lib-b.zip', 'lib-b', 'main.cpp'),
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('lib-c.zip', 'lib-c', 'main.cpp'),
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
              ],
            },
          ],
          identity: {
            type: 'cpp',
          },
          name: 'snyk-cpp-plugin',
          target: {
            remoteUrl: expect.any(String),
            branch: expect.any(String),
          },
          analytics: [
            {
              name: 'fileSignaturesAnalyticsContext',
              data: {
                totalFileSignatures: 7,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
            },
          ],
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('should scan and extract tarballs with default recursion level', async () => {
    const fixturePath = join(
      __dirname,
      'fixtures',
      'extraction',
      'nested',
      '3-levels',
      'tar',
    );

    const actual = await scan({ path: fixturePath });
    const expected: PluginResponse = {
      scanResults: [
        {
          facts: [
            {
              type: 'fileSignatures',
              data: [
                {
                  path: 'deps.tar.gz',
                  size: 1321,
                  hashes_ffm: [
                    {
                      data: 'fz4RzoWgsBMUSljtF3vdLQ',
                      format: 1,
                    },
                    {
                      data: '7f3e11ce85a0b013144a58ed',
                      format: 3,
                    },
                  ],
                },
                {
                  path: 'main.cpp',
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('deps.tar.gz', 'vendor', 'deps.tar.gz'),
                  size: 1098,
                  hashes_ffm: [
                    {
                      data: 'H7WP+tRggklZl5c/aKWXjA',
                      format: 1,
                    },
                    {
                      data: '1fb58ffad46082495997973f',
                      format: 3,
                    },
                  ],
                },
              ],
            },
          ],
          identity: {
            type: 'cpp',
          },
          name: 'snyk-cpp-plugin',
          target: {
            remoteUrl: expect.any(String),
            branch: expect.any(String),
          },
          analytics: [
            {
              name: 'fileSignaturesAnalyticsContext',
              data: {
                totalFileSignatures: 3,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
            },
          ],
        },
      ],
    };

    expect(actual).toEqual(expected);
    expect(DEFAULT_DECOMPRESSING_DEPTH).toEqual(1);
  });

  it('should scan and extract zip archives with default recursion level', async () => {
    const fixturePath = join(
      __dirname,
      'fixtures',
      'extraction',
      'nested',
      '3-levels',
      'zip',
    );

    const actual = await scan({ path: fixturePath });
    const expected: PluginResponse = {
      scanResults: [
        {
          facts: [
            {
              type: 'fileSignatures',
              data: [
                {
                  path: 'deps.zip',
                  size: 2575,
                  hashes_ffm: [
                    {
                      data: 'VsdARlgcIaJaG2oYnPvYlg',
                      format: 1,
                    },
                    {
                      data: '56c74046581c21a25a1b6a18',
                      format: 3,
                    },
                  ],
                },
                {
                  path: 'main.cpp',
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('deps.zip', 'vendor', 'deps.zip'),
                  size: 2253,
                  hashes_ffm: [
                    {
                      data: 'AWBkuX+tVWtOmeOsNeDOVw',
                      format: 1,
                    },
                    {
                      data: '016064b97fad556b4e99e3ac',
                      format: 3,
                    },
                  ],
                },
              ],
            },
          ],
          identity: {
            type: 'cpp',
          },
          name: 'snyk-cpp-plugin',
          target: {
            remoteUrl: expect.any(String),
            branch: expect.any(String),
          },
          analytics: [
            {
              name: 'fileSignaturesAnalyticsContext',
              data: {
                totalFileSignatures: 3,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
            },
          ],
        },
      ],
    };

    expect(actual).toEqual(expected);
    expect(DEFAULT_DECOMPRESSING_DEPTH).toEqual(1);
  });

  it('should scan and extract both tarball & zip archives with default recursion', async () => {
    const fixturePath = join(
      __dirname,
      'fixtures',
      'extraction',
      'nested',
      '3-levels',
    );

    const actual = await scan({ path: fixturePath });
    const expected: PluginResponse = {
      scanResults: [
        {
          analytics: [
            {
              data: {
                totalFileSignatures: 6,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
              name: 'fileSignaturesAnalyticsContext',
            },
          ],
          facts: [
            {
              data: [
                {
                  hashes_ffm: [
                    {
                      data: 'fz4RzoWgsBMUSljtF3vdLQ',
                      format: 1,
                    },
                    {
                      data: '7f3e11ce85a0b013144a58ed',
                      format: 3,
                    },
                  ],
                  path: join('tar', 'deps.tar.gz'),
                  size: 1321,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join('tar', 'main.cpp'),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'VsdARlgcIaJaG2oYnPvYlg',
                      format: 1,
                    },
                    {
                      data: '56c74046581c21a25a1b6a18',
                      format: 3,
                    },
                  ],
                  path: join('zip', 'deps.zip'),
                  size: 2575,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join('zip', 'main.cpp'),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'H7WP+tRggklZl5c/aKWXjA',
                      format: 1,
                    },
                    {
                      data: '1fb58ffad46082495997973f',
                      format: 3,
                    },
                  ],
                  path: join('deps.tar.gz', 'vendor', 'deps.tar.gz'),
                  size: 1098,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'AWBkuX+tVWtOmeOsNeDOVw',
                      format: 1,
                    },
                    {
                      data: '016064b97fad556b4e99e3ac',
                      format: 3,
                    },
                  ],
                  path: join('deps.zip', 'vendor', 'deps.zip'),
                  size: 2253,
                },
              ],
              type: 'fileSignatures',
            },
          ],
          identity: {
            type: 'cpp',
          },
          name: 'snyk-cpp-plugin',
          target: {
            branch: expect.any(String),
            remoteUrl: expect.any(String),
          },
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('should scan and extract both tarball & zip tarballs with specified recursion level', async () => {
    const fixturePath = join(
      __dirname,
      'fixtures',
      'extraction',
      'nested',
      '3-levels',
    );

    const actual = await scan({
      path: fixturePath,
      '--max-depth': 2,
    });
    const expected: PluginResponse = {
      scanResults: [
        {
          analytics: [
            {
              data: {
                totalFileSignatures: 8,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
              name: 'fileSignaturesAnalyticsContext',
            },
          ],
          facts: [
            {
              data: [
                {
                  hashes_ffm: [
                    {
                      data: 'fz4RzoWgsBMUSljtF3vdLQ',
                      format: 1,
                    },
                    {
                      data: '7f3e11ce85a0b013144a58ed',
                      format: 3,
                    },
                  ],
                  path: join('tar', 'deps.tar.gz'),
                  size: 1321,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join('tar', 'main.cpp'),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'VsdARlgcIaJaG2oYnPvYlg',
                      format: 1,
                    },
                    {
                      data: '56c74046581c21a25a1b6a18',
                      format: 3,
                    },
                  ],
                  path: join('zip', 'deps.zip'),
                  size: 2575,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join('zip', 'main.cpp'),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'H7WP+tRggklZl5c/aKWXjA',
                      format: 1,
                    },
                    {
                      data: '1fb58ffad46082495997973f',
                      format: 3,
                    },
                  ],
                  path: join('deps.tar.gz', 'vendor', 'deps.tar.gz'),
                  size: 1098,
                },
                {
                  hashes_ffm: [
                    {
                      data: '5lSqtn0msns07j/TQVjQjw',
                      format: 1,
                    },
                    {
                      data: 'e654aab67d26b27b34ee3fd3',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.tar.gz',
                    'vendor',
                    'deps.tar.gz',
                    'vendor',
                    'deps.tar.gz',
                  ),
                  size: 892,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'AWBkuX+tVWtOmeOsNeDOVw',
                      format: 1,
                    },
                    {
                      data: '016064b97fad556b4e99e3ac',
                      format: 3,
                    },
                  ],
                  path: join('deps.zip', 'vendor', 'deps.zip'),
                  size: 2253,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'NafnlhdlUsoYOuZZdUgZ8Q',
                      format: 1,
                    },
                    {
                      data: '35a7e796176552ca183ae659',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.zip',
                    'vendor',
                    'deps.zip',
                    'vendor',
                    'deps.zip',
                  ),
                  size: 1931,
                },
              ],
              type: 'fileSignatures',
            },
          ],
          identity: {
            type: 'cpp',
          },
          name: 'snyk-cpp-plugin',
          target: {
            branch: expect.any(String),
            remoteUrl: expect.any(String),
          },
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('should scan and extract both tarball & zip and limit to the amount of archives when bigger recursion level is provided', async () => {
    const fixturePath = join(
      __dirname,
      'fixtures',
      'extraction',
      'nested',
      '2-levels',
    );

    const actual = await scan({
      path: fixturePath,
      '--max-depth': 20,
    });
    const expected: PluginResponse = {
      scanResults: [
        {
          analytics: [
            {
              data: {
                totalFileSignatures: 18,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
              name: 'fileSignaturesAnalyticsContext',
            },
          ],
          facts: [
            {
              data: [
                {
                  hashes_ffm: [
                    {
                      data: 'H7WP+tRggklZl5c/aKWXjA',
                      format: 1,
                    },
                    {
                      data: '1fb58ffad46082495997973f',
                      format: 3,
                    },
                  ],
                  path: join('tar', 'deps.tar.gz'),
                  size: 1098,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join('tar', 'main.cpp'),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'AWBkuX+tVWtOmeOsNeDOVw',
                      format: 1,
                    },
                    {
                      data: '016064b97fad556b4e99e3ac',
                      format: 3,
                    },
                  ],
                  path: join('zip', 'deps.zip'),
                  size: 2253,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join('zip', 'main.cpp'),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: '5lSqtn0msns07j/TQVjQjw',
                      format: 1,
                    },
                    {
                      data: 'e654aab67d26b27b34ee3fd3',
                      format: 3,
                    },
                  ],
                  path: join('deps.tar.gz', 'vendor', 'deps.tar.gz'),
                  size: 892,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'ddY4m4Sq6rC1co2FsCZ9Ng',
                      format: 1,
                    },
                    {
                      data: '75d6389b84aaeab0b5728d85',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.tar.gz',
                    'vendor',
                    'deps.tar.gz',
                    'vendor',
                    'lib-a.tar',
                  ),
                  size: 2560,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.tar.gz',
                    'vendor',
                    'deps.tar.gz',
                    'vendor',
                    'lib-a.tar',
                    'lib-a',
                    'main.cpp',
                  ),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'XyaldffaOsdBgrzR2O53ig',
                      format: 1,
                    },
                    {
                      data: '5f26a575f7da3ac74182bcd1',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.tar.gz',
                    'vendor',
                    'deps.tar.gz',
                    'vendor',
                    'lib-b.tar.gz',
                  ),
                  size: 250,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.tar.gz',
                    'vendor',
                    'deps.tar.gz',
                    'vendor',
                    'lib-b.tar.gz',
                    'lib-b',
                    'main.cpp',
                  ),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: '8lGUJcUkXsVPo0MnvugbPA',
                      format: 1,
                    },
                    {
                      data: 'f2519425c5245ec54fa34327',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.tar.gz',
                    'vendor',
                    'deps.tar.gz',
                    'vendor',
                    'lib-c.tgz',
                  ),
                  size: 250,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.tar.gz',
                    'vendor',
                    'deps.tar.gz',
                    'vendor',
                    'lib-c.tgz',
                    'lib-c',
                    'main.cpp',
                  ),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'NafnlhdlUsoYOuZZdUgZ8Q',
                      format: 1,
                    },
                    {
                      data: '35a7e796176552ca183ae659',
                      format: 3,
                    },
                  ],
                  path: join('deps.zip', 'vendor', 'deps.zip'),
                  size: 1931,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'Meh8ayPvHT6VuGKR5wjdXg',
                      format: 1,
                    },
                    {
                      data: '31e87c6b23ef1d3e95b86291',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.zip',
                    'vendor',
                    'deps.zip',
                    'vendor',
                    'lib-a.zip',
                  ),
                  size: 429,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.zip',
                    'vendor',
                    'deps.zip',
                    'vendor',
                    'lib-a.zip',
                    'lib-a',
                    'main.cpp',
                  ),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: '81lo+auqnFMCnqaU5szYXg',
                      format: 1,
                    },
                    {
                      data: 'f35968f9abaa9c53029ea694',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.zip',
                    'vendor',
                    'deps.zip',
                    'vendor',
                    'lib-b.zip',
                  ),
                  size: 429,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.zip',
                    'vendor',
                    'deps.zip',
                    'vendor',
                    'lib-b.zip',
                    'lib-b',
                    'main.cpp',
                  ),
                  size: 126,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'v8uyfCAxRngknfDtYACgNw',
                      format: 1,
                    },
                    {
                      data: 'bfcbb27c20314678249df0ed',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.zip',
                    'vendor',
                    'deps.zip',
                    'vendor',
                    'lib-c.zip',
                  ),
                  size: 429,
                },
                {
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                  path: join(
                    'deps.zip',
                    'vendor',
                    'deps.zip',
                    'vendor',
                    'lib-c.zip',
                    'lib-c',
                    'main.cpp',
                  ),
                  size: 126,
                },
              ],
              type: 'fileSignatures',
            },
          ],
          identity: {
            type: 'cpp',
          },
          name: 'snyk-cpp-plugin',
          target: {
            branch: expect.any(String),
            remoteUrl: expect.any(String),
          },
        },
      ],
    };

    expect(actual).toEqual(expected);
  });

  it('should throw an error when invalid recursion level is provided', async () => {
    const fixturePath = join(
      __dirname,
      'fixtures',
      'extraction',
      'nested',
      '3-levels',
    );

    try {
      await scan({
        path: fixturePath,
        '--max-depth': -1,
      });
    } catch (err) {
      expect(err.message).toEqual(
        'Could not scan C/C++ project: invalid options: --max-depth should be a positive number.',
      );
    }
  });

  it('should not do the extraction when a recursion level of 0 is provided', async () => {
    const fixturePath = join(
      __dirname,
      'fixtures',
      'extraction',
      'nested',
      '3-levels',
    );

    const actual = await scan({ path: fixturePath, '--max-depth': 0 });
    const expected = {
      scanResults: [
        {
          facts: [
            {
              type: 'fileSignatures',
              data: [
                {
                  path: join('tar', 'deps.tar.gz'),
                  size: 1321,
                  hashes_ffm: [
                    {
                      data: 'fz4RzoWgsBMUSljtF3vdLQ',
                      format: 1,
                    },
                    {
                      data: '7f3e11ce85a0b013144a58ed',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('tar', 'main.cpp'),
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('zip', 'deps.zip'),
                  size: 2575,
                  hashes_ffm: [
                    {
                      data: 'VsdARlgcIaJaG2oYnPvYlg',
                      format: 1,
                    },
                    {
                      data: '56c74046581c21a25a1b6a18',
                      format: 3,
                    },
                  ],
                },
                {
                  path: join('zip', 'main.cpp'),
                  size: 126,
                  hashes_ffm: [
                    {
                      data: 'rTNlszcO9rHD53j4dQVfGQ',
                      format: 1,
                    },
                    {
                      data: 'd7432de58aeeeea23d70d8ce',
                      format: 3,
                    },
                  ],
                },
              ],
            },
          ],
          identity: {
            type: 'cpp',
          },
          name: 'snyk-cpp-plugin',
          target: {
            remoteUrl: expect.any(String),
            branch: expect.any(String),
          },
          analytics: [
            {
              name: 'fileSignaturesAnalyticsContext',
              data: {
                totalFileSignatures: 4,
                totalSecondsElapsedToGenerateFileSignatures: expect.any(Number),
              },
            },
          ],
        },
      ],
    };
    expect(actual).toEqual(expected);
  });
});
