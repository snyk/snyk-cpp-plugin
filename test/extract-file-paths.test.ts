import { Stats } from 'fs';
import * as path from 'path';
import * as findModule from '../lib/find';
import { MAX_SUPPORTED_FILE_SIZE } from '../lib/common';

describe('extract file paths', () => {
  it('should skip files greater than 2GB', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'hello-world');

    const statSpy = jest.spyOn(findModule, 'lstat');

    const statWithDir = {
      isFile: () => false,
      isDirectory: () => true,
      isSymbolicLink: () => false,
      size: 1,
    } as Stats;

    const statWithAllowedFileSize = {
      isFile: () => true,
      isDirectory: () => false,
      size: MAX_SUPPORTED_FILE_SIZE - 1,
      isSymbolicLink: () => false,
    } as Stats;

    const statWithFileSizeGreaterThanMaxAllowed = {
      isFile: () => true,
      isDirectory: () => false,
      size: MAX_SUPPORTED_FILE_SIZE + 1,
      isSymbolicLink: () => false,
    } as Stats;

    statSpy.mockResolvedValueOnce(statWithDir);
    statSpy.mockResolvedValueOnce(statWithAllowedFileSize);
    statSpy.mockResolvedValueOnce(statWithFileSizeGreaterThanMaxAllowed);
    statSpy.mockResolvedValueOnce(statWithAllowedFileSize);

    const [result] = await findModule.find(fixturePath);

    const expected = [
      path.join(fixturePath, 'add.cpp'),
      path.join(fixturePath, 'main.cpp'),
    ];

    expect(result).toEqual(expected);
  });
});
