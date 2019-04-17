// pages/login/login.js
import {
  Login
} from "login-model.js"

var app = getApp()
var login = new Login()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true, //是否要显示 加载中 页面
    needAuthorize: false, //是否需要授权
    isOldVersion: false, //微信是否为旧版本
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    login.setCallBack(this) //设置回调函数
  },

  /* 点击按钮获取用户信息 监听器 */
  clickAuthorzieButton: function(e) {
    login.clickAuthorzieButton(this, e)
  },

  /* 考研小日志 diary 对话框 */
  //回调 取消事件
  _error() {
    login.dialogCancel(this)
  },
  //回调 确认事件
  _success() {
    login.dialogConfirm(this)
  },
})