import { Stats } from 'fs';
import * as findModule from '../lib/find';
import { MAX_SUPPORTED_FILE_SIZE } from '../lib/config';

describe('extract file paths', () => {
  it('should skip files greater than 2GB', async () => {
    const statSpy = jest.spyOn(findModule, 'stat');

    const statWithAllowedFileSize = {
      isFile: () => true,
      isDirectory: () => false,
      size: MAX_SUPPORTED_FILE_SIZE - 1,
    } as Stats;

    const statWithFileSizeGreaterThanMaxAllowed = {
      isFile: () => true,
      isDirectory: () => false,
      size: MAX_SUPPORTED_FILE_SIZE + 1,
    } as Stats;

    statSpy.mockResolvedValueOnce(statWithAllowedFileSize);
    statSpy.mockResolvedValueOnce(statWithFileSizeGreaterThanMaxAllowed);
    statSpy.mockResolvedValueOnce(statWithAllowedFileSize);

    const absolutePathWithAllowedFileSize =
      'fake-absolute-path-with-allowed-file-size';
    const absolutePathWithNotAllowedFileSized =
      'fake-absolute-path-with-not-allowed-file-size';

    const result = await findModule.extractFilePaths([
      absolutePathWithAllowedFileSize,
      absolutePathWithNotAllowedFileSized,
      absolutePathWithAllowedFileSize,
    ]);

    const expected = [
      absolutePathWithAllowedFileSize,
      absolutePathWithAllowedFileSize,
    ];
    expect(result).toEqual(expected);
  });
});
