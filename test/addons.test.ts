// const helloWorld = require('../addons/hello-world.node');
// const funcArgs = require('../addons/func-args.node');
// const anyAddon = require('../addons/any.node');
const hashAddon = require('../addons/hash.node');

describe('C/C++ addons are callable', () => {
  // it('uses hello-world addon that returns `world`', () => {
  //   expect(helloWorld.hello()).toBe('world');
  // });

  // it('uses numeric addon that returns a number', () => {
  //   expect(funcArgs.add(0, 5)).toBe(5);
  // });

  it('expect hashAddon to return 3 hash values', () => {
    expect(hashAddon.data()).toEqual([
      'c51e19e3e6e6e69c34bce8b8d526ca71',
      'a3307903d321c2d04511e7def2d882af',
      '941740f1446eab02e293d180b245a629',
    ]);
  });

  // it('uses any addon to validate that 2 different functions are callable', () => {
  //   expect(anyAddon.concatStr('Team', 'Tundra')).toBe('TeamTundra');
  //   expect(anyAddon.concatStr('Team', 'Anarchy')).toBe('TeamAnarchy');
  //   expect(anyAddon.concatStr('Team', 'Hulk')).toBe('TeamHulk');
  //   expect(anyAddon.doSomething(1, 2)).toBe(3);
  //   expect(anyAddon.doSomething(1, 4)).toBe(5);
  // });
});
