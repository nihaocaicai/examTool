import {
  Login
} from "utils/app-model.js"

var login = new Login(); //实例化 登陆模块

App({
  globalData: {
    userInfo: {}, //用户信息
    goal: '未填写', //目标，应该在登录时候获取
    motto: '你还没有填写座右铭', //座右铭，应该在登录时候获取
    plan: [], //今日计划
  },

  onLaunch: function(e) {
    login.getAuthorize(this) //获取授权
  },

  //成功获取微信用户信息后的操作 此处为 login 调用接口 不要删除
  gotUserInfo(userInfo) {
    login.gotUserInfo(this, userInfo)
  },

  //获取用户 OpenID 操作 此处为 login 调用接口 不要删除
  getOpenID: function() {
    login.getOpenID(this)
  },
})