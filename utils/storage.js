import {
  Debug
} from "debug.js"
const debug = new Debug()

/**
 * 微信缓存保存封装类
 */
class Storage {

  constructor() {
    this.successCallBack = undefined //保存成功回调函数
    this.failCallBack = undefined //保存失败回调函数
    this.retryCallBack = undefined //保存失败重试回调函数
    this.retryCancelCallBack = undefined //重试取消回调函数
    this.saveType = undefined //保存类型 (不显示对话框，设置没有意义)
    this.failInfo = undefined //保存错误信息
    this.showRetryModel = false //默认不显示对话框
  }

  /**
   * [设置保存成功回调函数]
   */
  setSuccessCallBack(successCallBack) {
    this.successCallBack = successCallBack
  }

  /**
   * [设置保存失败回调函数]
   */
  setFailCallBack(failCallBack) {
    this.failCallBack = failCallBack
  }

  /**
   * [设置保存失败重试回调函数]
   * 如果设置重试回调函数，则提示框会显示重试按钮，否则则不显示
   */
  setRetryCallBack(retryCallBack) {
    this.retryCallBack = retryCallBack
  }

  /**
   * [设置保存失败重试取消回调函数]
   * 如果设置重试回调函数，则提示框会显示重试按钮，否则则不显示
   */
  setRetryCancelCallBack(retryCancelCallBack) {
    this.retryCancelCallBack = retryCancelCallBack
  }

  /**
   * [设置保存类型]
   * 如果发生错误，设置的值会在对话框中提示，例如“保存个人信息”
   */
  setSaveType(saveType) {
    this.saveType = saveType
  }

  /**
   * [设置保存错误信息]
   * {path, functionName}
   * (文件完整路径，函数名称)
   */
  setFailInfo(path, functionName) {
    if (path && functionName) {
      this.failInfo = new Object()
      this.failInfo.path = path
      this.failInfo.functionName = functionName
    }
  }

  /**
   * [保存信息到微信的缓存]
   */
  save(key, data) {
    try {
      wx.setStorageSync(key, data)
      if (this.successCallBack) {
        this.successCallBack()
      }
    } catch (e) {
      if (this.failInfo) {
        this.failInfo.errMsg = e
        debug.printStorageError(this.failInfo)
      }
      this._saveErrorDialog()
      if (that.failCallBack) {
        that.failCallBack()
      }
    }
  }

  /**
   * [设置要批量保存到微信缓存的信息]
   * saveList = [{key,data}]
   */
  setSaveList(saveList) {
    this.saveList = saveList
  }

  /**
   * [批量保存列表中的信息到微信缓存]
   */
  saveList() {
    if (this.saveList) {
      while (this.saveList.length != 0) {
        try {
          wx.setStorageSync(this.saveList[0].key, this.saveList[0].data)
          this.saveList.splice(0, 1)
        } catch (e) {
          if (this.failInfo) {
            this.failInfo.errMsg = e
            debug.printStorageError(this.failInfo)
          }
          this._saveErrorDialog()
          if (that.failCallBack) {
            that.failCallBack()
          }
        }
      }
      if (this.successCallBack) {
        this.successCallBack()
      }
    }
  }

  /**
   * (*内部函数)
   * [保存失败提示框]
   */
  _saveErrorDialog() {
    if (this.showRetryModal || that.retryCallBack || that.retryCallBack) {
      var that = this
      var content = that.saveType ? "存储" : "保存" + that.saveType
      content += '失败，可能是手机空间不足，请清理一下手机空间后重试'
      wx.showModal({
        title: '提示',
        content: content,
        showCancel: that.retryCallBack || that.retryCallBack ? true : false,
        confirmText: that.retryCallBack || that.retryCallBack ? "重试" : "确定",
        confirmColor: "#04838e",
        success: function(res) {
          if (res.confirm && that.retryCallBack) {
            that.retryCallBack()
          } else if (res.cancel && that.retryCancelCallBack) {
            that.retryCancelCallBack()
          }
        }
      })
    }
  }
}

export {
  Storage
}