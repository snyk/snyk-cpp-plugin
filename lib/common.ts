import * as os from 'os';

const osName = require('os-name');

export const isWindowsOS = (): boolean =>
  osName()
    .toLowerCase()
    .indexOf('windows') === 0;

export const MAX_SUPPORTED_FILE_SIZE: number = 2 * 1024 * 1024 * 1024 - 1;

export const HASHING_CONCURRENCY_LEVEL = os.cpus().length;

export const DECOMPRESSING_CONCURRENCY_LEVEL = os.cpus().length * 8;

export const DEFAULT_DECOMPRESSING_DEPTH = 1;

export const EXTRACTED_DIR_SUFFIX = '.extracted';

export const isSupportedSize = (size: number): boolean =>
  0 < size && size < MAX_SUPPORTED_FILE_SIZE;
