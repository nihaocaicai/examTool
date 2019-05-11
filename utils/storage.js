import {
  Debug
} from "debug.js"

var debug = new Debug()
var thisClass = undefined //转义 this

/**
 * 微信缓存保存类
 */
class Storage {
  constructor() {
    thisClass = this //转义 this
  }

  /**
   * [保存信息到微信的缓存]
   * 
   * key: 保存的键
   * 
   * data: 保存的值
   * 
   * success: 保存成功回调函数，无返回值
   * 
   * fail: 保存失败回调函数，返回保存失败的值和错误信息(obj = {key, data, errMsg})
   * 
   * showRetry: 是否要显示重试对话框
   * 
   * retry: 重试回调函数
   * 
   * retryCancel: 重试取消回调函数
   * 
   * saveType: 保存类型(不显示对话框，设置没有意义；如果发生错误，设置的值会在对话框中提示，例如“个人信息”)
   * 
   * path: 调用的函数文件路径
   * 
   * functionName: 调用的函数名
   */
  save(params) {
    //使用异步保存方式
    if (params) {
      wx.setStorage({
        key: params.key,
        data: params.data,
        success: function() {
          params.success && params.success()
        },
        fail: function(e) {
          thisClass._debug(0, {
            key: params.key,
            data: params.data instanceof Object ? JSON.stringify(params.data) : params.data,
            path: params.path,
            functionName: params.functionName,
            errMsg: e
          })
          params.showRetry && thisClass._saveErrorDialog({
            retry: thisClass.params.retry,
            retrySave: function() {
              thisClass.save(params)
            },
            retryCancel: params.retryCancel,
            saveType: params.saveType,
          })
          if (params.fail)
            params.fail({
              key: params.key,
              data: params.data,
              errMsg: e,
            })
        },
      })
    }
  }

  /**
   * [批量保存列表中的信息到微信缓存]
   * 
   * (如果不传参数，则尝试保存已有的键值对列表)
   * 
   * saveList: 要保存的键值对列表, saveList = [{key, data}]
   * 
   * success: 保存成功回调函数，无返回值
   * 
   * fail: 保存失败回调函数，返回保存失败的值和错误信息(obj = {key, data, errMsg})
   * 
   * retry: 重试回调函数
   *
   * retryCancel: 重试取消回调函数
   * 
   * saveType: 保存类型(不显示对话框，设置没有意义；如果发生错误，设置的值会在对话框中提示，例如“个人信息”)
   * 
   * path: 调用的函数文件路径
   * 
   * functionName: 调用的函数名
   */
  saveList(params) {
    if (params) {
      //保存键值对列表
      thisClass.params = params
      while (thisClass.params.saveList.length != 0) {
        try {
          //使用同步保存方式
          wx.setStorageSync(thisClass.params.saveList[0].key, thisClass.params.saveList[0].data)
          thisClass.params.saveList.splice(0, 1)
        } catch (e) {
          thisClass._debug(0, {
            key: thisClass.params.saveList[0].key,
            data: thisClass.params.saveList[0].data,
            path: thisClass.params.path,
            functionName: thisClass.params.functionName,
            errMsg: e
          })
          params.showRetry && thisClass._saveErrorDialog({
            retry: thisClass.params.retry,
            retrySave: function() {
              thisClass.saveList(thisClass.params)
            },
            retryCancel: thisClass.params.retryCancel,
            saveType: thisClass.params.saveType,
          })
          if (thisClass.params.fail)
            thisClass.params.fail({
              key: thisClass.params.key,
              data: thisClass.params.data,
              errMsg: e,
            })
        }
      }
      //列表保存完成
      thisClass.params = undefined
      params.success && params.success()
    } else {
      //尝试保存已有的键值对列表
      if (thisClass.params) {
        //存在列表，继续保存
        thisClass.saveList(thisClass.params)
      } else {
        //不存在列表，执行错误回调函数
        thisClass._debug(1)
      }
    }
  }

  /**
   * (*内部函数)
   * [保存失败提示框]
   */
  _saveErrorDialog(params) {
    if (params.retryCancel) {
      var content = params.saveType ? "存储" : "保存" + params.saveType
      content += '失败，可能是手机空间不足，请清理一下手机空间后重试'
      wx.showModal({
        title: '提示',
        content: content,
        showCancel: params.retryCancel,
        confirmText: "重试",
        confirmColor: "#04838e",
        success: function(res) {
          if (res.confirm && params.retry) {
            params.retry()
            params.retrySave()
          } else if (res.cancel && params.retryCancel) {
            params.retryCancel()
          }
        }
      })
    }
  }

  /**
   * (*内部函数)
   * [显示调试信息]
   */
  _debug(type, res) {
    var openDebug = true //是否要开启 debug
    if (openDebug) {
      if (type == 0) {
        // save 错误
        debug.printStorageError(res)
      } else if (type == 1) {
        // saveList 错误: 不存在列表
        debug.printStorageError({
          key: '无',
          data: '无',
          path: 'utils/storage.js',
          functionName: 'saveList',
          errMsg: '不能保存一个空的键值对列表'
        })
      }
    }
  }
}

export {
  Storage
}