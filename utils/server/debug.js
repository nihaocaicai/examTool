//输出错误信息类

class Debug {
  printError(obj) {
    //obj 包含以下信息
    //type, path, functionName, errMsg
    //错误类型，文件完整路径，函数名称，错误信息
    //所有参数均为选填，上线服务器后可以将输出值清空，仅保留空函数
    var m = "---小程序发生执行错误---"
    if (obj.type) {
      m += "错误类型: " + obj.type
      m += "\n"
    }
    if (obj.path) {
      m += "文件路径: " + obj.path
      m += "\n"
    }
    if (obj.functionName) {
      m += "函数名称: " + obj.functionName
      m += "\n"
    }
    if (obj.errMsg) {
      m += "错误信息: " + obj.errMsg
      m += "\n"
    }
    //输出错误信息
    console.log(m)
  }
}

export {
  Debug
}