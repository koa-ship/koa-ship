'use strict';

import lodash from 'lodash';
import async from 'async';
import validator from 'validator';
import moment from 'moment';
import common from './common';
import requireAll from './requireAll';

lodash.mixin(common);

lodash.mixin({
  async: async,
  moment: moment,
  validator: validator,
  requireAll: requireAll
});

export default lodash;