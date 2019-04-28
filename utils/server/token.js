/**
 * 有关 token 的操作类
 */

//导入 后台错误信息输出 支持类
import {
  Debug
}
from "debug.js"
var debug = new Debug()

class Token {
  constructor() {
    //导入获取token的接口配置
    var base = require("interface.js") //地址配置表
    this.getTokenUrl = base.url + base.interface.getToken
    this.verifyTokenUrl = base.url + base.interface.verifyToken
  }

  //验证 token，外部调用
  verifyToken(successCallBack, failCallBack) {
    var token = wx.getStorageSync('token')
    if (token) {
      //有 token，从服务器验证是否正确
      this._veirfyFromServer(token, successCallBack, failCallBack)
    } else {
      //没有 token
      this.getTokenFromServer(successCallBack, failCallBack)
    }
  }

  //从服务器验证 token，内部函数
  _veirfyFromServer(token, successCallBack, failCallBack) {
    var that = this;
    wx.request({
      url: that.verifyTokenUrl,
      method: 'POST',
      data: {
        token: token
      },
      success: function(res) {
        if (res.statusCode == 200) {
          //服务返回 statusCode 正确
          var isVaildFlag = "isValid" //返回值中表明 token 是否正确的标签名(等待重设)
          if (res.data[isVaildFlag]) {
            //如果验证正确，且存在验证成功后的回调函数，则执行回调函数
            if (successCallBack) {
              successCallBack()
            }
          } else {
            //如果不正确，重新获取
            that.getTokenFromServer(successCallBack, failCallBack)
          }
        } else {
          //服务返回 statusCode 不正确
          obj = new Object()
          obj.type = "网络连接_服务器错误"
          obj.path = "utils/server/token.js"
          obj.functionName = "_veirfyFromServer"
          obj.errMsg = "服务器返回 StatusCode: " + res.statusCode
          debug.printError(obj)
          this._errorConnect(failCallBack)
        }
      },
      fail: function(res) {
        // 服务器连接失败
        obj = new Object()
        obj.type = "网络连接_服务器连接失败"
        obj.path = "utils/server/token.js"
        obj.functionName = "_veirfyFromServer"
        obj.errMsg = "服务器连接失败，错误原因:\n" + res
        debug.printError(obj)
        this._errorConnect(failCallBack)
      }
    })
  }

  //从服务器获取 token 
  getTokenFromServer(successCallBack, failCallBack) {
    var that = this;
    wx.login({
      success: function(res) {
        //获取用户 code 成功，请求 token
        wx.request({
          url: that.getTokenUrl,
          method: 'POST',
          data: {
            code: res.code
          },
          success: function(res) {
            try {
              wx.setStorageSync('token', res.data.token)
              //如果存在回调函数，就执行
              if (successCallBack) {
                successCallBack()
              }
            } catch (e) {
              //还没写好！
            }
          },
          fail: function(res) {
            // 服务器连接失败
            obj = new Object()
            obj.type = "网络连接_服务器连接失败"
            obj.path = "utils/server/token.js"
            obj.functionName = "getTokenFromServer"
            obj.errMsg = "服务器连接失败，错误原因:\n" + res
            debug.printError(obj)
            this._errorConnect(failCallBack)
          }
        })
      },
      fail: function(res) {
        // wx.login 执行失败
        obj = new Object()
        obj.type = "微信用户登录失败"
        obj.path = "utils/server/token.js"
        obj.functionName = "getTokenFromServer"
        obj.errMsg = "执行函数 wx.login 失败，错误原因:\n" + res
        debug.printError(obj)
        this._errorConnect(failCallBack)
      }
    })
  }

  //连接服务器错误时的提示
  _errorConnect(failCallBack) {
    wx.showModal({
      title: '提示',
      content: '用户身份校检失败，你可能处于离线模式，请检查网络连接是否正确后重新尝试操作',
      showCancel: 'false',
      confirmColor: '#04838e',
      success(res) {
        if (res.confirm && errorCallBack) {
          //如果有回调函数，就执行回调函数
          errorCallBack()
        }
      }
    })
  }
}

export {
  Token
};