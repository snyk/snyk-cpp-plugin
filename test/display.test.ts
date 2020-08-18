import * as fs from 'fs';
import * as path from 'path';
import { display, scan } from '../lib';

describe('display', () => {
  it('should return human readable text', async () => {
    const fixturePath = path.join('./', 'test', 'fixtures', 'hello-world');
    const displayTxtPath = path.join(fixturePath, 'display.txt');
    const projects = await scan({ path: fixturePath });
    const actual = await display(projects);
    const expected = fs.readFileSync(displayTxtPath, 'utf-8');
    expect(actual).toBe(expected);
  });
  it('should return empty string when no projects', async () => {
    const actual = await display([]);
    expect(actual).toBe('');
  });
  it('should return empty string when invalid projects', async () => {
    const actual = await display([1, 2, 3] as any);
    expect(actual).toBe('');
  });
  it('should return empty string when invalid artifacts', async () => {
    const actual = await display([{ artifacts: ['a', 'b', 'c'] }] as any);
    expect(actual).toBe('');
  });
  it('should return empty string when invalid artifact data', async () => {
    const actual = await display([
      { artifacts: [{ type: 'test', data: [1, 2, 3] }] },
    ] as any);
    expect(actual).toBe('');
  });
});
