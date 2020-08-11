import * as path from 'path';
import { scan } from '../lib';

describe('scan', () => {
  it('should produce scanned artifacts', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'hello-world');
    const actual = await scan(fixturePath);
    const expected = {
      type: 'cpp-fingerprints',
      data: [
        {
          filePath: path.join(fixturePath, 'add.cpp'),
          hash: '52d1b046047db9ea0c581cafd4c68fe5',
        },
        {
          filePath: path.join(fixturePath, 'add.h'),
          hash: 'aeca71a6e39f99a24ecf4c088eee9cb8',
        },
        {
          filePath: path.join(fixturePath, 'main.cpp'),
          hash: 'ad3365b3370ef6b1c3e778f875055f19',
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should throw exception when invalid directory path', async () => {
    expect.assertions(1);
    const filePath = 'does/not/exist';
    const expected = new Error(
      `Could not scan ${filePath}. Error: ENOENT: no such file or directory, stat 'does/not/exist'`,
    );
    try {
      await scan(filePath);
    } catch (err) {
      expect(err).toEqual(expected);
    }
  });
});
