import {
  Debug
}
from "../debug.js"

import {
  Storage
} from "../storage.js"

var debug = new Debug() // 导入调试能力
var base = require("interface.js") //地址配置表
var thisClass = this //转义 this，防止 this 歧义

/**
 * token 操作类
 */
class Token {
  constructor() {
    /* 转义 this */
    thisClass = this

    /* 其它参数 */
    this.retryTime = 5 //重试次数限制,0表示不重试
    this.isRetry = !(this.retryTime == 0) //内部类，只需要更改 retryTime 的值即可
    this.showErrorConnectModal = true //是否显示重试对话框(选填)，默认值为显示

    /* 回调函数表 */
    //(*)表示推荐设置
    this.successCallBack = undefined //检查成功回调函数(选填)，返回成功获取到的值(res.data)(*)
    this.statusCodeFailCallBack = undefined //服务器内部错误回调函数(选填)，返回服务器错误代码(*)
    this.resCallBack = undefined // 服务器获取到信息回调函数(选填)，返回 res
    this.failCallBack = undefined //连接失败回调函数(选填)，返回错误信息(res)(*)
    this.retryCallBack = undefined //重试回调函数(选填)，在重试获取/验证之前回调
    this.retryFailCallBack = undefined //重试失败回调函数(选填)
    this.failCallBackReplaceRetryFailCallBack = true //是否要将连接失败回调函数充当重试失败回调函数，默认为是
  }

  /**
   * [设置重试次数]
   * {选填}
   * 默认为5次，推荐使用这个方法设置重试次数
   */
  setRetryTime(retryTime) {
    thisClass.retryTime = retryTime
    thisClass.isRetry = !(thisClass.retryTime == 0)
  }

  /**
   * [验证 token]
   * isRetry: 是否开启重试操作
   */
  verifyToken() {
    thisClass.token = wx.getStorageSync('token')
    if (thisClass.token) {
      //有 token，从服务器验证是否正确
      /* 为了测试，关闭这个接口thisClass._veirfyFromServer()*/
      thisClass.getTokenFromServer() //调试用，正式使用需要打开
    } else {
      //没有 token
      thisClass.getTokenFromServer()
    }
  }

  /**
   * (*内部调用)
   * [从服务器验证 token]
   */
  _veirfyFromServer() {
    var isVaildFlag = "isValid" //返回值中表明 token 正确的标签名(等待重设)
    wx.request({
      url: base.url + base.interface.verifyToken.url,
      method: base.interface.verifyToken.method,
      data: {
        token: thisClass.token
      },
      success: function(res) {
        if (res.statusCode == base.interface.verifyToken.statusCode) {
          if (res.data[isVaildFlag]) {
            if (thisClass.resCallBack)
              thisClass.resCallBack(res)
            if (thisClass.successCallBack)
              thisClass.successCallBack(res.data)
          } else {
            thisClass.getTokenFromServer()
          }
        } else {
          obj = new Object()
          obj.path = "utils/server/token.js"
          obj.functionName = "_veirfyFromServer"
          obj.statusCode = res.statusCode
          obj.errMsg = res.data
          debug.printServerStateCodeFail(obj)
          thisClass.step = 0
          thisClass._errorConnect()
          if (thisClass.resCallBack)
            thisClass.resCallBack(res)
          if (thisClass.statusCodeFailCallBack)
            thisClass.statusCodeFailCallBack(res.statusCode)
        }
      },
      fail: function(res) {
        if (debug) {
          obj = new Object()
          obj.path = "utils/server/token.js"
          obj.functionName = "_veirfyFromServer"
          obj.errMsg = res
          debug.printServerFail(obj)
        }
        thisClass.step = 0
        thisClass._errorConnect()
        if (thisClass.failCallBack)
          thisClass.failCallBack(res)
      }
    })
  }

  /**
   * [从服务器获取 token]
   */
  getTokenFromServer() {
    wx.login({
      success: function(l) {
        wx.request({
          url: base.url + base.interface.getToken.url,
          method: base.interface.getToken.method,
          data: {
            code: l.code
          },
          success: function(res) {
            if (res.statusCode == base.interface.getToken.statusCode) {
              /* 成功获取 */
              var storage = new Storage()
              storage.setSaveType("用户验证信息")
              storage.successCallBack = function() {
                if (thisClass.resCallBack)
                  thisClass.resCallBack(res)
                if (thisClass.successCallBack)
                  thisClass.successCallBack(res.data)
              }
              //开启调试，则设置调试信息
              var obj = new Object()
              obj.path = "utils/server/token.js"
              obj.functionName = "getTokenFromServer"
              storage.setFailInfo(obj)
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
              thisClass.step = 1
              thisClass._errorConnect()
              if (thisClass.resCallBack)
                thisClass.resCallBack(res)
              if (thisClass.statusCodeFailCallBack) {
                thisClass.statusCodeFailCallBack(res.statusCode)
              }
            }
          },
          fail: function(res) {
            // 服务器连接失败
            if (debug) {
              var obj = new Object()
              obj.path = "utils/server/token.js"
              obj.functionName = "getTokenFromServer"
              obj.errMsg = res
              debug.printServerFail(obj)
            }
            thisClass.step = 1
            thisClass._errorConnect()
            if (thisClass.failCallBack) {
              thisClass.failCallBack(res)
            }
          }
        })
      },
      fail: function(res) {
        // wx.login 执行失败
        debug.printWxLoginError("utils/server/token.js", "getTokenFromServer", res)
        thisClass.step = 1
        thisClass._errorConnect()
        if (thisClass.failCallBack) {
          thisClass.failCallBack(res)
        }
      }
    })
  }

  /**
   * (*内部函数)
   * [连接服务器错误时的提示]
   */
  _errorConnect() {
    if (thisClass.showErrorConnectModal)
      wx.showModal({
        title: '提示',
        content: '用户身份校检失败，你可能处于离线模式，请检查网络连接是否正确后重新尝试操作',
        showCancel: thisClass.isRetry ? true : false,
        confirmColor: '#04838e',
        confirmText: thisClass.isRetry ? "重试" : "确定",
        success(res) {
          if (res.confirm) {
            if (thisClass.isRetry) {
              //重试次数没用完，继续重试
              if (--thisClass.retryTime == 0)
                thisClass.isRetry = false
              if (thisClass.retryCallBack)
                thisClass.retryCallBack()
              if (thisClass.step == 0) {
                thisClass._veirfyFromServer()
              } else if (thisClass.step == 1) {
                thisClass.getTokenFromServer()
              }
            } else {
              //重试次数用完，调用回调函数
              if (thisClass.failCallBackReplaceRetryFailCallBack) {
                if (thisClass.failCallBack)
                  thisClass.failCallBack()
              } else if (thisClass.retryFailCallBack)
                thisClass.retryFailCallBack()
            }
          } else if (res.cancel) {
            //点击取消，调用回调函数
            if (thisClass.failCallBackReplaceRetryFailCallBack) {
              if (thisClass.failCallBack)
                thisClass.failCallBack()
            } else if (thisClass.retryFailCallBack)
              thisClass.retryFailCallBack()
          }
        }
      })
  }
}

export {
  Token
}