'use strict';

class AdminBaseController extends BaseController {

  before() {
    super.before();
    // this.set('layout', 'layouts/admin');
  }

}

module.exports = AdminBaseController;