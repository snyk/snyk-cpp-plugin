const { parentPort, workerData } = require('worker_threads');

// NB: workerData is the compiled regex expression;
function removeWhitespaceRegex(fileContents) {
  return Buffer.from(fileContents.toString().replace(workerData, ''));
}

// Main thread will pass the data you need
// through this event listener.
parentPort.on('message', (param) => {
  const result = removeWhitespaceRegex(param);

  // return the result to main thread.
  parentPort.postMessage(result);
});