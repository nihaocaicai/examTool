//app 登录模块
//只负责获取和处理 userInfo 和 openid

class Login {
  setApp(app) {
    this.app = app
  }

  //获取授权操作
  getAuthorize() {
    if (wx.getStorageSync('logout')) {
      //执行过登出操作，提示需要删除小程序后再添加
      this.needDeleteApp()
    } else if (wx.getStorageSync('wx_user_info') != "") {
      this.userInfoIsReady() //如果缓存有授权数据，则不需要发起授权申请
    } else {
      var login = this
      // 如果缓存没有数据，重新授权
      wx.login({
        success: res => {
          login.code = res.code
          if (wx.canIUse('button.open-type.getUserInfo')) {
            wx.getSetting({
              // 微信新版本，查看用户是否授权过
              success: function(res) {
                if (res.authSetting['scope.userInfo'])
                  login.getUserInfo() //授权过，获取用户信息
                else
                  login.needAuthorize() //没有授权，需要用户点击按钮授
              },
              fail: function(res) {
                login.getInfoFail(res);
              }
            })
          } else {
            login.getUserInfo() //微信旧版本，在没有 open-type=getUserInfo 版本的兼容处理
          }
        },
        fail: res => {
          login.getInfoFail(res)
        }
      })
    }
  }

  //告诉 login 需要授权
  needAuthorize() {
    var that = this
    var timeOut = 10;
    var interval = setInterval(function() {
      if (--timeOut != 0) {
        //未授权的回调函数
        try {
          if (that.app.needAuthorizeCallback && timeOut != 0) {
            clearInterval(interval)
            that.app.needAuthorizeCallback()
          }
        } catch (e) {
          //捕获回调函数时候的错误
        }
      } else {
        //超时还没有准备好回调函数，只能提示获取信息失败
        clearInterval(interval)
        that.getInfoFail("需要授权回调函数设置失败\n在函数 needAuthorize")
      }
    }, 1000)
  }

  //微信的 getUserInfo 函数整合
  getUserInfo() {
    var login = this
    wx.getUserInfo({
      lang: "zh_CN",
      success: res => {
        login.processUserInfo(res)
      },
      fail: res => {
        login.getInfoFail(res)
      }
    })
  }

  //成功获取微信用户信息后对用户信息的操作
  processUserInfo(rawUserInfo) {
    //var encryptedData =  rawUserInfo.encryptedData
    //var iv = rawUserInfo.iv
    var userInfo = new Object()
    userInfo.user_name = rawUserInfo.userInfo.nickName
    userInfo.user_avatar = rawUserInfo.userInfo.avatarUrl
    userInfo.user_gender = rawUserInfo.userInfo.gender == 1 ? "男" : "女"
    userInfo.user_city = rawUserInfo.userInfo.city + " " + rawUserInfo.userInfo.city

    var login = this
    wx.request({
      url: login.app.globalData.ip + login.app.globalData.interface.getToken,
      method: "GET",
      data: {
        code: login.code,
      },
      success: function(e) {
        if (e.statusCode == 200) {
          userInfo.token = e.data.token
          wx.setStorageSync('wx_user_info', userInfo)
          login.userInfoIsReady()
        } else {
          login.getInfoFail(res)
        }
      },
      fail: res => {
        login.getInfoFail("无法从服务器获取 token 信息\n在函数 processUserInfo\n错误原因:" + res.errMsg)
      }
    })
  }

  //数据保存成功后，执行回调函数，告诉 login 信息获取成功
  userInfoIsReady() {
    var that = this
    var timeOut = 10;
    var interval = setInterval(function() {
      if (--timeOut != 0) {
        try {
          if (that.app.userInfoReadyCallback && timeOut != 0) {
            //执行回调函数，告诉 login 信息已经获取完了
            clearInterval(interval)
            that.app.userInfoReadyCallback()
          }
        } catch (e) {
          //捕获回调函数时候的错误
          that.getInfoFail(e)
        }
      } else {
        //超时还没有准备好回调函数，只能提示获取信息失败
        clearInterval(interval)
        that.getInfoFail("UserInfo 数据获取完成回调函数设置失败\n在函数 userInfoIsReady")
      }
    }, 1000)
  }

  //获取信息失败
  getInfoFail(e) {
    //调试完成记得去掉注释！
    console.log("获取信息失败，错误原因:\n", e)
    var that = this
    wx.showModal({
      title: '提示',
      content: '获取信息失败。请检查网络连接后，点击确定重启程序重试',
      confirmColor: '#04838e',
      showCancel: false,
      success: function() {
        that.reLunchApp()
      }
    })
  }

  //重启小程序
  reLunchApp() {
    wx.reLaunch({
      url: '/pages/login/login',
    })
    this.getAuthorize()
  }

  //需要在小程序中删除程序
  needDeleteApp() {
    var that = this
    var timeOut = 10;
    var interval = setInterval(function() {
      if (--timeOut != 0) {
        //未授权的回调函数
        try {
          if (that.app.needDeleteAppCallback && timeOut != 0) {
            clearInterval(interval)
            that.app.needDeleteAppCallback()
          }
        } catch (e) {
          //捕获回调函数时候的错误
          that.getInfoFail(e)
        }
      } else {
        //超时还没有准备好回调函数，只能提示获取信息失败
        clearInterval(interval)
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