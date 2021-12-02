import { FileContent } from '../types';

const Utf8Bom = Buffer.from(new Uint8Array([0xef, 0xbb, 0xbf]));
const asciiChars = {
  space: 0x20,
  carriageReturn: 0x0d,
  newLine: 0x0a,
  horizontalTab: 0x09,
  verticalTab: 0x0b,
  newPage: 0x0c,
};

/**
 * Check if the UTF-8 BOM is present in the first three bytes
 *
 * @param {FileContent} content
 * @returns {boolean}
 */
export function isUtf8BomPresent(content: FileContent): boolean {
  if (content.length < 3) {
    return false;
  }

  return Utf8Bom.compare(content.subarray(0, 3)) === 0;
}

/**
 * Check if char is not whitespace
 *
 * @param {number} char
 * @returns {boolean}
 */
export function isNotWhiteSpace(char: number): boolean {
  return (
    char > asciiChars.space ||
    (char != asciiChars.space &&
      char != asciiChars.carriageReturn &&
      char != asciiChars.newLine &&
      char != asciiChars.horizontalTab &&
      char != asciiChars.verticalTab &&
      char != asciiChars.newPage)
  );
}

/**
 * Remove whitespaces from the file
 *
 * @param {FileContent} content
 * @param {number} startingIndex
 * @returns {FileContent}
 */
export function removeWhitespaceBytewise(
  content: FileContent,
  startingIndex: number,
): FileContent {
  let writeIndex = 0;

  for (let readIndex = startingIndex; readIndex < content.length; readIndex++) {
    const c = content[readIndex];

    if (isNotWhiteSpace(c)) {
      content[writeIndex] = c;
      writeIndex++;
    }
  }

  return content.slice(0, writeIndex);
}

/**
 * Remove unwanted bytes from the file
 *
 * If it is UTF-8 BOM we start parsing the file content from index 3
 *
 * @param {FileContent} content
 * @returns {FileContent}
 */
export function removeWhitespaces(content: FileContent): FileContent {
  const startingIndex = isUtf8BomPresent(content) ? 3 : 0;
  return removeWhitespaceBytewise(content, startingIndex);
}
