import {
  Login
} from "login-model.js"

import {
  Storage
} from "../../utils/storage.js"

import {
  Debug
} from "../../utils/debug.js"


var model = new Login()
var debug = new Debug()
var openDebug = true //开启调试功能

Page({
  data: {
    loading: true, //是否要显示 加载中 页面
    needAuthorize: false, //是否需要显示 点击授权 按钮
    needDelete: false, //需要删除小程序提示
  },

  onShow: function() {
    this._login()
  },

  /**
   * (*内部函数)
   * [加载小程序]
   */
  _login() {
    var that = this
    if (wx.getStorageSync('logout')) {
      /* 执行过登出操作，提示需要删除小程序后再添加 */
      this.setData({
        needAuthorize: false,
        loading: false,
        needDelete: true, //需要删除小程序提示
      })
    } else {
      //检查微信授权
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 用户已经授权
            this._checkStorage()
          } else {
            // 用户没有授权，需要用户授权
            if (wx.canIUse('button.open-type.getUserInfo')) {
              //微信新版本，需要点击授权按钮
              this.setData({
                needAuthorize: true,
                loading: false,
              })
            } else {
              //微信旧版本，在没有 open-type=getUserInfo 版本的兼容处理
              this._getUserInfo()
            }
          }
        },
        fail: function() {
          that._loginFail()
        }
      })
    }
  },

  //已经授权的操作方法
  /**
   * (*内部函数)
   * [检查缓存]
   * 检查缓存是否有相应的信息
   */
  _checkStorage() {
    var that = this
    if (!(wx.getStorageSync('token'))) {
      /* 没有 token */
      model.get_token({
        success: that._checkStorage,
        fail: that._loginFail,
      })
    } else if (!(wx.getStorageSync('user_info') instanceof Object)) {
      /* 没有 user_info */
      model.get_user_info({
        success: function(data) {
          var target = data['user_target'].split("+")
          var storage = new Storage()
          storage.save({
            key: 'user_info',
            data: {
              birthday: data['user_birthday'],
              examDate: data['user_exam_date'],
              goal_university: target[0],
              goal_major: target[1],
              motto: data['user_motto'],
            },
            success: function() {
              that._checkStorage()
            },
            fail: that._loginFail,
            path: '/pages/login/login',
            functionName: '_checkStorage'
          })
        },
        fail: that._loginFail,
      })
    } else if (!(wx.getStorageSync('wx_user_info') instanceof Object)) {
      /* 没有 wx_user_info */
      var that = this
      wx.getUserInfo({
        lang: "zh_CN",
        success: res => {
          var storage = new Storage()
          storage.save({
            key: 'wx_user_info',
            data: {
              user_name: res.userInfo.nickName,
              user_avatar: res.userInfo.avatarUrl,
              user_gender: res.userInfo.gender == 1 ? "男" : "女",
              user_city: res.userInfo.province + " " + res.userInfo.city,
            },
            saveType: '基本信息',
            success: function() {
              that._checkStorage()
            },
            showRretry: true,
            retryCancel: this._saveFail
          })
        },
        fail: res => {
          openDebug && debug.printWxGetUserInfoError("login.js", "_checkStorage", res)
          that._loginFail()
        }
      })
    } else {
      /* 基础的数据都在，检查用户有没有修改过信息，有就尝试上传服务器，没有就跳到主界面 */
      this._checkForChanges()
    }
  },

  /**
   * [检查基本信息是否更改了]
   */
  _checkForChanges() {
    var that = this
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
          // 信息被更改过
          model.update_wx_user_info(data, {
            success: function() {
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
              storage.save({
                key: "wx_user_info",
                data: cache,
                success: that._toIndex,
                fail: that._toIndex,
                path: "login-model.js",
                functionName: "_checkForChanges",
              })
            },
            fail: that._toIndex()
          })
        } else {
          // 信息没有被更改过
          that._toIndex()
        }
      },
      fail: res => {
        //获取失败，下次再检查
        openDebug && debug.printWxGetUserInfoError("login-model.js", "_checkForChanges", res)
        that._toIndex()
      }
    })
  },

  //没有授权的操作方法
  /**
   * (*内部函数)
   * [监听器]
   * 点击按钮获取用户信息
   */
  _clickAuthorize: function(e) {
    var that = this
    var rawUserInfo = e.detail
    if (rawUserInfo.userInfo) {
      //用户按了授权按钮
      this.setData({
        loading: true, //显示 加载中 页面
        needAuthorize: false, //不显示 点击授权 按钮
      })
      that._processUserInfo(rawUserInfo.userInfo)
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '提示',
        content: '必须授权才能使用考研小神器哦～',
        showCancel: false,
      })
    }
  },

  /**
   * (*内部函数)
   * [获取用户信息]
   * 封装 wx.getUserInfo
   */
  _getUserInfo() {
    var that = this
    wx.getUserInfo({
      lang: "zh_CN",
      success: res => {
        that._processUserInfo(res.data)
      },
      fail: res => {
        openDebug && debug.printWxGetUserInfoError("login.js", "_getUserInfo", res)
        that._loginFail()
      }
    })
  },

  /**
   * (*内部函数)
   * [成功获取微信用户信息后对用户信息的操作]
   */
  _processUserInfo(userInfo) {
    var that = this
    var storage = new Storage()
    storage.save({
      key: 'wx_user_info',
      data: {
        user_name: userInfo.nickName,
        user_avatar: userInfo.avatarUrl,
        user_gender: userInfo.gender == 1 ? "男" : "女",
        user_city: userInfo.province + " " + userInfo.city,
      },
      saveType: '基本信息',
      success: function() {
        //显示设置用户信息对话框
        that.edit = that.selectComponent("#edit") //获得diary组件
        that.edit.setData({
          nickName: wx.getStorageSync("wx_user_info")['user_name'],
          isFirstLogin: true
        })
        that.edit.showEdit()
      },
      showRretry: true,
      retryCancel: this._saveFail
    })
  },

  /**
   * (*内部函数)
   * [保存用户信息事件]
   */
  _save(e) {
    var that = this
    wx.showLoading({
      title: '信息保存中',
    })
    var formData = e.detail
    var wx_user_info = wx.getStorageSync("wx_user_info")
    model.saveUserInfo({
      data: {
        user_name: wx_user_info['user_name'],
        user_avatar: wx_user_info['user_avatar'],
        user_gender: wx_user_info['user_gender'] == '男' ? 1 : 2,
        user_city: wx_user_info['user_city'],
        user_birthday: formData.birthday,
        user_target: formData.goal_university + "+" + formData.goal_major,
        user_motto: formData.motto,
        user_exam_date: formData.examDate,
      },
      success: function(data) {
        var storage = new Storage()
        storage.saveList({
          saveList: [{
              key: "user_info",
              data: formData,
            },
            {
              key: "hideOfflineTips",
              data: false,
            }
          ],
          success: function() {
            that.edit.hideEdit();
            wx.hideLoading()
            that._toIndex()
          },
          fail: function() {
            wx.hideLoading()
          },
          showRetry: true,
          retry: function() {
            wx.showLoading({
              title: '信息保存中',
            })
          },
          retryCancel: function() {
            that.edit.hideEdit()
            that._saveFail()
          },
          saveType: "保存信息",
          path: '/pages/login/login',
          functionName: '_save',
        })
      },
      statusCodeFail: function() {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '服务器出错，请稍后重试',
          showCancel: false,
        })
      },
      fail: function() {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '网络连接失败，请检查网络连接是否正确',
          showCancel: false,
        })
      },
    })
  },

  /**
   * (*内部函数)
   * [设置信息对话框点击取消按钮]
   */
  _cancel() {
    var that = this
    wx.showLoading({
      title: '信息保存中',
    })
    var wx_user_info = wx.getStorageSync("wx_user_info")
    model.saveUserInfo({
      data: {
        user_name: wx_user_info['user_name'],
        user_avatar: wx_user_info['user_avatar'],
        user_gender: wx_user_info['user_gender'],
        user_city: wx_user_info['user_city'],
        user_birthday: null,
        user_target: "",
        user_motto: "",
        user_exam_date: null,
      },
      success: function(data) {
        var storage = new Storage()
        storage.saveList({
          saveList: [{
              key: "user_info",
              data: {
                birthday: null,
                examDate: null,
                goal_university: "",
                goal_major: "",
                motto: "",
              },
            },
            {
              key: "hideOfflineTips",
              data: false,
            }
          ],
          success: function() {
            that.edit.hideEdit();
            wx.hideLoading()
            that._toIndex()
          },
          fail: function() {
            wx.hideLoading()
          },
          showRetry: true,
          retry: function() {
            wx.showLoading({
              title: '信息保存中',
            })
          },
          retryCancel: function() {
            that.edit.hideEdit()
            that._saveFail()
          },
          saveType: "保存信息",
          path: '/pages/login/login',
          functionName: '_cancel',
        })
      },
      statusCodeFail: function() {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '服务器出错，请稍后重试',
          showCancel: false,
        })
      },
      fail: function() {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '网络连接失败，请检查网络连接是否正确',
          showCancel: false,
        })
      },
    })
  },

  /**
   * (*内部函数)
   * [保存信息失败]
   */
  _saveFail() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '保存信息失败',
      confirmColor: '#04838e',
      confirmText: '重启小程序',
      showCancel: false,
      success: function() {
        wx.reLaunch({
          url: '/pages/login/login',
        })
      }
    })
  },

  /**
   * (*内部函数)
   * [登录失败]
   */
  _loginFail() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '获取信息失败。请检查网络连接后重试',
      confirmColor: '#04838e',
      confirmText: '重试',
      showCancel: false,
      success: function() {
        wx.reLaunch({
          url: '/pages/login/login',
        })
      }
    })
  },

  /**
   * (*内部函数)
   * [跳转到首页]
   */
  _toIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  }
})