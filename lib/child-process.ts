import * as childProcess from 'child_process';

export async function spawn(
  command: string,
  args?: string[],
  options?: childProcess.SpawnOptions,
): Promise<{
  code: number;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const process = childProcess.spawn(command, args, options);
    process.stdout.on('data', (data: string | Buffer) => {
      stdout += data;
    });
    process.stderr.on('data', (data: string | Buffer) => {
      stderr += data;
    });
    process.on('close', (code: number) => {
      resolve({ code, stdout, stderr });
    });
    process.on('error', (err) => {
      reject(err);
    });
  });
}
