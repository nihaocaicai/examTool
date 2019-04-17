var app = getApp()

class Setting {
  getUserData(page) {
    var info = wx.getStorageSync('user_info')
    var wxInfo = wx.getStorageSync('wx_user_info')
    info.birthday = info.birthday == null ? "未设置" : info.birthday
    info.examDate = info.examDate == null ? "未设置" : info.examDate
    info.goal_university = info.goal_university == "" ? "未设置" : info.goal_university
    info.goal_major = info.goal_major == "" ? "未设置" : info.goal_major
    info.motto = info.motto == "" ? "未设置座右铭" : info.motto
    page.setData({
      wxInfo: wxInfo,
      info: info,
    })
  }

  //显示设置对话框
  showEdit(page) {
    var info = wx.getStorageSync('user_info')
    var wxInfo = wx.getStorageSync('wx_user_info')
    page.edit.setData({
      isLogin: false, //不是在登录的时候显示对话框
      nickName: wxInfo['user_name'],
      birthday: info['birthday'],
      examDate: info['examDate'],

      goal_university: info['goal_university'],
      goal_major: info['goal_major'],
      motto: info['motto'],
    })
    page.edit.showEdit();
  }

  //取消编辑
  cancelEdit(page) {
    page.edit.hideEdit();
  }

  //保存编辑
  confirmEdit(page, formData) {
    try {
      wx.setStorageSync('user_info', formData)
      page.setData({
        info: formData
      })
      page.edit.hideEdit();
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
}

export {
  Setting
};