'use strict';

import lodash from 'lodash';
import utility from 'utility';
import validator from 'validator';
import moment from 'moment';
import common from './common';
import requireAll from './requireAll';

// custom utils
lodash.mixin(common);

// third parts utils
lodash.mixin(utility);
lodash.mixin(validator);

lodash.mixin({
  moment: moment,
  requireAll: requireAll
});

export default lodash;