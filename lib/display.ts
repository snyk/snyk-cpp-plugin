import { ScanResult } from './types';

export async function display(scanResults: ScanResult[]): Promise<string> {
  const result = [];
  for (const { artifacts = [] } of scanResults) {
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
