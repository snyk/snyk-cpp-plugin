import * as path from 'path';

import { PluginResponse, scan } from '../lib';

import { Facts } from '../lib/types';

const helloWorldFixturePath = path.join(__dirname, 'fixtures', 'hello-world');
const helloWorldSignatures: Facts[] = [
  {
    type: 'cpp-signatures',
    data: [
      {
        path: path.join(helloWorldFixturePath, 'add.cpp'),
        hashes_ffm: [
          {
            format: 1,
            data: 'UtGwRgR9ueoMWByv1MaP5Q',
          },
          {
            format: 1,
            data: 'DBRivtcLTzSq/G5uOyLuJg',
          },
        ],
      },
      {
        path: path.join(helloWorldFixturePath, 'add.h'),
        hashes_ffm: [
          {
            format: 1,
            data: 'rspxpuOfmaJOz0wIju6cuA',
          },
        ],
      },
      {
        path: path.join(helloWorldFixturePath, 'main.cpp'),
        hashes_ffm: [
          {
            format: 1,
            data: 'rTNlszcO9rHD53j4dQVfGQ',
          },
          {
            format: 1,
            data: 'u1xJYWP3m8C8UIKUS02CMQ',
          },
        ],
      },
    ],
  },
];

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
        },
      ],
    };
    expect(actual).toEqual(expected);
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
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should throw exception when invalid directory path', async () => {
    expect.assertions(1);
    const filePath = 'does/not/exist';
    const expected = new Error(
      `Could not scan C/C++ project, 'does/not/exist' does not exist.`,
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
      `Could not scan C/C++ project, invalid options no path provided.`,
    );
    try {
      await scan({} as any);
    } catch (err) {
      expect(err).toEqual(expected);
    }
  });
});
