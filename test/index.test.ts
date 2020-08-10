import * as lib from '../lib';

describe('scan', () => {
  it('should produce scanned artifacts', async () => {
    const actual = await lib.scan();
    const expected = {
      type: 'cpp-fingerprints',
      data: [],
    };
    expect(actual).toEqual(expected);
  });
});
