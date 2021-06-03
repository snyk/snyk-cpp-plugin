import * as path from 'path';

import { getSignature } from '../lib/fossid';

describe('getSignature', () => {
  it('should return a correct scan result', () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'example', 'main.cc');
    const expected = {
      path: filePath,
      hashes_ffm: [
        { format: 1, data: 'WY0eT7ZYA9PlMPjm2oSZ2g' },
        { format: 1, data: 'uMmOIaP1JsOZUWjzZRXKyg' },
      ],
    };
    const actual = getSignature(filePath);
    expect(actual).toStrictEqual(expected);
  });

  it('should return a correct result for empty file', () => {
    const fixturePath = path.join(__dirname, 'fixtures');
    const filePath = path.join(fixturePath, 'empty', '.keep');
    const expected = {
      path: filePath,
      ignore_reason: 'skipping empty file',
    };
    const actual = getSignature(filePath);
    expect(actual).toStrictEqual(expected);
  });
});
