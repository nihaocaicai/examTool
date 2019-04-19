// pages/menu/menu-content/setting/setting.js
import {
  Setting
} from "setting-model.js"

var setting = new Setting()

Page({
  onLoad: function() {
    this.setData({
      showDeleteModal: false
    })
    setting.setPage(this)
    setting.getUserData()
  },

  onReady: function() {
    this.edit = this.selectComponent("#edit") //获得diary组件
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
      this.setData({
        showDeleteModal: false
      })
      setting.confirmDelete(this.data.input)
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