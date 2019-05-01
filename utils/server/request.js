import {
  Debug
} from "../debug.js"

import {
  Token
} from "token.js"

var debug = new Debug() //添加调试能力
var thisClass = this //转义 this，防止 this 歧义

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
    /* 转义 this */
    thisClass = this

    /* 其它参数 */
    this.interface = undefined //接口名称(必填)
    this.needToken = true //默认访问服务器时候需要携带 token , 可以设置为 false 禁止携带 token 参数
    this.data = undefined //请求的参数(选填) [token 不需要单独设置，只传 token 可以为空]
    this.successCode = undefined //服务器返回成功码(选填)，不填使用默认值
    this.failTips = undefined //请求失败后向用户提示的信息(选填)
    this.failInfo = undefined //供程序调试用的 fail object 信息，只需要 path, functionName, 定义见 utils/debug.js

    /* 回调函数表 */
    this.successCallBack = undefined //检查成功回调函数(选填)，返回成功获取到的值(res.data)
    this.statusCodeFailCallBack = undefined //服务器内部错误回调函数(选填)，返回服务器错误代码(res.statusCode)
    this.resCallBack = undefined // 服务器获取到信息回调函数(选填)，返回 res
    this.failCallBack = undefined //连接失败回调函数(选填)，返回错误信息(res)
  }

  /**
   * [设置错误信息]
   * {path, functionName}
   * (文件路径, 函数名称)
   */
  setFailInfo(path, functionName) {
    if (path && functionName) {
      thisClass.failInfo = new Object()
      thisClass.failInfo.path = path
      thisClass.failInfo.functionName = functionName
    }
  }

  /**
   * [请求连接]
   */
  request() {
    if (thisClass.interface == "getToken" || thisClass.interface == "verifyToken") {
      //禁止直接获取和验证 token
      var obj = new Object()
      if (!obj.path)
        obj.path = "utils/server/request.js"
      if (!obj.functionName)
        obj.functionName = "request"
      obj.type = "请求错误"
      obj.errMsg = "不能直接调用" + thisClass.interface + "接口"
      debug.printError(obj)
      if (thisClass.failCallBack)
        thisClass.failCallBack("不能直接调用" + thisClass.interface + "接口")
    }
    //检查参数是否设置正确
    if (thisClass._checkPara()) {
      //连接之前需要检查 token 是否正确，之后再进行连接
      var token = new Token() //添加检查 Token 的能力
      token.successCallBack = thisClass._connect
      token.statusCodeFailCallBack = thisClass.statusCodeFailCallBack
      token.failCallBack = thisClass.failCallBack
      token.verifyToken()
    } else {
      if (thisClass.failCallBack)
        thisClass.failCallBack("请求参数不正确")
    }
  }

  /**
   * (*内部调用*)
   * [检查参数是否设置正确]
   */
  _checkPara() {
    var obj = new Object()
    obj.path = thisClass.failInfo ? thisClass.failInfo.path : "util/server/request".js
    obj.functionName = thisClass.failInfo ? thisClass.failInfo.functionName : "_checkPara"
    obj.type = "方法参数调用不正确"
    if (!thisClass.interface) {
      obj.errMsg = "未填写接口"
      debug.printError(obj)
      return false
    }
    if (!thisClass.data && !thisClass.needToken) {
      obj.errMsg = "未填写接口"
      debug.printError(obj)
      return false
    }
    if (!thisClass.successCallBack) {
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
    var i = require("interface.js")
    var method = i.interface[thisClass.interface].method
    var successCode = thisClass.successCode ? thisClass.successCode : i.interface[thisClass.interface].statusCode

    // 检查是否有 data
    var data = thisClass.data
    if (!data) {
      //没有 data
      data = new Object()
    }
    if (thisClass.needToken)
      data.token = wx.getStorageSync("token")

    wx.request({
      url: i.url + i.interface[thisClass.interface].url,
      method: method,
      data: data,
      header: header[method].header,
      success: function(res) {
        if (res.statusCode == successCode) {
          /* 服务器连接正常 */
          if (thisClass.resCallBack)
            thisClass.resCallBack(res)
          if (thisClass.successCallBack)
            thisClass.successCallBack(res.data)
        } else {
          /* 服务器内部错误 */
          if (thisClass.failInfo) {
            //输出调试信息
            thisClass.failInfo.code = res.statusCode
            thisClass.failInfo.errMsg = res.data
            debug.printServerStatusCodeFail(thisClass.failInfo)
          }
          if (thisClass.resCallBack)
            thisClass.resCallBack(res)
          if (thisClass.statusCodeFailCallBack) {
            thisClass.statusCodeFailCallBack(res.statusCode)
          }
        }
      },
      fail: function(res) {
        //连接服务器出现问题
        if (thisClass.failInfo) {
          thisClass.failInfo.errMsg = res
          debug.printServerFail(thisClass.failInfo)
        }
        if (thisClass.statusCodeFailCallBack) {
          thisClass.statusCodeFailCallBack(res)
        }
      },
    })
  }

}
export {
  Request
}