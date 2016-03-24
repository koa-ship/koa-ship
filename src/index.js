'use strict';

import Application from './application';

export default function createApp(rootPath) {
  return new Application(rootPath, __dirname);
};