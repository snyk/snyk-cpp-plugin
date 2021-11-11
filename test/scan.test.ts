import * as path from 'path';
import { PluginResponse, scan } from '../lib';
import { Facts } from '../lib/types';

const helloWorldFixturePath = path.join(__dirname, 'fixtures', 'hello-world');
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

const bigFixturePath = path.join(__dirname, 'fixtures', 'big-fixture');

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
    const fixturePath = path.join(__dirname, 'fixtures', 'hello-world');
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
});
