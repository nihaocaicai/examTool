import {
  Debug
}
from "../debug.js" // 导入调试能力

import {
  Storage
} from "../storage.js" // 导入微信缓存操作能力


const debug = new Debug() //删除即可关闭 debug 模式
const storage = new Storage()

/**
 * token 操作类
 */
class Token {
  constructor() {
    //导入获取token的接口配置
    this.base = require("interface.js") //地址配置表
    this.successCallBack = undefined //检查成功回调函数(选填)，返回成功获取到的值
    this.statusCodeFailCallBack = undefined //服务器内部错误回调函数(选填)，返回服务器错误代码
    this.failCallBack = undefined //连接失败回调函数(选填)，返回错误信息
    this.retryFailCallBack = undefined //重试失败回调函数(选填)
    this.retryTime = 5 //重试次数限制,0表示不重试
    this.isRetry = !(this.retryTime == 0) //内部类，只需要更改 retryTime 的值即可
  }

  /**
   * [设置重试次数]
   * {选填}
   * 默认为5次
   */
  setRetryTime(retryTime) {
    this.retryTime = retryTime
    this.isRetry = !(this.retryTime == 0)
  }

  /**
   * [设置回调函数]
   * {选填}
   * successCallBack, statusCodeFailCallBack, failCallBack, retryFailCallBack
   * （检查成功回调函数, 服务器内部错误回调函数, 连接失败回调函数, 重试失败回调函数)
   */
  setCallBackFunction(fun) {
    if (fun) {
      this.successCallBack = fun.successCallBack
      this.statusCodeFailCallBack = fun.statusCodeFailCallBack
      this.failCallBack = fun.failCallBack
      this.retryFailCallBack = fun.retryFailCallBack
    }
  }

  /**
   * [验证 token]
   * isRetry: 是否开启重试操作
   */
  verifyToken() {
    this.token = wx.getStorageSync('token')
    if (this.token) {
      //有 token，从服务器验证是否正确
      /* 为了测试，关闭这个接口this._veirfyFromServer()*/
      this.getTokenFromServer() //调试用，正式使用需要打开
    } else {
      //没有 token
      this.getTokenFromServer()
    }
  }

  /**
   * (*内部调用)
   * [从服务器验证 token]
   */
  _veirfyFromServer() {
    var that = this
    var isVaildFlag = "isValid" //返回值中表明 token 是否正确的标签名(等待重设)

    wx.request({
      url: that.base.url + that.base.interface.verifyToken.url,
      method: that.base.interface.verifyToken.method,
      data: {
        token: this.token
      },
      success: function(res) {
        if (res.statusCode == that.base.interface.verifyToken.statusCode) {
          if (res.data[isVaildFlag]) {
            if (that.successCallBack) {
              that.successCallBack()
            }
          } else {
            that.getTokenFromServer()
          }
        } else {
          if (debug) {
            obj = new Object()
            obj.path = "utils/server/token.js"
            obj.functionName = "_veirfyFromServer()"
            obj.statusCode = res.statusCode
            obj.errMsg = res.data
            debug.printServerStateCodeFail(obj)
          }
          that.step = 0
          that._errorConnect()
          if (that.statusCodeFailCallBack) {
            that.statusCodeFailCallBack(res.statusCode)
          }
        }
      },
      fail: function(res) {
        if (debug) {
          obj = new Object()
          obj.path = "utils/server/token.js"
          obj.functionName = "_veirfyFromServer()"
          obj.errMsg = res
          debug.printServerFail(obj)
        }
        that.step = 0
        that._errorConnect()
        if (that.failCallBack) {
          that.failCallBack(res)
        }
      }
    })
  }

  /**
   * [从服务器获取 token]
   */
  getTokenFromServer() {
    var that = this
    wx.login({
      success: function(r) {
        wx.request({
          url: that.base.url + that.base.interface.getToken.url,
          method: that.base.interface.getToken.method,
          data: {
            code: r.code
          },
          success: function(res) {
            if (res.statusCode == that.base.interface.getToken.statusCode) {
              /* 成功获取 */
              storage.setSaveType("用户验证信息")
              storage.setSuccessCallBack(function() {
                if (that.successCallBack) {
                  that.successCallBack(res)
                }
              })
              if (debug) {
                //开启调试，则设置调试信息
                var obj = new Object()
                obj.path = "utils/server/token.js"
                obj.functionName = "getTokenFromServer"
                storage.setFailInfo(obj)
              }
              storage.save('token', res.data.token)
            } else {
              /* 服务器内部错误 */
              if (debug) {
                obj = new Object()
                obj.path = "utils/server/token.js"
                obj.functionName = "getTokenFromServer"
                obj.statusCode = res.statusCode
                obj.errMsg = res.data
                debug.printServerStateCodeFail(obj)
              }
              that.step = 1
              that._errorConnect()
              if (that.statusCodeFailCallBack) {
                that.statusCodeFailCallBack(res.statusCode)
              }
            }
          },
          fail: function(res) {
            // 服务器连接失败
            if (debug) {
              obj = new Object()
              obj.path = "utils/server/token.js"
              obj.functionName = "getTokenFromServer"
              obj.errMsg = res
              debug.printServerFail(obj)
            }
            that.step = 1
            that._errorConnect()
            if (that.failCallBack) {
              that.failCallBack(res)
            }
          }
        })
      },
      fail: function(res) {
        // wx.login 执行失败
        if (debug) {
          obj = new Object()
          obj.path = "utils/server/token.js"
          obj.functionName = "getTokenFromServer()"
          obj.type = "微信用户登录失败"
          obj.errMsg = "执行函数 wx.login 失败，错误原因:\n" + res
          debug.printError(obj)
        }
        that.step = 1
        that._errorConnect()
        if (that.failCallBack) {
          that.failCallBack(res)
        }
      }
    })
  }

  /**
   * (*内部函数)
   * [连接服务器错误时的提示]
   */
  _errorConnect() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '用户身份校检失败，你可能处于离线模式，请检查网络连接是否正确后重新尝试操作',
      showCancel: that.isRetry ? true : false,
      confirmColor: '#04838e',
      confirmText: that.isRetry ? "重试" : "确定",
      success(res) {
        if (res.confirm && that.retryTime != -1) {
          --that.isRetry
          if (that.step == 0) {
            that._veirfyFromServer()
          } else if (that.step == 1) {
            that.getTokenFromServer()
          }
        } else {
          if (retryFailCallBack) {
            that.retryFailCallBack()
          }
        }
      }
    })
  }
}

export {
  Token
};