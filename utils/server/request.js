import {
  Debug
} from "../debug.js"

import {
  Token
} from "token.js"

const debug = new Debug() //添加调试能力
const token = new Token() //添加检查 Token 的能力

const header = {
  //请求 header，可以根据情况添加，成员名必须与请求方式名称一致(例如GET、POST等)
  GET: {
    header: {
      'content-type': 'application/json'
    }
  },
  POST: {
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
  }
}

/**
 * 请求类
 */

class Request {
  constructor() {
    this.interface = undefined //接口名称(必填)
    this.data = new Object() //请求的参数(选填) [token 不需要单独设置，只传 token 可以为空]
    this.successCode = undefined //服务器返回成功码(选填)，不填使用默认值
    this.successCallBack = undefined //成功回调函数(必填)，返回成功获取到 res
    this.statusCodeFailCallBack = undefined //服务器内部错误回调函数(选填)，返回错误代码
    this.failCallBack = undefined //连接失败回调函数(选填)，返回错误信息 res
    this.failTips = undefined //请求失败后向用户提示的信息(选填)
    this.failInfo = undefined //供程序调试用的 fail object 信息，只需要 path, functionName, 定义见 utils/debug.js
    this.needToken = true //默认访问服务器时候需要携带 token , 可以设置为 false 禁止携带 token 参数
  }

  /**
   * [请求连接]
   */
  request() {
    if (this.interface == "getToken" || this.interface == "verifyToken") {
      //禁止直接获取和验证 token
      return
    }
    //检查参数是否设置正确
    if (this._checkPara()) {
      //连接之前需要检查 token 是否正确，之后再进行连接
      var fun = new Object()
      fun.successCallBack = this._connect()
      token.setCallBackFunction(fun)
      token.verifyToken()
    } else {
      if (this.failCallBack) {
        this.failCallBack()
      }
    }
  }

  /**
   * [设置错误信息]
   * {path, functionName}
   * (文件路径, 函数名称)
   */
  setFailInfo(path, functionName) {
    if (path && functionName) {
      this.failInfo = new Object()
      this.failInfo.path = path
      this.failInfo.functionName = functionName
    }
  }

  /**
   * (*内部调用*)
   * [检查参数是否设置正确]
   */
  _checkPara() {
    var obj = new Object()
    var path = this.failTips ? this.failTips.path : "util/server/request".js
    var functionName = this.failTips ? this.failTips.functionName : "_checkPara()"
    obj = {
      type: "方法参数调用不正确",
      path: path,
      functionName: functionName,
    }
    if (!this.interface) {
      obj.errMsg = "未填写接口"
      debug.printError(obj)
      return false
    }
    if (!this.data && !needToken) {
      obj.errMsg = "未填写接口"
      debug.printError(obj)
      return false
    }
    if (!this.successCallBack) {
      obj.errMsg = "未填写成功回调函数"
      debug.printError(obj)
      return false
    }
    return true
  }

  /**
   * (*内部调用*)
   * [请求连接]
   */
  _connect() {
    var that = this
    var i = require("interface.js")
    var method = i.interface[that.interface].method
    var successCode = that.successCode ? that.successCode : i.interface[that.interface].statusCode
    var data = this.data
    if (this.needToken) {
      data.token = wx.getStorageSync("token")
    }
    wx.request({
      url: i.url + i.interface[that.interface].url,
      method: method,
      data: data,
      header: header[method].header,
      success: function(res) {
        if (res.statusCode == successCode) {
          /* 服务器连接正常 */
          if (that.successCallBack) {
            //执行成功回调函数
            that.successCallBack(res.data)
          }
        } else {
          /* 服务器内部错误 */
          if (that.failInfo) {
            //输出调试信息
            that.failInfo.code = res.statusCode
            that.failInfo.errMsg = res.data
            debug.printServerStateCodeFail(that.failInfo)
          }
          if (that.statusCodeFailCallBack) {
            //执行服务器内部错误回调函数
            that.statusCodeFailCallBack(res.statusCode)
          }
        }
      },
      fail: function(res) {
        //连接服务器出现问题
        if (that.failInfo) {
          //输出调试信息
          that.failInfo.errMsg = res //或者res.data,有待考究！！！！！
          debug.printServiceFail(that.failInfo)
        }
        if (that.statusCodeFailCallBack) {
          //执行连接失败回调函数
          that.statusCodeFailCallBack(res)
        }
      },
    })
  }

}
export {
  Request
}