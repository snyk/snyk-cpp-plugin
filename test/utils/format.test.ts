import {
  isNotWhiteSpace,
  isUtf8BomPresent,
  removeWhitespaces,
  removeWhitespaceBytewise,
} from '../../lib/utils/format';

describe('utils tests', () => {
  it('test isUtf8BomPresent', () => {
    const fileBuffer = Buffer.from(new Uint8Array([0xef, 0xbb, 0xbf]));
    expect(isUtf8BomPresent(fileBuffer)).toBe(true);
  });
  it('test isUtf8BomPresent corner case', () => {
    const fileBuffer = Buffer.from(new Uint8Array([0xef, 0xbb]));
    expect(isUtf8BomPresent(fileBuffer)).toBe(false);
  });
  it('includeChar includes correct characters', () => {
    expect(isNotWhiteSpace(0x14)).toBe(true);
    expect(isNotWhiteSpace(0x0f)).toBe(true);
    expect(isNotWhiteSpace(0x42)).toBe(true);
  });
  it('includeChar excludes correct characters', () => {
    expect(isNotWhiteSpace(0x09)).toBe(false);
    expect(isNotWhiteSpace(0x20)).toBe(false);
    expect(isNotWhiteSpace(0x0a)).toBe(false);
    expect(isNotWhiteSpace(0x0b)).toBe(false);
    expect(isNotWhiteSpace(0x0c)).toBe(false);
    expect(isNotWhiteSpace(0x0d)).toBe(false);
  });
  it('test removeUnwantedBytes', () => {
    expect(
      removeWhitespaces(Buffer.from('strin  gWith Unwa n t edBy t es')),
    ).toEqual(Buffer.from('stringWithUnwantedBytes'));
    expect(
      removeWhitespaces(Buffer.from('stringWithoutUnwantedBytes')),
    ).toEqual(Buffer.from('stringWithoutUnwantedBytes'));
  });
  it('test removeWhitespaceBytewise', () => {
    expect(
      removeWhitespaceBytewise(Buffer.from('stringW i t hWh i tes p ace'), 0),
    ).toEqual(Buffer.from('stringWithWhitespace'));
    expect(
      removeWhitespaceBytewise(Buffer.from('stringWithoutWhitespace'), 0),
    ).toEqual(Buffer.from('stringWithoutWhitespace'));
  });
});
