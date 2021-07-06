/* Used only for unit tests of the fossid-native module */
import * as binary from '@mapbox/node-pre-gyp';
import * as fs from 'fs';
import * as path from 'path';

import { SignatureResult } from './types';

const binding_path = binary.find(
  path.resolve(
    path.join(__dirname, '../node_modules/fossid-native/package.json'),
  ),
);
const fossidNative = require(binding_path);

const getFile = (filePath: string): Uint8Array => {
  return fs.readFileSync(filePath);
};

export const getSignature = (filePath: string): SignatureResult => {
  const data = getFile(filePath);
  const scanResult: string = fossidNative.getSignature(filePath, data);
  return JSON.parse(scanResult);
};
