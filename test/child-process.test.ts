import * as path from 'path';
import { spawn } from '../lib/child-process';

const PRINT_ENV = path.join(__dirname, 'fixtures', 'print-env.js');

describe('spawn', () => {
  it('should resolve when command exists', async () => {
    const actual = await spawn('node', ['--version']);
    expect(actual).toMatchObject({
      code: expect.any(Number),
      stdout: expect.any(String),
      stderr: expect.any(String),
    });
  });
  it('should reject when command does not exist', async () => {
    expect.assertions(1);
    try {
      await spawn('does-not-exist');
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});

describe('child process environment', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('the child gets no SNYK_* variables', async () => {
    process.env = { ...originalEnv, SNYK_TOKEN: 'test-token' };

    const child = JSON.parse((await spawn('node', [PRINT_ENV])).stdout);

    expect(child.snykKeys).toEqual([]);
  });
});
