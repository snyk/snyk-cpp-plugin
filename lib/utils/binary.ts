export function isBinary(fileBuffer: Buffer): boolean {
  // The spec defines a binary file as anything containing a null byte
  return fileBuffer.includes(0);
}
