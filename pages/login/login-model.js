import {
  Request
} from "../../utils/server/request.js"

import {
  Debug
} from "../../utils/debug.js"

import {
  Storage
} from "../../utils/storage.js"

import {
  Token
} from "utils/server/token.js"

var debug = new Debug()
var app = getApp()
var thisClass = this

/**
 * login 页面登录接口
 * 完成授权且获取 userInfo 和 openid 之后的操作
 */
class Login {
  constructor() {
    thisClass = this
  }

  setPage(page) {
    thisClass.page = page
  }


  //从服务器获取 user_info
  getUserInfoFromService() {
    var failInfo = {
      path: 'login-model.js',
      functionName: "getUserInfoFromService"
    }
    var r = new Request()
    r.interface = "getInfo"
    r.successCallBack = function(data) {
      //服务器与本地数据代码格式不相同，需要转义
      var target = data['user_target'].split("+")
      var user_info = new Object()
      user_info['birthday'] = data['user_birthday']
      user_info['examDate'] = data['user_exam_date']
      user_info['goal_university'] = target[0]
      user_info['goal_major'] = target[1]
      user_info['motto'] = data['user_motto']
      var storage = new Storage()
      storage.successCallBack = thisClass.getTodayPlanFromService //保存成功
      storage.failCallBack = app.getInfoFail //保存失败
      storage.failInfo = failInfo
      storage.save("user_info", user_info)
    }
    r.statusCodeFailCallBack = app.getInfoFail
    r.failCallBack = app.getInfoFail
    r.failInfo = failInfo
    r.request()
  }

  //从服务器上获取今天的计划 everyday_planList
  getTodayPlanFromService() {
    var failInfo = {
      path: 'login-model.js',
      functionName: "getTodayPlanFromService"
    }
    var r = new Request()
    r.interface = "getTodayPlan"
    r.successCallBack = function(data) {
      var storage = new Storage()
      storage.successCallBack = thisClass.toIndex //保存成功
      storage.failCallBack = app.getInfoFail //保存失败
      storage.failInfo = failInfo
      storage.save("everyday_planList", data)
    }
    r.statusCodeFailCallBack = thisClass.offlineTips
    r.failCallBack = thisClass.offlineTips
    r.failInfo = failInfo
    r.request()
  }

  //填写用户信息对话框
  showSetUserInfoDialog() {
    thisClass.page.edit = thisClass.page.selectComponent("#edit") //获得diary组件
    thisClass.page.edit.setData({
      nickName: wx.getStorageSync("wx_user_info")['user_name'],
      isFirstLogin: true
    })
    thisClass.page.edit.showEdit();
  }

  //跳转到首页
  toIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  }

  //检查每日计划是不是今天的
  checkEveryDayPlan() {
    //检查 everyday_planList 的内容是不是今天的，不是今天的要清除
    var today = new Date()
    var date = [today.getFullYear(), today.getMonth() + 1, today.getDate()].map(
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }
    ).join('-')

    if (wx.getStorageSync("everyday_planList") instanceof Object && wx.getStorageSync("everyday_planList").date == date) {} else {
      var everyday_planList = new Object()
      everyday_planList.date = date
      everyday_planList.data = new Array()

      var storage = new Storage()
      storage.successCallBack = thisClass.afterSuccessCheckEveryDayPlan ? thisClass.afterSuccessCheckEveryDayPlan : undefined
      storage.failCallBack = app.getInfoFail
      storage.setFailInfo('login-model.js', "checkEveryDayPlan")
      storage.save("everyday_planList", everyday_planList)
    }
  }

  //脱机提示
  offlineTips() {
    thisClass.afterSuccessCheckEveryDayPlan = function() {
      if (!wx.getStorageSync('hideOfflineTips')) {
        //显示离线提示
        app.globalData.isOffline = true
      }
      thisClass.toIndex()
    }
    thisClass.checkEveryDayPlan()
  }

  /* 以下为新加入未修改的方法 */
  //检查基本信息是否更改了
  checkForChanges() {
    wx.getUserInfo({
      lang: "zh_CN",
      success: res => {
        var cache = wx.getStorageSync("wx_user_info")
        res.userInfo.gender = res.userInfo.gender == 1 ? "男" : "女"
        res.userInfo.city = res.userInfo.province + " " + res.userInfo.city
        var nickNameFlag = cache['user_name'] != res.userInfo.nickName //昵称更改过标签
        var avatarUrlFlag = cache['user_avatar'] != res.userInfo.avatarUrl //用户更改过头像
        var genderFlag = cache['user_gender'] != res.userInfo.gender //性别更改过标签
        var cityFlag = cache['user_city'] != res.userInfo.city //城市更改过标签
        var changedFlag = false

        //传递的参数
        var data = new Object()
        if (nickNameFlag) {
          //昵称更改过
          data.user_name = res.userInfo.nickName
          changedFlag = true
        }
        if (avatarUrlFlag) {
          //用户更改过
          data.user_avatar = res.userInfo.avatarUrl
          changedFlag = true
        }
        if (genderFlag) {
          //性别更改过
          data.user_gender = res.userInfo.gender
          changedFlag = true
        }
        if (cityFlag) {
          //城市更改过
          data.user_city = res.userInfo.city
          changedFlag = true
        }
        if (changedFlag) {
          //更改过信息，尝试更改服务器上的信息
          var r = new Request()
          r.interface = "modifyInfo"
          r.data = data
          r.successCallBack = function (res) {
            if (nickNameFlag)
              //昵称更改过
              cache['user_name'] = res.userInfo.nickName
            if (avatarUrlFlag)
              //用户更改过
              cache['user_avatar'] = res.userInfo.avatarUrl
            if (genderFlag)
              //性别更改过
              cache['user_gender'] = res.userInfo.gender
            if (cityFlag)
              //城市更改过
              cache['user_city'] = res.userInfo.city

            var storage = new Storage() //添加存储能力
            storage.successCallBack = this.userInfoIsReady //保存成功
            storage.failCallBack = this.userInfoIsReady //保存失败，下次再检查
            storage.setFailInfo('app-model.js', "checkForChanges")
            storage.save("wx_user_info", cache)
          }
          r.statusCodeFailCallBack = this.userInfoIsReady //请求失败，下次再检查
          r.failCallBack = this.userInfoIsReady //请求失败，下次再检查
          r.setFailInfo('app-model.js', "checkForChanges")
          r.request()
        } else {
          //没有更改过，直接跳转
          this.userInfoIsReady()
        }
      },
      fail: res => {
        //获取失败，下次再检查
        debug.printWxGetUserInfoError("app-model.js", "checkForChanges", res)
        this.userInfoIsReady()
      }
    })
  }
}

export {
  Login
}