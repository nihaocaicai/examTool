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
  get_token(successCallback) {
    var token = new Token()
    token.getTokenFromServer({
      success: successCallback,
      fail: thisClass._loginFail
    })
  }

  /**
   * [获取 user_info]
   */
  get_user_info(successCallback) {
    var r = new Request()
    r.setFailInfo('login-model.js', "get_user_info")
    r.request({
      url: '/user/info/show',
      success: function(data) {
        successCallback(data)
      },
      fail: thisClass._loginFail
    })
  }

  /**
   * [更新信息 wx_user_info]
   */
  update_wx_user_info(data, successCallback) {
    //更改过信息，尝试更改服务器上的信息
    var r = new Request()
    r.setFailInfo('login-model.js', "update_wx_user_info")
    r.request({
      url: "/user/info/modify",
      method: "POST",
      data: data,
      success: successCallback,
      fail: thisClass._toIndex,
    })
  }

  /**
   * [保存信息]
   * 保存 user_info 到服务器
   */
  saveUserInfo(params) {
    var r = new Request()
    r.failInfo = {
      path: 'login-model.js',
      functionName: "saveUserInfo"
    }
    r.request({
      url: '/user/info/modify',
      method: 'POST',
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }

  /**
   * (*内部函数)
   * [登录失败]
   */
  _loginFail() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '获取信息失败。请检查网络连接后重试',
      confirmColor: '#04838e',
      confirmText: '重试',
      showCancel: false,
      success: function() {
        wx.reLaunch({
          url: '/pages/login/login',
        })
      }
    })
  }

  /**
   * (*内部函数)
   * [跳转到首页]
   */
  _toIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  }
}

export {
  Login
}