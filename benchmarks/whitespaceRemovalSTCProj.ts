import { find } from '../lib/find';
import { join } from 'path';
import { promises } from 'fs';
const deepcopy = require('deepcopy');
import { removeWhitespaceBytewise3, removeWhitespaceBytewise6 } from '../lib/uhash';
import { isBinary } from '../lib/utils/binary';

const { readFile } = promises;

const PROJECT = 'c-project';

const main = async () => {
  let filePaths: string[] = [];
  const fixturePath = join(__dirname, PROJECT);
  try {
    filePaths = await find(fixturePath);
  } catch (err) {
    console.log(err);
  }
  console.log('reading files...');
  const fileBuffers: Buffer[] = [];
  for (const filePath of filePaths) {
    fileBuffers.push(await readFile(filePath));
  }

  console.log('making another copy...');
  let fileBuffersCopy = deepcopy(fileBuffers);

  console.log('removing whitespace - slice version...');
  const startTime = new Date().getTime();
  for (const buffer of fileBuffersCopy) {
    if (isBinary(buffer)) continue;
    removeWhitespaceBytewise6(buffer);
  }
  const elapsedTime = new Date().getTime() - startTime;
  console.log('Took ', elapsedTime, 'ms.');


  console.log('making another copy...');
  fileBuffersCopy = deepcopy(fileBuffers);

  console.log('removing whitespace - subarray version...');
  const startTime2 = new Date().getTime();
  for (const buffer of fileBuffersCopy) {
    if (isBinary(buffer)) continue;
    removeWhitespaceBytewise3(buffer);
  }
  const elapsedTime2 = new Date().getTime() - startTime2;
  console.log('Took ', elapsedTime2, 'ms.');

  

  

 
};

main().then(() => {
  console.log('done.');
});
