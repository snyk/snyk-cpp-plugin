import * as os from 'os';

import { promises } from 'fs';
import { join } from 'path';
import { FilePath } from '../types';

const { mkdtemp } = promises;

export async function createTemporaryDir(): Promise<FilePath> {
  return await mkdtemp(join(os.tmpdir(), 'snyk'));
}
