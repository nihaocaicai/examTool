import {
  DateUtil
} from "../../utils/DateUtil.js"

import {
  Storage
} from "../../utils/storage.js"

import {
  Index
} from "index-model.js"

var dateUtil = new DateUtil()
var model = new Index()

Page({
  data: {
    showPage: false, //默认不显示，先检查信息对不对
  },

  onLoad: function() {
    wx.showLoading({
      title: '加载计划中',
    })
    this._checkEverydayPlan() //检查计划是不是今天的
  },

  onReady: function() {
    this.diary = this.selectComponent("#diary") //获得diary组件
  },

  /**
   * [星标按钮点击事件]
   */
  clickStar: function(e) {
    var index = e.currentTarget.dataset.index
    var plans = this.data.everyday_planList
    var flag = plans.data[index].plan_if_finish // 获取星标状态
    plans.data[index].plan_if_finish = !flag //修改对应计划的星标状态
    this.setData({
      everyday_planList: plans
    })
  },

  /**
   * [批量提交星星]
   */
  modifyFinish() {

  },

  /**
   * [跳转到修改页面]
   */
  goToModify() {
    wx.navigateTo({
      url: '../index/modify/modify',
    })
  },

  /**
   * [跳转到考研日志]
   */
  showAllDiary() {
    wx.navigateTo({
      url: '../menu/menu-content/diary/diary',
    })
  },

  /* 考研小日志 diary 对话框 */
  /**
   * [显示对话框事件]
   */
  showDiary() {
    this.diary.showDiary("新增日记", null);
  },

  /**
   * [对话框确认事件回调]
   */
  add_confirm() {
    wx.showModal({
      title: '提示',
      content: '日记添加成功！',
      confirmColor: '#04838e',
      showCancel: false,
    })
  },

  /* 跳转到这个页面时执行的动作 */
  /**
   * [检查每日计划是不是今天的]
   *
    检查 everyday_planList 的内容是不是今天的，不是今天的要清除
   */
  _checkEverydayPlan() {
    var that = this
    var everyday_planList = wx.getStorageSync("everyday_planList")
    if (everyday_planList == "" || everyday_planList.date != dateUtil.getFormatDate()) {
      //没有计划或者计划不是今天的，要重新建新的列表
      var s = new Storage()
      s.save({
        key: "everyday_planList",
        data: {
          date: dateUtil.getFormatDate(),
          data: [],
        },
        success: function() {
          model.getEverydayPlanFromServer({
            success: that._init,
            fail: that._offline,
          })
        },
        fail: that._initFail,
      })
    } else {
      model.getEverydayPlanFromServer({
        success: that._init,
        fail: that._offline,
      })
    }
  },

  /** 
   * [离线模式]
   */
  _offline() {
    wx.hideLoading()
    this.setDate({
      everyday_planList: wx.getStorageSync("everyday_planList"),
      showPage: true,
    })
    if (!wx.getStorageSync("hideOfflineTips"))
      wx.showToast({
        title: '当前为离线模式',
        image: "/images/login_fail.png",
        duration: 1800,
      })
  },

  /**
   * [初始化]
   */
  _init(data) {
    var that = this
    if (data) {
      //获取到数据
      var s = new Storage()
      s.save({
        key: 'everyday_planList',
        data: data,
        success: function() {
          that.setData({
            everyday_planList: wx.getStorageSync("everyday_planList"),
            showPage: true,
          })
          wx.hideLoading()
        },
        fail: that._initFail,
        path: '/pages/index/index',
        functionName: '_init',
      })
    } else {
      wx.hideLoading()
    }
  },

  /**
   * [初始化失败]
   */
  _initFail() {
    wx.hideLoading()
    wx.showModal({
      title: '提示',
      content: '小程序初始化失败，点击下方按钮试一下',
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
})