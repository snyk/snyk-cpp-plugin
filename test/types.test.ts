import { SupportFileExtensions } from '../lib';

describe('SupportFileExtensions', () => {
  it('should export supported file extensions ', async () => {
    const expected = [
      '.c',
      '.cc',
      '.cpp',
      '.cxx',
      '.c++',
      '.h',
      '.hh',
      '.hpp',
      '.hxx',
      '.h++',
      '.i',
      '.ii',
      '.ixx',
      '.ipp',
      '.txx',
      '.tpp',
      '.tpl',
    ];
    expect(expected.sort()).toEqual(SupportFileExtensions.sort());
  });
});
