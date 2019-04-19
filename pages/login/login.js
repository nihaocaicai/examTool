import {
  Login
} from "login-model.js"

var login = new Login()

Page({
  data: {
    loading: true, //是否要显示 加载中 页面
    needAuthorize: false, //是否需要显示 点击授权 按钮
  },

  onShow: function(options) {
    login.setPage(this)
    login.setCallBack() //设置回调函数
  },

  /* 点击按钮获取用户信息 监听器 */
  clickAuthorzieButton: function(e) {
    login.clickAuthorzieButton(e)
  },

  //回调 保存数据事件
  _save(e) {
    login.dialogConfirm(e.detail)
  }
})