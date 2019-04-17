// pages/menu/menu-content/setting/setting.js
import {
  Setting
} from "setting-model.js"

var setting = new Setting()
var app = getApp()

Page({
  onLoad: function() {
    setting.getUserData(this)
  },

  onReady: function() {
    this.edit = this.selectComponent("#edit") //获得diary组件
  },

  /* 考研小日志 diary 对话框 */
  //显示对话框事件
  showEdit() {
    setting.showEdit(this)
  },

  logout() {
    console.log('退出登录');
  },

  //回调 取消事件
  _error() {
    setting.cancelEdit(this)
  },

  //回调 保存数据事件
  _save(e) {
    setting.confirmEdit(this, e.detail)
  },
})