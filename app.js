import {
  Login
} from "app-model.js"

var connect = require("utils/interface.js")
var login = new Login(); //实例化 登陆模块

App({
  globalData: {
    ip: connect.ip,
    interface: connect.interface,
  },

  onLaunch: function(e) {
    login.setApp(this)
    login.getAuthorize() //获取授权
  },

  //成功获取微信用户信息后的操作 此处为 login 调用接口 不要删除
  processUserInfo(rawUserInfo) {
    login.processUserInfo(rawUserInfo)
  },

  //获取用户其他信息失败后后的操作 此处为 login 调用接口 不要删除
  getInfoFail(e) {
    login.getInfoFail(e)
  },

  //重启程序 此处为 login 调用接口 不要删除
  reLunchApp() {
    login.reLunchApp()
  }
})