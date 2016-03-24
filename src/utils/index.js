'use strict';

import lodash from 'lodash';

import common from './common';
import requireAll from './requireAll';

lodash.mixin(common);

lodash.mixin({
  requireAll: requireAll
});

export default lodash;