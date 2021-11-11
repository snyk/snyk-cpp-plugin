import { isEmpty } from '../../lib/utils/object';

describe('isEmpty', () => {
  it('should return false when objects that have at least 1 key are passed in', () => {
    expect(isEmpty({ foo: 'bar' })).toBe(false);
  });

  it('should return true when empty objects are passed in ', () => {
    expect(isEmpty({})).toBe(true);
  });
});
