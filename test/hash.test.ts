import * as path from 'path';
import { hash } from '../lib/hash';

describe('hash', () => {
  it('should generate the md5 for a given empty file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'example');
    const filePath = path.join(fixturePath, 'main.cpp');
    const expected = 'd41d8cd98f00b204e9800998ecf8427e';
    const actual = await hash(filePath);
    expect(actual).toBe(expected);
  });

  it('should generate the md5 for a given file', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'hello-world');
    const filePath = path.join(fixturePath, 'main.cpp');
    const expected = 'ad3365b3370ef6b1c3e778f875055f19';
    const actual = await hash(filePath);
    expect(actual).toBe(expected);
  });

  it('should throw exception when invalid file', async () => {
    expect.assertions(1);
    const filePath = 'does/not/exist';
    try {
      await hash(filePath);
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
});
