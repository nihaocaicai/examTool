/**
 * 调试工具类
 * 上线服务器后可以将输出值清空，仅保留空函数
 */

class Debug {

  /**
   * [错误提示]
   * obj = {path, functionName, type, errMsg}
   * (文件完整路径，函数名称，错误类型，错误信息)
   */
  printError(obj) {
    var errMsgFlag = false
    if (obj) {
      var m = "---小程序执行发生错误---\n"
      if (obj.path) {
        m += "文件路径: " + obj.path
        m += "\n"
      }
      if (obj.functionName) {
        m += "函数名称: " + obj.functionName
        m += "\n"
      }
      if (obj.type) {
        m += "错误类型: " + obj.type
        m += "\n"
      }
      if (obj.errMsg) {
        //输出错误信息
        //分开输出，因为放不下这么多信息
        m += "错误信息如下:\n"
        errMsgFlag = true
      }
      console.log(m)
      if (errMsgFlag)
        console.log(obj.errMsg)
    }
  }

  /**
   * [错误提示]
   * {path, functionName, type, errMsg}
   * (文件完整路径，函数名称，错误类型，错误信息)
   */
  printErrors(path, functionName, type, errMsg) {
    if (path && functionName && type && errMsg) {
      var obj = new Object()
      obj.path = path
      obj.functionName = functionName
      obj.type = type
      obj.errMsg = errMsg
      this.printError(obj)
    }
  }

  /**
   * [服务器返回代码错误提示]
   * {path, functionName, code, errMsg}
   * (文件完整路径，函数名称，服务器返回错误代码，网页返回错误提示信息)
   */
  printServerStateCodeFail(obj) {
    if (obj) {
      obj.type = "服务器返回代码错误"
      var t = "服务器错误代码:" + obj.statusCode + "\n"
      obj.errMsg = obj.errMsg? t + obj.errMsg : t
      this.printError(obj)
    }
  }

  /**
   * [服务器连接错误错误提示]
   * obj = {path, functionName, errMsg}
   * (文件完整路径，函数名称，服务器连接失败提示信息)
   */
  printServerFail(obj) {
    if (obj) {
      obj.type = "服务器连接失败"
      this.printError(obj)
    }
  }

  /**
   * [微信 wx.login 操作错误提示]
   * {path, functionName, errMsg}
   * (文件完整路径，函数名称，保存失败提示信息)
   */
  printWxLoginError(path, functionName, errMsg) {
    if (path && functionName && errMsg) {
      this.printErrors(path, functionName, "微信 wx.login 错误", errMsg)
    }
  }

  /**
   * [微信 wx.getUserInfo 操作错误提示]
   * {path, functionName, errMsg}
   * (文件完整路径，函数名称，保存失败提示信息)
   */
  printWxGetUserInfoError(path, functionName, errMsg) {
    if (path && functionName && errMsg) {
      this.printErrors(path, functionName, "微信 wx.getUserInfo 错误", errMsg)
    }
  }

  /**
   * [微信缓存操作错误提示]
   * obj = {path, functionName, errMsg}
   * (文件完整路径，函数名称，保存失败提示信息)
   */
  printStorageError(obj) {
    if (obj) {
      obj.type = "微信保存缓存错误"
      this.printError(obj)
    }
  }
}

export {
  Debug
}