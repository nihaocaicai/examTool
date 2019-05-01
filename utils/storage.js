import {
  Debug
} from "debug.js"

var debug = new Debug()
var thisClass = this //转义 this，防止 this 歧义

/**
 * 微信缓存保存类
 */
class Storage {

  constructor() {
    /* 转义this */
    thisClass = this

    /* 其它参数 */
    this.saveType = undefined //保存类型(不显示对话框，设置没有意义；如果发生错误，设置的值会在对话框中提示，例如“保存个人信息”)
    this.failInfo = undefined //保存错误信息
    this.showRetryModel = false //默认不显示对话框

    /* 回调函数 */
    this.showRetryModal = false //显示重试对话框，默认为不显示(设置了两个重试回调函数也会显示)
    this.successCallBack = undefined //保存成功回调函数，无返回值
    this.failCallBack = undefined //保存失败回调函数，返回保存失败的值和错误信息(obj = {key: data, errMsg: 保存错误信息})
    this.retryCallBack = undefined //保存失败重试回调函数
    this.retryCancelCallBack = undefined //重试取消回调函数
  }

  /**
   * [设置保存错误信息]
   * {path, functionName}
   * (文件完整路径，函数名称)
   */
  setFailInfo(path, functionName) {
    if (path && functionName) {
      thisClass.failInfo = new Object()
      thisClass.failInfo.path = path
      thisClass.failInfo.functionName = functionName
    }
  }

  /**
    * [设置保存类型]
    * (不显示对话框，设置没有意义)
    如果发生错误，设置的值会在对话框中提示，例如“保存个人信息”
    */
  setSaveType(saveType) {
    if (saveType)
      this.saveType = saveType
  }


  /**
   * [保存信息到微信的缓存]
   */
  save(key, data) {
    try {
      wx.setStorageSync(key, data)
      if (thisClass.successCallBack)
        thisClass.successCallBack()
    } catch (e) {
      if (thisClass.failInfo) {
        thisClass.failInfo.errMsg = e
        debug.printStorageError(thisClass.failInfo)
      }
      thisClass._saveErrorDialog()
      if (thisClass.failCallBack) {
        var obj = new Object()
        obj[key] = data
        obj['errMsg'] = e
        thisClass.failCallBack(obj)
      }
    }
  }

  /**
   * [批量保存列表]
   * saveList = [{key, data}]
   */
  setSaveList(saveList) {
    if (saveList)
      thisClass.list = saveList
  }

  /**
   * [批量保存列表中的信息到微信缓存]
   */
  saveList() {
    if (thisClass.list) {
      while (thisClass.list.length != 0) {
        try {
          wx.setStorageSync(thisClass.list[0].key, thisClass.list[0].data)
          thisClass.list.splice(0, 1)
        } catch (e) {
          if (thisClass.failInfo) {
            thisClass.failInfo.errMsg = e
            debug.printStorageError(thisClass.failInfo)
          }
          thisClass._saveErrorDialog()
          if (thisClass.failCallBack) {
            var obj = new Object()
            obj[thisClass.list[0].key] = thisClass.list[0].data
            obj['errMsg'] = e
            thisClass.failCallBack(obj)
          }
        }
      }
      if (thisClass.successCallBack)
        thisClass.successCallBack()
    }
  }

  /**
   * (*内部函数)
   * [保存失败提示框]
   */
  _saveErrorDialog() {
    if (thisClass.showRetryModal || thisClass.retryCallBack || thisClass.retryCancelCallBack) {
      var thisClass = thisClass
      var content = thisClass.saveType ? "存储" : "保存" + thisClass.saveType
      content += '失败，可能是手机空间不足，请清理一下手机空间后重试'
      wx.showModal({
        title: '提示',
        content: content,
        showCancel: thisClass.retryCallBack && thisClass.retryCancelCallBack ? true : false,
        confirmText: thisClass.retryCallBack ? "重试" : "确定",
        confirmColor: "#04838e",
        success: function(res) {
          if (res.confirm && thisClass.retryCallBack) {
            thisClass.retryCallBack()
          } else if (res.cancel && thisClass.retryCancelCallBack) {
            thisClass.retryCancelCallBack()
          }
        }
      })
    }
  }
}

export {
  Storage
}