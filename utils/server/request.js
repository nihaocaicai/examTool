import {
  Debug
} from "../debug.js"

import {
  Token
} from "token.js"

var thisClass = undefined //转义 this

/**
 * 请求类
 */
class Request {
  constructor() {
    thisClass = this //转义 this
  }

  /**
   * [请求连接]
   * 
   * params = {url, method, data, success, statusCodeFail, fail};
   * 
   * success: 检查成功回调函数，返回成功获取到的值(res.data); 
   * 
   * statusCodeFail: 服务器返回代码错误信息回调函数，返回错误信息(obj = {statusCode, data}); 
   * 
   * fail : 连接失败回调函数，返回错误信息(res); 
   * 
   * noRefetch: 是否不做未授权重试机制（避免循环重试下去）
   */

  request(params, noRefetch) {
    wx.request({
      url: require("interface.js").url + params.url,
      data: params.data ? params.data : {},
      method: params.method ? params.method : 'GET',
      header: {
        'content-type': 'application/json',
        'token': wx.getStorageSync('token')
      },
      success: function(res) {
        var code = res.statusCode.toString()
        if (code.charAt(0) == '2') {
          /* 服务器连接正常*/
          params.success && params.success(res.data)
        } else {
          /* 服务器处理错误 */
          thisClass._debug(0, res)
          if (!noRefetch && code == '400' && res.data.error_code == '2001') {
            /* token 过期，需要重新获取 token */
            thisClass._refetch(params)
          } else {
            /* 其他情况一律调用错误回调函数 */
            if (params.statusCodeFail)
              params.statusCodeFail({
                statusCode: res.statusCode,
                data: res.data,
              })
            else
              params.fail && params.fail(res)
          }
        }
      },
      fail: function(res) {
        /* 服务器连接错误 */
        thisClass._debug(1, res)
        params.fail && params.fail(res)
      },
    })
  }

  /**
   * [设置错误信息]
   * (文件路径, 函数名称)
   */
  setFailInfo(path, functionName) {
    if (path && functionName)
      thisClass.failInfo = {
        path: path,
        functionName: functionName
      }
  }

  /**
   * (*内部函数)
   * [显示调试信息]
   */
  _debug(type, res) {
    var openDebug = true //是否要开启 debug
    if (openDebug) {
      var debug = new Debug() // 导入调试能力
      if (thisClass.failInfo == undefined)
        thisClass.failInfo = {
          path: 'utils/server/request.js',
          functionName: 'request'
        }
      if (type == 0) {
        // 服务器处理错误
        thisClass.failInfo.code = res.statusCode
        thisClass.failInfo.errMsg = res.data
        debug.printServerStatusCodeFail(thisClass.failInfo)
      } else if (type == 1) {
        // 服务器连接错误
        thisClass.failInfo.errMsg = res
        debug.printServerFail(thisClass.failInfo)
      }
    }
  }

  /**
   * (*内部函数)
   * [重新获取 token]
   */
  _refetch(params) {
    var token = new Token()
    token.getTokenFromServer({
      success: function() {
        thisClass.request(params, true)
      },
      fail: params.fail,
    })
  }
}

export {
  Request
}