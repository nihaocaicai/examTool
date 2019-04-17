//app 登录模块
//只负责获取和处理 userInfo 和 openid
var testData = require("../data/testData.js")
class Login {
  //获取授权; that 指 getApp()
  getAuthorize(that) {
    var login = this
    var timeOut = 10 //回调函数设置超时阈值
    //检查版本
    if (wx.canIUse('button.open-type.getUserInfo')) {
      // 版本支持，查看用户是否授权过
      wx.getSetting({
        success: function(res) {
          if (res.authSetting['scope.userInfo']) {
            //授权过，可以直接使用
            wx.getUserInfo({
              lang: "zh_CN",
              success: function(res) {
                login.gotUserInfo(that, res.userInfo)
                login.getOpenID() //获取用户 openid
                while (--timeOut != 0) {
                  if (that.userInfoReadyCallback) { //回调函数
                    that.userInfoReadyCallback(false)
                    break
                  }
                }
                //回调函数设置超时重启程序
                if (timeOut == 0) {
                  wx.reLaunch({
                    url: '/pages/login/login',
                  })
                }
              }
            })
          } else {
            var i = 10
            //如果未授权，将在 login 页面授权
            while (--timeOut != 0) {
              if (that.needAuthorizeCallback) { //回调函数
                that.needAuthorizeCallback()
                break
              }
            }
            //回调函数设置超时重启程序
            if (timeOut == 0) {
              wx.reLaunch({
                url: '/pages/login/login',
              })
            }
          }
        }
      })
    } else {
      //微信版本太低，在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        lang: "zh_CN",
        success: res => {
          login.gotUserInfo(that, res.userInfo)
          login.getOpenID() //获取用户 openid
          while (--timeOut != 0) {
            if (that.userInfoReadyCallback) { //回调函数
              that.userInfoReadyCallback(true)
              break
            }
          }
          //回调函数设置超时重启程序
          if (timeOut == 0) {
            wx.reLaunch({
              url: '/pages/login/login',
            })
          }
        }
      })
    }
  }

  //成功获取微信用户信息后对用户信息的操作; that 指 getApp()
  gotUserInfo(that, userInfo) {
    that.globalData.userInfo = userInfo
    that.globalData.userInfo['gender'] = (that.globalData.userInfo['gender'] == 1 ? "男" : "女")
  }

  // 获取用户 openid; that 指 getApp()
  getOpenID(that) {
    console.log("模拟获取用户 openid")
  }
};

export {
  Login
};