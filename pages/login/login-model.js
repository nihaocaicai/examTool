import {
  Request
} from "../../utils/server/request.js"

import {
  Token
} from "../../utils/server/token.js"

var thisClass = this

class Login {
  constructor() {
    thisClass = this
  }

  /**
   * [获取token]
   */
  get_token(callbacks) {
    var token = new Token()
    token.getTokenFromServer({
      success: callbacks.success,
      fail: callbacks.fail,
    })
  }
}

export {
  Login
}