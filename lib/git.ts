import { GitTarget } from './types';
import { spawn } from './child-process';

export async function getTarget(): Promise<GitTarget> {
  try {
    const remote = await spawn('git', ['remote', 'get-url', 'origin']);
    const revParse = await spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    return {
      remoteUrl: remote.stdout.trim(),
      branch: revParse.stdout.trim(),
    };
  } catch (err) {
    // when git is not installed
    return {
      remoteUrl: '',
      branch: '',
    };
  }
}
