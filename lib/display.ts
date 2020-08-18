import { ScannedProject } from './types';

export async function display(projects: ScannedProject[]): Promise<string> {
  const result = [];
  for (const { artifacts = [] } of projects) {
    for (const { data = [] } of artifacts) {
      for (const { filePath, hash } of data) {
        if (filePath && hash) {
          result.push(`${hash} ${filePath}`);
        }
      }
    }
  }
  return result.join('\n');
}
