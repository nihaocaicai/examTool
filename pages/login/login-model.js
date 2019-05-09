import {
  Request
} from "../../utils/server/request.js"

import {
  Token
} from "../../utils/server/token.js"

var thisClass = this

class LoginComponent {
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

  /**
   * [获取 user_info]
   */
  get_user_info(callbacks) {
    var r = new Request()
    r.setFailInfo('login-model.js', "get_user_info")
    r.request({
      url: '/user/info/show',
      success: function(data) {
        callbacks.success(data)
      },
      fail: callbacks.fail
    })
  }

  /**
   * [更新信息 wx_user_info]
   */
  update_wx_user_info(data, callbacks) {
    //更改过信息，尝试更改服务器上的信息
    var r = new Request()
    r.setFailInfo('login-model.js', "update_wx_user_info")
    r.request({
      url: "/user/info/modify",
      method: "POST",
      data: data,
      success: callbacks.success,
      fail: callbacks.fail,
    })
  }

  /**
   * [保存信息]
   * 保存 user_info 到服务器
   */
  saveUserInfo(params) {
    var r = new Request()
    r.setFailInfo('login-model.js', "saveUserInfo")
    r.request({
      url: '/user/info/modify',
      method: 'POST',
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }
}

export {
  LoginComponent
}