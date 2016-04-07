'use strict';

import lodash from 'lodash';
import utility from 'utility';
import async from 'async';
import validator from 'validator';
import moment from 'moment';
import common from './common';
import requireAll from './requireAll';

// custom utils
lodash.mixin(common);

// third parts utils
lodash.mixin({
  utility: utility,
  async: async,
  moment: moment,
  validator: validator,
  requireAll: requireAll
});

export default lodash;