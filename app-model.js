import {
  Request
} from "utils/server/request.js"

import {
  Debug
} from "utils/debug.js"

import {
  Storage
} from "utils/storage.js"

import {
  Token
} from "utils/server/token.js"

var debug = new Debug()
var thisClass = this

/**
 * app 登录模块
 * 只负责获取和处理 userInfo 和 openid
 */
class Login {
  constructor() {
    thisClass = this
  }

  setApp(app) {
    thisClass.app = app
  }

  //获取授权操作
  getAuthorize() {
    if (wx.getStorageSync('logout')) {
      //执行过登出操作，提示需要删除小程序后再添加
      thisClass.needDeleteApp()
    } else if (wx.getStorageSync('wx_user_info') != "") {
      //如果缓存有数据，检查基本信息是否更改了
      thisClass.checkForChanges()
    } else {
      // 如果缓存没有数据，重新授权
      if (wx.canIUse('button.open-type.getUserInfo')) {
        wx.getSetting({
          // 微信新版本，查看用户是否授权过
          success: function(res) {
            if (res.authSetting['scope.userInfo'])
              thisClass.getUserInfo() //授权过，获取用户信息
            else
              thisClass.needAuthorize() //没有授权，需要用户点击按钮授
          },
          fail: function(res) {
            debug.printErrors("app-model.js", "getAuthorize", "获取用户设置 (wx.getSetting) 错误", res)
            thisClass.getInfoFail()
          }
        })
      } else {
        thisClass.getUserInfo() //微信旧版本，在没有 open-type=getUserInfo 版本的兼容处理
      }
    }
  }

  //告诉 login 需要授权
  needAuthorize() {
    var timeOut = 10;
    var interval = setInterval(function() {
      if (--timeOut != 0) {
        //未授权的回调函数
        try {
          if (thisClass.app.needAuthorizeCallback && timeOut != 0) {
            clearInterval(interval)
            thisClass.app.needAuthorizeCallback()
          }
        } catch (e) {
          //捕获回调函数时候的错误
          debug.printErrors("app-model.js", "needAuthorize", "执行回调函数失败", e)
          thisClass.getInfoFail()
        }
      } else {
        //超时还没有准备好回调函数，只能提示获取信息失败
        clearInterval(interval)
        debug.printErrors("app-model.js", "needAuthorize", "回调函数设置失败", "需要授权回调函数设置")
        thisClass.getInfoFail()
      }
    }, 1000)
  }

  //检查基本信息是否更改了
  checkForChanges() {
    wx.getUserInfo({
      lang: "zh_CN",
      success: res => {
        var cache = wx.getStorageSync("wx_user_info")
        res.userInfo.gender = res.userInfo.gender == 1 ? "男" : "女"
        res.userInfo.city = res.userInfo.province + " " + res.userInfo.city
        var nickNameFlag = cache['user_name'] != res.userInfo.nickName //昵称更改过标签
        var avatarUrlFlag = cache['user_avatar'] != res.userInfo.avatarUrl //用户更改过头像
        var genderFlag = cache['user_gender'] != res.userInfo.gender //性别更改过标签
        var cityFlag = cache['user_city'] != res.userInfo.city //城市更改过标签
        var changedFlag = false

        //传递的参数
        var data = new Object()
        if (nickNameFlag) {
          //昵称更改过
          data.user_name = res.userInfo.nickName
          changedFlag = true
        }
        if (avatarUrlFlag) {
          //用户更改过
          data.user_avatar = res.userInfo.avatarUrl
          changedFlag = true
        }
        if (genderFlag) {
          //性别更改过
          data.user_gender = res.userInfo.gender
          changedFlag = true
        }
        if (cityFlag) {
          //城市更改过
          data.user_city = res.userInfo.city
          changedFlag = true
        }
        if (changedFlag) {
          //更改过信息，尝试更改服务器上的信息
          var r = new Request()
          r.interface = "modifyInfo"
          r.data = data
          r.successCallBack = function(res) {
            if (nickNameFlag)
              //昵称更改过
              cache['user_name'] = res.userInfo.nickName
            if (avatarUrlFlag)
              //用户更改过
              cache['user_avatar'] = res.userInfo.avatarUrl
            if (genderFlag)
              //性别更改过
              cache['user_gender'] = res.userInfo.gender
            if (cityFlag)
              //城市更改过
              cache['user_city'] = res.userInfo.city

            var storage = new Storage() //添加存储能力
            storage.successCallBack = thisClass.userInfoIsReady //保存成功
            storage.failCallBack = thisClass.userInfoIsReady //保存失败，下次再检查
            storage.setFailInfo('app-model.js', "checkForChanges")
            storage.save("wx_user_info", cache)
          }
          r.statusCodeFailCallBack = thisClass.userInfoIsReady //请求失败，下次再检查
          r.failCallBack = thisClass.userInfoIsReady //请求失败，下次再检查
          r.setFailInfo('app-model.js', "checkForChanges")
          r.request()
        } else {
          //没有更改过，直接跳转
          thisClass.userInfoIsReady()
        }
      },
      fail: res => {
        //获取失败，下次再检查
        debug.printWxGetUserInfoError("app-model.js", "checkForChanges", res)
        thisClass.userInfoIsReady()
      }
    })
  }

  //微信的 getUserInfo 函数整合
  getUserInfo() {
    wx.getUserInfo({
      lang: "zh_CN",
      success: res => {
        thisClass.processUserInfo(res)
      },
      fail: res => {
        debug.printWxGetUserInfoError("app-model.js", "getUserInfo", res)
        thisClass.getInfoFail()
      }
    })
  }

  //成功获取微信用户信息后对用户信息的操作
  processUserInfo(rawUserInfo) {
    var userInfo = new Object()
    userInfo.user_name = rawUserInfo.userInfo.nickName
    userInfo.user_avatar = rawUserInfo.userInfo.avatarUrl
    userInfo.user_gender = rawUserInfo.userInfo.gender == 1 ? "男" : "女"
    userInfo.user_city = rawUserInfo.userInfo.province + " " + rawUserInfo.userInfo.city

    var token = new Token() //获取 token
    token.successCallBack = function() {
      var storage = new Storage() //添加存储能力
      storage.successCallBack = thisClass.userInfoIsReady
      storage.failCallBack = thisClass.getInfoFail
      storage.setFailInfo('app-model.js', "processUserInfo")
      storage.save('wx_user_info', userInfo)
    }
    token.statusCodeFailCallBack = thisClass.getInfoFail
    token.failCallBack = thisClass.getInfoFail
    token.getTokenFromServer()
  }

  //数据保存成功后，执行回调函数，告诉 login 信息获取成功
  userInfoIsReady() {
    var timeOut = 10;
    var interval = setInterval(function() {
      if (--timeOut != 0) {
        try {
          if (thisClass.app.userInfoReadyCallback && timeOut != 0) {
            //执行回调函数，告诉 login 信息已经获取完了
            clearInterval(interval)
            thisClass.app.userInfoReadyCallback()
          }
        } catch (e) {
          //捕获回调函数时候的错误
          debug.printErrors("app-model.js", "userInfoIsReady", "执行回调函数失败", e)
          thisClass.getInfoFail()
        }
      } else {
        //超时还没有准备好回调函数，只能提示获取信息失败
        clearInterval(interval)
        debug.printErrors("app-model.js", "userInfoIsReady", "回调函数设置失败", "UserInfo 数据获取完成回调函数设置失败")
        thisClass.getInfoFail()
      }
    }, 1000)
  }

  //获取信息失败
  getInfoFail() {
    wx.showModal({
      title: '提示',
      content: '获取信息失败。请检查网络连接后，点击确定重启程序重试',
      confirmColor: '#04838e',
      showCancel: false,
      success: function() {
        thisClass.reLunchApp()
      }
    })
  }

  //重启小程序
  reLunchApp() {
    wx.reLaunch({
      url: '/pages/login/login',
    })
    thisClass.getAuthorize()
  }

  //需要在小程序中删除程序
  needDeleteApp() {
    var timeOut = 10;
    var interval = setInterval(function() {
      if (--timeOut != 0) {
        //未授权的回调函数
        try {
          if (thisClass.app.needDeleteAppCallback && timeOut != 0) {
            clearInterval(interval)
            thisClass.app.needDeleteAppCallback()
          }
        } catch (e) {
          //捕获回调函数时候的错误
          debug.printErrors("app-model.js", "needDeleteApp", "执行回调函数失败", e)
          thisClass.getInfoFail()
        }
      } else {
        //超时还没有准备好回调函数，只能提示获取信息失败
        clearInterval(interval)
        debug.printErrors("app-model.js", "needDeleteApp", "回调函数设置失败", "需要删除小程序回调函数设置失败")
        wx.showModal({
          title: '提示',
          content: '当前微信账户执行过登出操作，需要在微信中删除本小程序后重新登录',
          showCancel: false,
        })
      }
    }, 1000)
  }
};

export {
  Login
};