// pages/menu/menu-content/setting/setting.js
import {
  Setting
} from "setting-model.js"

var setting = new Setting()

Page({
  onLoad: function() {
    this.setData({
      showDeleteModal: false,
      hideOfflineTips: wx.getStorageSync("hideOfflineTips")
    })
    setting.setPage(this)
    setting.getUserData()
  },

  onReady: function() {
    this.edit = this.selectComponent("#edit") //获得diary组件
  },

  //切换离线模式提醒按钮
  offlineTipsChange: function(e) {
    try {
      wx.setStorageSync("hideOfflineTips", !e.detail.value)
      this.setData({
        hideOfflineTips: !e.detail.value
      })
    } catch (error) {
      console.log("设置是否提示离线信息对话框出错，错误信息:\n" + error)
    }
  },

  /* 点击 退出登录 按钮 */
  clickLogoutButton() {
    var add1 = this.getRandom(1, 9);
    var add2 = this.getRandom(0, 9 - add1);
    this.setData({
      showDeleteModal: true,
      add1: add1,
      add2: add2,
      result: add1 + add2,
      value: '',
    })
  },

  /* 在删除对话框点击 取消 按钮 */
  cancelDelete() {
    this.setData({
      showDeleteModal: false
    })
  },

  /* 在删除对话框点击 确定 按钮 */
  confirmDelete(e) {
    if (this.data.result == this.data.input) {
      //回答正确
      this.setData({
        showDeleteModal: false
      })
      setting.confirmDelete(this.data.input)
    } else {
      //回答错误
      wx.showToast({
        title: '回答错误',
        image: '/images/fail.png',
        duration: 1200,
      })
    }
  },

  /* 输入答案框的值改变 */
  bindKeyInput(e) {
    this.setData({
      input: e.detail.value
    })
  },

  /* 考研小日志 diary 对话框 */
  //显示对话框事件
  showEdit() {
    setting.showEdit()
  },

  //回调 取消事件
  _error() {
    setting.cancelEdit()
  },

  //回调 保存数据事件
  _save(e) {
    setting.confirmEdit(e.detail)
  },

  //生成随机数
  getRandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
  }
})