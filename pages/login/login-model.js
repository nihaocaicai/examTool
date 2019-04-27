//login 页面登录接口
//完成授权且获取 userInfo 和 openid 之后的操作
var app = getApp()

class Login {
  setPage(page) {
    this.page = page
  }

  //用户点击授权按钮 获取用户信息
  clickAuthorzieButton(e) {
    var rawUserInfo = e.detail
    if (rawUserInfo.userInfo) {
      //用户按了授权按钮
      this.page.setData({
        loading: true, //显示 加载中 页面
        needAuthorize: false, //不显示 点击授权 按钮
      })
      wx.setStorageSync("isFirstLogin", true)
      app.processUserInfo(rawUserInfo)
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '提示',
        content: '必须授权才能使用考研小神器哦～',
        showCancel: false,
      })
    }
  }

  /*初始化回调函数*/
  setCallBack() {
    var that = this
    //获取到 userInfo 的回调函数
    app.userInfoReadyCallback = function() {
      if (wx.getStorageSync("isFirstLogin")) {
        //第一次登录，需要设置信息
        that.showSetUserInfoDialog()
      } else {
        //不是第一次登录
        if (!(wx.getStorageSync('user_info') instanceof Object)) {
          //缓存不存在 user_info，尝试从服务器获取
          that.getUserInfoFromService()
        } else {
          //user_info 存在于缓存，获取 everyday_planList
          that.getTodayPlanFromService()
        }
      }
    }
    //未授权的回调函数
    app.needAuthorizeCallback = function() {
      that.page.setData({
        needAuthorize: true, //显示 点击授权 按钮
        loading: false, //不显示 加载中 页面
      })
    }
    //需要删除小程序提示
    app.needDeleteAppCallback = function() {
      that.page.setData({
        needAuthorize: false,
        loading: false,
        needDelete: true, //需要删除小程序提示
      })
    }
  }

  //从服务器获取 user_info
  getUserInfoFromService() {
    var that = this
    wx.request({
      url: app.globalData.ip + app.globalData.interface.getInfo,
      data: ({
        token: wx.getStorageSync("wx_user_info").token
      }),
      success: function(res) {
        if (res.statusCode == 200) {
          //服务器与本地数据代码格式不相同，需要转义
          var target = res.data['user_target'].split("+")
          var user_info = new Object()
          user_info['birthday'] = res.data['user_birthday']
          user_info['examDate'] = res.data['user_exam_date']
          user_info['goal_university'] = target[0]
          user_info['goal_major'] = target[1]
          user_info['motto'] = res.data['user_motto']
          try {
            wx.setStorageSync('user_info', user_info)
            that.getTodayPlanFromService()
          } catch (e) {
            app.getInfoFail("保存信息出错，错误原因：\n" + e)
          }
        } else {
          app.getInfoFail("无法从服务器获取 user_Info 信息\n在函数 getUserInfoFromService\n服务器返回状态码: " + res.statusCode)
        }
      },
      fail: function(res) {
        app.getInfoFail("无法从服务器获取 user_Info 信息\n在函数 getUserInfoFromService\n错误原因:" + res.errMsg)
      },
    })
  }

  //从服务器上获取今天的计划 everyday_planList
  getTodayPlanFromService() {
    var that = this
    wx.request({
      url: app.globalData.ip + app.globalData.interface.getTodayPlan,
      data: ({
        token: wx.getStorageSync("wx_user_info").token
      }),
      success: function(res) {
        if (res.statusCode == 200) {
          try {
            wx.setStorageSync('everyday_planList', res.data)
            that.toIndex()
          } catch (e) {
            app.getInfoFail("保存信息出错，错误原因：\n" + e)
          }
        } else {
          that.offlineTips("无法从服务器获取 everyday_planList 信息\n在函数 getTodayPlanFromService\n服务器返回状态码: " + res.statusCode)
        }
      },
      fail: function(res) {
        that.offlineTips("无法从服务器获取 everyday_planList 信息\n在函数 getTodayPlanFromService\n错误原因:" + res.errMsg)
      },
    })
  }

  //设置对话框 点击确定按钮
  dialogConfirm(formData) {
    var that = this
    var wx_user_info = wx.getStorageSync("wx_user_info")
    wx.showLoading({
      title: '信息保存中',
    })
    wx.request({
      url: app.globalData.ip + app.globalData.interface.postModifyInfo,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      data: ({
        token: wx_user_info['token'],
        user_name: wx_user_info['user_name'],
        user_avatar: wx_user_info['user_avatar'],
        user_gender: wx_user_info['user_gender'],
        user_city: wx_user_info['user_city'],
        user_brithday: formData.birthday,
        user_target: formData.goal_university + "+" + formData.goal_major,
        user_motto: formData.motto,
        user_exam_date: formData.examDate,
      }),
      success: function(res) {
        if (res.statusCode == 202) {
          //保存成功
          try {
            var wx_user_info = wx.getStorageSync("wx_user_info")
            wx.clearStorageSync() //清除所有信息
            wx.setStorageSync("wx_user_info", wx_user_info)
            wx.setStorageSync('user_info', formData)
            wx.setStorageSync('hideOfflineTips', false)
            that.page.edit.hideEdit();
            wx.hideLoading()
            that.checkEveryDayPlan()
            that.toIndex()
          } catch (e) {
            console.log("保存信息出错，错误原因：\n", e)
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '保存数据出错，可能是存储空间不足，请尝试清理一下手机后再保存',
              showCancel: false,
            })
          }
        } else {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '服务器出错，请稍后重试',
            showCancel: false,
          })
          console.log("服务器出错，错误代码: " + res.statusCode)
        }
      },
      fail: function(res) {
        wx.showModal({
          title: '提示',
          content: '网络连接失败，请检查网络连接是否正确',
          showCancel: false,
        })
        console.log("网络连接失败，错误原因:" + res.errMsg)
        wx.hideLoading()
      },
    })
  }

  //填写用户信息对话框
  showSetUserInfoDialog() {
    this.page.edit = this.page.selectComponent("#edit") //获得diary组件
    this.page.edit.setData({
      nickName: wx.getStorageSync("wx_user_info")['user_name'],
      isFirstLogin: true
    })
    this.page.edit.showEdit();
  }

  //跳转到首页
  toIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  }

  //检查每日计划是不是今天的
  checkEveryDayPlan() {
    //检查 everyday_planList 的内容是不是今天的，不是今天的要清除
    var today = new Date()
    var date = [today.getFullYear(), today.getMonth() + 1, today.getDate()].map(
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }
    ).join('-')

    if (wx.getStorageSync("everyday_planList") instanceof Object && wx.getStorageSync("everyday_planList").date == date) {} else {
      var everyday_planList = new Object()
      everyday_planList.date = date
      everyday_planList.data = new Array()
      try {
        wx.setStorageSync("everyday_planList", everyday_planList)
      } catch (e) {
        //保存错误，重启程序重试
        app.getInfoFail("设置每日计划 everyday_planLists 出错\n在函数 checkEveryDayPlan\n错误原因:\n" + e)
      }
    }
  }

  //脱机提示
  offlineTips(errorMessage) {
    console.log("与服务器连接出错\n" + errorMessage)
    this.checkEveryDayPlan()

    if (!wx.getStorageSync('hideOfflineTips')) {
      //显示离线提示
      app.globalData.isOffline = true
    }
    this.toIndex()
  }
}

export {
  Login
};