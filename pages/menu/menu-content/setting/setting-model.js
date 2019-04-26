var app = getApp()
var isShow = false

class Setting {
  setPage(page) {
    this.page = page
  }

  //获取显示的数据
  getUserData() {
    var info = wx.getStorageSync('user_info')
    var wxInfo = wx.getStorageSync('wx_user_info')
    info.birthday = info.birthday == null ? "未设置" : info.birthday
    info.examDate = info.examDate == null ? "未设置" : info.examDate
    info.goal_university = info.goal_university == "" ? "未设置" : info.goal_university
    info.goal_major = info.goal_major == "" ? "未设置" : info.goal_major
    info.motto = info.motto == "" ? "未设置座右铭" : info.motto
    this.page.setData({
      wxInfo: wxInfo,
      info: info,
    })
  }

  //显示设置对话框
  showEdit() {
    if (!this.isShow) {
      isShow = true
      var info = wx.getStorageSync('user_info')
      var wxInfo = wx.getStorageSync('wx_user_info')
      this.page.edit.setData({
        isLogin: false, //不是在登录的时候显示对话框
        nickName: wxInfo['user_name'],
        birthday: info['birthday'],
        examDate: info['examDate'],
        goal_university: info['goal_university'],
        goal_major: info['goal_major'],
        motto: info['motto'],
      })
      this.page.edit.showEdit();
    }
  }

  //取消编辑
  cancelEdit() {
    isShow = false
    this.page.edit.hideEdit();
  }

  //保存编辑
  confirmEdit(formData) {
    var that = this
    wx.request({
      url: app.globalData.ip + app.globalData.interface.postModifyInfo,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      data: ({
        token: wx.getStorageSync("wx_user_info").token,
        user_brithday: formData.birthday,
        user_target: formData.goal_university + "+" + formData.goal_major,
        user_motto: formData.motto,
        user_exam_date: formData.examDate,
      }),
      success: function(res) {
        if (res.statusCode == 202) {
          //保存成功
          try {
            wx.setStorageSync('user_info', formData)
            that.page.setData({
              info: formData,
            })
            that.page.edit.hideEdit();
            wx.hideLoading()
            isShow = false
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1500,
            })
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

  //确定删除信息按钮
  confirmDelete(e) {
    wx.showLoading({
      title: '清除数据中',
    })
    try {
      //Todo 请求服务器删除信息
      //success: 执行删除数据操作
      //Todo 删除数据操作
      wx.setStorageSync('logout', true)
      //模拟等待时间
      setTimeout(function() {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '退出成功，请在微信中删除小程序完成退出操作',
          showCancel: false,
          confirmColor: '#04838e',
          success: function(res) {
            app.reLunchApp()
          },
        })
      }, 2000)
      //Todo 删除数据操作
      //fail: throw "无法与服务器连接"
    } catch (e) {
      //如果没办法删除，可能是没有存储空间设置标签，清除存储空间后重试
      //wx.clearStorageSync()
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '退出失败，请检查网络后重试',
        showCancel: false,
        confirmColor: '#04838e',
      })
    }
  }
}

export {
  Setting
};