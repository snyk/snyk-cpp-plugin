import { FileContent } from '../types';

export function isBinary(content: FileContent): boolean {
  return content.includes(0);
}
