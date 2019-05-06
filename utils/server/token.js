import {
  Debug
}
from "../debug.js"

import {
  Storage
} from "../storage.js"

var thisClass = undefined //转义 this

/**
 * token 操作类
 */
class Token {
  constructor() {
    thisClass = this //转义 this
  }

  /**
   * [从服务器获取 token]
   * 
   * callbacks = {success, fail}
   * 
   * success: 检查成功回调函数，不返回任何值
   * 
   * fail: 连接失败回调函数，返回错误信息
   */
  getTokenFromServer(callBacks) {
    wx.login({
      success: function(l) {
        wx.request({
          url: require("interface.js").url + '/user/token',
          method: 'POST',
          data: {
            code: l.code
          },
          success: function(res) {
            var code = res.statusCode.toString()
            if (code.charAt(0) == '2') {
              /* token 获取成功*/
              //存入 token
              var storage = new Storage()
              storage.save({
                key: 'token',
                data: res.data.token,
                success: function() {
                  callBacks.success && callBacks.success(res.data)
                },
                fail: callBacks.fail,
                path: "utils/server/token.js",
                funtionName: "getTokenFromServer",
              })
            } else {
              /* 服务器处理错误 */
              thisClass._debug(2, res)
              callBacks.fail && callBacks.fail({
                statusCode: res.statusCode,
                data: res.data
              })
            }
          },
          fail: function(res) {
            // 服务器连接失败
            thisClass._debug(1, res)
            callBacks.fail && callBacks.fail(res)
          }
        })
        //wx.request()
      },
      fail: function(res) {
        // wx.login 执行失败
        thisClass._debug(0, res)
        callBacks.fail && callBacks.fail(res)
      }
    })
  }

  /**
   * (*内部函数)
   * [显示调试信息]
   */
  _debug(type, res) {
    var openDebug = true //是否要开启 debug
    if (openDebug) {
      var debug = new Debug() // 导入调试能力
      var path = "utils/server/token.js"
      var functionName = "getTokenFromServer"
      if (type == 0) {
        // wx.login 执行失败
        debug.printWxLoginError(path, functionName, res)
      } else if (type == 1) {
        // 服务器连接失败
        debug.printServerFail({
          path: path,
          functionName: functionName,
          errMsg: res
        })
      } else if (type == 2) {
        // 服务器处理错误
        debug.printServerStatusCodeFail({
          path: path,
          functionName: functionName,
          statusCode: res.statusCode,
          errMsg: res.data
        })
      }
    }
  }
}

export {
  Token
}