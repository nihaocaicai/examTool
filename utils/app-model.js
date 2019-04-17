//app 登录模块
//只负责获取和处理 userInfo 和 openid
var testData = require("../data/testData.js")

class Login {
  //获取授权; that 指 getApp()
  getAuthorize(that) {
    if (wx.getStorageSync('wx_user_info') != "") {
      //如果缓存有授权数据，则不需要发起授权申请
      var interval = setInterval(function() {
        if (that.userInfoReadyCallback) { //获取到 userInfo 的回调函数
          that.userInfoReadyCallback(false)
          clearInterval(interval)
        }
      }, 1000)
    } else {
      // 如果缓存没有数据，重新授权
      var login = this
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
                },
                fail: function(res) {
                  login.getInfoFail();
                }
              })
            } else {
              //如果未授权，将在 login 页面授权
              var interval = setInterval(function() {
                var timeOut = 10 //回调函数设置超时阈值
                if (--timeOut != 0) {
                  if (that.needAuthorizeCallback) { //未授权的回调函数
                    that.needAuthorizeCallback(false)
                    clearInterval(interval)
                  } else {
                    //回调函数设置超时重启程序
                    clearInterval(interval)
                    setTimeout(function() {
                      wx.reLaunch({
                        url: '/pages/login/login',
                      })
                    }, 1000)
                  }
                }
              }, 1000)
            }
          }
        })
      } else {
        //微信版本太低，在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          lang: "zh_CN",
          success: res => {
            login.gotUserInfo(that, res.userInfo)
          },
          fail: res => {
            login.getInfoFail();
          }
        })
      }
    }
  }

  //成功获取微信用户信息后对用户信息的操作
  //that 指 getApp()
  gotUserInfo(that, userInfo) {
    var login = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //获取 code 成功后，还需要向服务器查询获取openID
          var openid = "open_id"
          var info = new Object()
          var city = userInfo['province']
          city += ' '
          city += userInfo['city']
          info['open_id'] = openid
          info['user_name'] = userInfo['nickName']
          info['user_avatar'] = userInfo['avatarUrl']
          info['user_gender'] = userInfo['gender'] == 1 ? "男" : "女"
          info['user_city'] = city

          try {
            wx.setStorageSync('wx_user_info', info)
            setTimeout(function() {
              var interval = setInterval(function() {
                var timeOut = 10 //回调函数设置超时阈值
                if (--timeOut != 0) {
                  if (that.userInfoReadyCallback) { //获取到 userInfo 的回调函数
                    that.userInfoReadyCallback(false)
                    clearInterval(interval)
                  } else {
                    //回调函数设置超时重启程序
                    clearInterval(interval)
                    setTimeout(function() {
                      wx.reLaunch({
                        url: '/pages/login/login',
                      })
                    }, 1000)
                  }
                }
              }, 1000)
            }, 1000)
          } catch (e) {
            login.getInfoFail()
          }
        } else {
          //获取失败
        }
      }
    })
  }

  //获取信息失败
  getInfoFail() {
    wx.showModal({
      title: '提示',
      content: '获取信息失败，点击确定重启程序重试',
      success: function() {
        wx.reLaunch({
          url: '/pages/login/login',
        })
      }
    })
  }
};

export {
  Login
};