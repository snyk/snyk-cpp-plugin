import * as os from 'os';

const osName = require('os-name');

export const isWindowsOS = (): boolean =>
  osName()
    .toLowerCase()
    .indexOf('windows') === 0;

export const MAX_SUPPORTED_FILE_SIZE: number = 2 * 1024 * 1024 * 1024 - 1;

export const CONCURRENCY_LEVEL = os.cpus().length;
