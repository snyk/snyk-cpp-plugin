import { isBinary } from '../../lib/utils/binary';
import * as fs from 'fs';
import * as path from 'path';

describe('isBinary', () => {
  it('should return true for binary file', async () => {
    const fixturePath = path.join(__dirname, '..', 'fixtures');
    const filePath = path.join(fixturePath, 'dog.jpg');
    const fileContents = fs.readFileSync(filePath);
    const actual = isBinary(fileContents);
    expect(actual).toBe(true);
  });

  it('should return false for text file', async () => {
    const fixturePath = path.join(__dirname, '..', 'fixtures');
    // test/fixtures/hello-world/add.cpp
    const filePath = path.join(fixturePath, 'hello-world', 'add.cpp');
    const fileContents = fs.readFileSync(filePath);
    const actual = isBinary(fileContents);
    expect(actual).toBe(false);
  });
});
