const { parentPort } = require('worker_threads');

function removeWhitespaceBytewise(fileBufferArray) {
  const BYTES_TO_REMOVE = new Uint8Array([0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x20]);
  const resultArray = [];
  fileBufferArray.forEach((fileBuffer) => {
    resultArray.push(removeBytesFromBuffer5(fileBuffer, BYTES_TO_REMOVE));
  });
  
  return resultArray;
}

const removeBytesFromBuffer5 = (
  fileBuffer,
  valuesToRemove,
) => {
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < fileBuffer.length; readIndex++) {
    if (!valuesToRemove.includes(fileBuffer[readIndex])) {
      fileBuffer[writeIndex] = fileBuffer[readIndex];
      writeIndex++;
    }
  }
  return fileBuffer.subarray(0, writeIndex);
};


// Main thread will pass the data you need
// through this event listener.
parentPort.on('message', (param) => {
  const result = removeWhitespaceBytewise(param);

  // return the result to main thread.
  parentPort.postMessage(result);
});