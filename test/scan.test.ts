import * as path from 'path';
import { scan, PluginResponse } from '../lib';
import { Facts } from '../lib/types';

const helloWorldFixturePath = path.join(__dirname, 'fixtures', 'hello-world');
const helloWorldFingerprints: Facts[] = [
  {
    type: 'cpp-fingerprints',
    data: [
      {
        filePath: path.join(helloWorldFixturePath, 'add.cpp'),
        hash: '52d1b046047db9ea0c581cafd4c68fe5',
      },
      {
        filePath: path.join(helloWorldFixturePath, 'add.h'),
        hash: 'aeca71a6e39f99a24ecf4c088eee9cb8',
      },
      {
        filePath: path.join(helloWorldFixturePath, 'main.cpp'),
        hash: 'ad3365b3370ef6b1c3e778f875055f19',
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
          facts: helloWorldFingerprints,
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
          facts: helloWorldFingerprints,
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
