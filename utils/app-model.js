//app 登录模块
//只负责获取和处理 userInfo 和 openid
var testData = require("../data/testData.js")

class Login {
  setApp(app) {
    this.app = app
  }

  //获取授权操作
  getAuthorize() {
    //Todo 添加判断是否登出的判断
    //未完成！！！！！！！！！！！！！

    if (wx.getStorageSync('wx_user_info') != "") {
      this.userInfoIsReady() //如果缓存有授权数据，则不需要发起授权申请
    } else {
      // 如果缓存没有数据，重新授权
      var login = this
      if (wx.canIUse('button.open-type.getUserInfo')) {
        wx.getSetting({
          // 微信新版本，查看用户是否授权过
          success: function(res) {
            if (res.authSetting['scope.userInfo'])
              login.getUserInfo() //授权过，可以直接使用微信的 getUserInfo 接口
            else
              login.needAuthorize() //没有授权，需要用户点击按钮授
          },
          fail: function() {
            login.getInfoFail();
          }
        })
      } else {
        login.getUserInfo() //微信旧版本，在没有 open-type=getUserInfo 版本的兼容处理
      }
    }
  }

  //微信的 getUserInfo 函数整合
  getUserInfo() {
    var login = this
    wx.getUserInfo({
      lang: "zh_CN",
      success: res => {
        login.processUserInfo(res.userInfo)
      },
      fail: res => {
        login.getInfoFail();
      }
    })
  }

  //成功获取微信用户信息后对用户信息的操作
  processUserInfo(userInfo) {
    var login = this
    wx.login({
      success: res => {
        if (res.code) {
          //获取 code 成功后，还需要向服务器查询获取openID
          var openid = "open_id"
          //以下是成功获取 openid 之后的操作
          var info = new Object()
          var city = userInfo['province']
          city += ' '
          city += userInfo['city']
          info['open_id'] = openid
          info['user_name'] = userInfo['nickName']
          info['user_avatar'] = userInfo['avatarUrl']
          info['user_gender'] = userInfo['gender'] == 1 ? "男" : "女"
          info['user_city'] = city
          wx.setStorageSync('wx_user_info', info)
          login.userInfoIsReady()
        } else {
          //获取失败
          login.getInfoFail();
        }
      },
      fail: function() {
        login.getInfoFail();
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
        }
      } else {
        //超时还没有准备好回调函数，只能提示获取信息失败
        clearInterval(interval)
        that.getInfoFail()
      }
    }, 1000)
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
        that.getInfoFail()
      }
    }, 1000)
  }

  //获取信息失败
  getInfoFail() {
    wx.showModal({
      title: '提示',
      content: '获取信息失败，点击确定重启程序重试',
      confirmColor: '#04838e',
      success: function() {
        this.reLunchApp()
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
};

export {
  Login
};