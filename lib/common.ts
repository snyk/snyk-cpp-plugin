import * as os from 'os';
import { platform } from 'process';

export const isWin = platform === 'win32';

export const MAX_SUPPORTED_FILE_SIZE: number = 2 * 1024 * 1024 * 1024 - 1;

export const HASHING_CONCURRENCY_LEVEL = os.cpus().length;

export const DECOMPRESSING_CONCURRENCY_LEVEL = os.cpus().length * 8;

export const DECOMPRESSING_WORKSPACE_DIR = 'workspace';

export const DECOMPRESSING_IGNORE_DIR = 'ignore';

export const isSupportedSize = (size: number): boolean =>
  0 < size && size < MAX_SUPPORTED_FILE_SIZE;
