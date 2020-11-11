import { spawn } from '../lib/child-process';

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
