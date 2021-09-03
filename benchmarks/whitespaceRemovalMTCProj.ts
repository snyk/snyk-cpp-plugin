import { find } from '../lib/find';
const deepcopy = require('deepcopy');
import { join } from 'path';
import { promises } from 'fs';
import { removeWhitespaceBytewise5 } from '../lib/uhash';
import { isBinary } from '../lib/utils/binary';

const PROJECT = 'c-project';
//const PROJECT = 'opencv';

const { StaticPool } = require('node-worker-threads-pool');

const { readFile } = promises;

const bytewiseWorker = './benchmarks/workerBytewise.js';

const staticPoolBytewise = new StaticPool({
  size: 8,
  task: bytewiseWorker,
});

const runInBatchMode = async (fileBuffers: Buffer[], batchSize: number) => {
  console.log('making another copy...');
  const fileBuffersCopy = deepcopy(fileBuffers);
  console.log('removing whitespace using for loop over Uint8Array')
  console.log(`multi-thread, batch size ${batchSize}...`);
  const startTime = new Date().getTime();
  const jobs: Promise<Buffer>[] = [];
  const fileBatch: Buffer[] = [];
  let count = 1;
  for (const buffer of fileBuffersCopy) {
    if (isBinary(buffer)) continue;
    fileBatch.push(buffer);
    // console.log('current size of batch:', fileBatch.length);
    if (fileBatch.length >=batchSize) {
      jobs.push(staticPoolBytewise.exec(fileBatch));
      await Promise.all(jobs);
      if (count % 100 === 0) {
        console.log(`finished batch ${count}.`);
      }
      count++;
      fileBatch.splice(0, fileBatch.length);
      jobs.splice(0, jobs.length);
    }
  }
  jobs.push(staticPoolBytewise.exec(fileBatch));
  // console.log('Number of jobs:', jobs.length);
  // console.log('Size of last batch:', fileBatch.length);
  console.log('Number of files to process:', ((jobs.length - 1) * batchSize) + fileBatch.length );
  
  await Promise.all(jobs);
  //console.log(result[0][0]);
  const elapsedTime = new Date().getTime() - startTime;
  console.log('Took ', elapsedTime, 'ms.');
  fileBuffersCopy.splice(0, fileBuffersCopy.length);
}

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

  console.log('files in buffer array: ', fileBuffers.length);
  await runInBatchMode(fileBuffers, 5);
  await runInBatchMode(fileBuffers, 10);
  await runInBatchMode(fileBuffers, 20);
  await runInBatchMode(fileBuffers, 40); 
  await runInBatchMode(fileBuffers, 60);
  await runInBatchMode(fileBuffers, 80);
  await runInBatchMode(fileBuffers, 100);
  await runInBatchMode(fileBuffers, 120);
  await runInBatchMode(fileBuffers, 140);
  await runInBatchMode(fileBuffers, 160);
  await runInBatchMode(fileBuffers, 180);
  await runInBatchMode(fileBuffers, 200);

  console.log('making another copy...');
  const fileBuffers2 = deepcopy(fileBuffers);

  console.log('removing whitespace using for loop over Uint8Array (single-thread)...');
  const startTime = new Date().getTime();
  //console.log('files in buffer array: ', fileBuffers2.length);
  for (const buffer of fileBuffers2) {
    if (isBinary(buffer)) continue;
    removeWhitespaceBytewise5(buffer);
  }
  const elapsedTime = new Date().getTime() - startTime;
  console.log('Took ', elapsedTime, 'ms.');
  fileBuffers2.splice(0, fileBuffers2.length);
} 

main().then(() => {
  console.log('done.');
});
