import { fromUrl } from 'hosted-git-info';
import { getTarget } from '../lib/git';
import * as childProcess from '../lib/child-process';
import { SpawnOptions } from 'child_process';

function mockSpawn(arg: string) {
  return (
    _command: string,
    args?: string[],
    _options?: SpawnOptions,
  ): Promise<{ code: number; stdout: string; stderr: string }> => {
    if (args?.includes(arg)) {
      return Promise.resolve({ code: 1, stdout: '', stderr: 'error' });
    }
    return Promise.resolve({ code: 0, stdout: 'success', stderr: '' });
  };
}

describe('gitTarget', () => {
  afterEach(() => jest.resetAllMocks());
  it('should return git target', async () => {
    const { remoteUrl, branch } = await getTarget();
    const info = fromUrl(remoteUrl);
    expect(info).toMatchObject({
      user: 'snyk',
      project: 'snyk-cpp-plugin',
    });
    expect(branch).toBeTruthy();
  });
  it('should return empty remote url when git remote command fails', async () => {
    const mock = mockSpawn('remote');
    jest.spyOn(childProcess, 'spawn').mockImplementation(mock);
    const { remoteUrl, branch } = await getTarget();
    expect(remoteUrl).toBe('');
    expect(branch).toBeTruthy();
  });
  it('should return empty branch when git rev-parse command fails', async () => {
    const mock = mockSpawn('rev-parse');
    jest.spyOn(childProcess, 'spawn').mockImplementation(mock);
    const { remoteUrl, branch } = await getTarget();
    expect(remoteUrl).toBeTruthy();
    expect(branch).toBe('');
  });
  it('should return empty remote url and branch when spawn rejects', async () => {
    jest.spyOn(childProcess, 'spawn').mockRejectedValue({ message: 'error' });
    const target = await getTarget();
    expect(target).toEqual({
      remoteUrl: '',
      branch: '',
    });
  });
});
