import { find } from '../lib/find';
import { join } from 'path';
import { promises } from 'fs';
import { removeWhitespaceBytewise2 } from '../lib/uhash';
import { isBinary } from '../lib/utils/binary';

const { StaticPool } = require('node-worker-threads-pool');

const bytewiseWorker = './benchmarks/workerBytewise.js';


const staticPoolBytewise = new StaticPool({
  size: 4,
  task: bytewiseWorker,
});

const { readFile } = promises;

const main = async () => {
  let filePaths: string[] = [];
  const fixturePath = join(__dirname, 'opencv');
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

  console.log('removing whitespace using for loop over UintArray8...');
  const jobs: Promise<Buffer>[] = [];
  const startTime = new Date().getTime();
  for (const buffer of fileBuffers) {
    if (isBinary(buffer)) continue;
    //removeWhitespaceBytewise5(buffer);
    jobs.push(staticPoolBytewise.exec(buffer));
  }
  await Promise.all(jobs);
  const elapsedTime = new Date().getTime() - startTime;
  console.log('Took ', elapsedTime, 'ms.');

  // console.log('removing whitespace using for loop over Buffer...');
  // jobs.splice(0,jobs.length);
  const startTime2 = new Date().getTime();
  for (const buffer of fileBuffers) {
    if (isBinary(buffer)) continue;
    removeWhitespaceBytewise2(buffer);
    // jobs.push(staticPoolRegex.exec(buffer));
  }
  // await Promise.all(jobs);
  const elapsedTime2 = new Date().getTime() - startTime2;
  console.log('Took ', elapsedTime2, 'ms.');
};

main().then(() => {
  console.log('done.');
});
