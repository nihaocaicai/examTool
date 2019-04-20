var app = getApp()

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

  //取消编辑
  cancelEdit() {
    this.page.edit.hideEdit();
  }

  //保存编辑
  confirmEdit(formData) {
    try {
      wx.setStorageSync('user_info', formData)
      this.page.setData({
        info: formData
      })
      this.page.edit.hideEdit();
    } catch (e) {
      console.log("保存信息出错", e)
      //存储空间不足够等问题
      wx.showModal({
        title: '提示',
        content: '保存数据出错，可能是存储空间不足，请清理一下手机后重试',
        showCancel: false,
      })
    }
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