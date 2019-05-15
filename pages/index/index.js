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
var planModifyList = new Map()

Page({
  data: {
    showPage: false, //默认不显示，先检查信息对不对
  },

  onLoad: function() {
    // wx.redirectTo({
    //   url: '../../pages/menu/menu-content/diary/diary',
    // })
  },

  onShow:function(){
    var that=this
    // 判断当前有没有网络，有的话设置不为离线
    wx.getNetworkType({
      success(res) {
        // console.log(res.networkType)
        if (res.networkType != "none") {
          // 设置不为离线模式
          that._setHideOfflineTips(true)
        } else {
          // 设置为离线模式
          that._setHideOfflineTips(false)
        }
      },
      fail(res) {
        that._setHideOfflineTips(false)
      }
    })
    this._init() //检查计划是不是今天的
  },

  onHide: function() {
    if (planModifyList.size != 0) {
      this._modifyFinish() // 批量提交修改的计划
    }
  },

  /**
   * [星标按钮点击事件]
   */
  clickStar: function(e) {
    var index = e.currentTarget.dataset.index
    var plan_id = e.currentTarget.dataset.id
    var plans = this.data.everyday_planList
    var flag = !(plans.data[index].plan_if_finish) // 获取星标状态
    if (flag){
      wx.showToast({
        title: '任务完成了！',
      })
    }else{
      wx.showToast({
        title: '任务没完成！',
      })
    }
    plans.data[index].plan_if_finish = flag //修改对应计划的星标状态
    this.setData({
      everyday_planList: plans
    })

    //将修改过的记录添加到列表中
    if (planModifyList.get(plan_id) != undefined) {
      //有记录，移除
      planModifyList.delete(plan_id)
    } else {
      //没有记录，添加
      planModifyList.set(plan_id, flag ? 1 : 0)
    }
  },

  /**
   * [批量提交星星]
   */
  _modifyFinish() {
    var ids = new Array()
    var values = new Array()
    var that = this
    planModifyList.forEach(function(value, id) {
      ids.push(id)
      values.push(value)
    })
    var data = {
      plan_id: "[" + ids.toString() + "]",
      plan_if_finish: "[" + values.toString() + "]",
    }
    model.batchModifyToServer({
      data: data,
      success: function() {
        var s = new Storage()
        s.save({
          key: 'everyday_planList',
          data: that.data.everyday_planList,
          success: function() {
            planModifyList = new Map()
          },
          fail: function() {
            that._updatePlanFinishFail(data)
          },
        })
      },
      fail: function() {
        that._updatePlanFinishFail(data)
      },
    })
  },

  /**
   * [更新计划完成状态失败]
   */
  _updatePlanFinishFail(failIndexPlanFinish) {
    var s = new Storage()
    s.save({
      key: 'failIndexPlanFinish',
      data: failIndexPlanFinish,
    })
    // 保存失败就丢弃
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
    if (!(this.diary))
      this.diary = this.selectComponent("#diary") //获得diary组件
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
   * [初始化]
   *
   */
  _init() {
    var that = this
    //检查 everyday_planList 的内容是不是今天的，不是今天的要清除
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
        success: that._checkIfHasFailPlanFinish,
        fail: that._initFail,
      })
    } else {
      that._checkIfHasFailPlanFinish()
    }
  },

  /**
   * 检查有没有没更新的计划完成状态
   */
  _checkIfHasFailPlanFinish() {
    var that = this
    // 获取信息之前先检查是不是存在上次没保存的星星
    var data = wx.getStorageSync('failIndexPlanFinish')
    if (data == "") {
      that._getEverydayPlanFromServer()
    } else {
      //如果存在没保存的信息，先进行更新
      //不管成不成功，都清除上次未保存的记录
      model.batchModifyToServer({
        data: data,
        success: function() {
          wx.removeStorageSync("failIndexPlanFinish")
          that._getEverydayPlanFromServer()
        },
        fail: function() {
          wx.removeStorageSync("failIndexPlanFinish")
          that._getEverydayPlanFromServer()
        },
      })
    }
  },

  /**
   * [从服务器获取当天计划]
   */
  _getEverydayPlanFromServer() {
    var that = this
    model.getEverydayPlanFromServer({
      success: function(data) {
        //获取到数据
        var s = new Storage()
        if (JSON.stringify(data) == "\"\"") {
          //今天没计划，自己本地生成新的列表
          data = {
            date: dateUtil.getFormatDate(),
            data: [],
          }
        }
        s.save({
          key: 'everyday_planList',
          data: data,
          success: that._initData,
          fail: that._initFail,
          path: '/pages/index/index',
          functionName: '_init',
        })
      },
      fail: that._offline,
    })
  },

  /** 
   * [离线模式]
   */
  _offline() {
    this._initData()
    if (!wx.getStorageSync("hideOfflineTips"))
      wx.showToast({
        title: '当前为离线模式',
        image: "/images/login_fail.png",
        duration: 1800,
      })
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
      confirmText: '重新启动',
      showCancel: false,
      success: function() {
        wx.reLaunch({
          url: '/pages/login/login',
        })
      }
    })
  },

  /**
   * [初始化数据]
   */
  _initData() {
    var info = wx.getStorageSync("user_info")
    var everyday_planList = wx.getStorageSync("everyday_planList")
    if (!wx.getStorageSync("user_info")){
      this.setData({
        goal_university: "未设置目标大学",
        goal_major: "未设置目标专业",
        motto: "未设置座右铭" ,
        countdown: "无",
      })
    }else{
      this.setData({
        goal_university: info.goal_university == "" ? "未设置目标大学" : info.goal_university, //目标
        goal_major: info.goal_major == "" ? "未设置目标专业" : info.goal_major, //目标
        motto: info.motto == "" ? "未设置座右铭" : info.motto, //座右铭
        countdown: (info.examDate == null || info.examDate == "") ? "无" : parseInt(dateUtil.countDownDateFromToday(info.examDate)), //倒计时天数
      })
    }
    this.setData({
      everyday_planList: everyday_planList,
      date: dateUtil.getIndexDate(), //今天的日期
      showPage: true, //显示页面
    })
    if (!wx.getStorageSync('plan_if_open_time')) {
      this.setData({
        plan_if_open_time: false,
      })
    } else {
      var plan_if_open_time = wx.getStorageSync("plan_if_open_time")
      this.setData({
        plan_if_open_time: plan_if_open_time,
      })
    }
    wx.hideLoading()
  },
  _setHideOfflineTips(data) {
    var that = this
    var storage = new Storage()
    storage.save({
      key: 'hideOfflineTips',
      data: data,
      success: function () {
        return
      },
      showRretry: true,
      retryCancel: this._saveFail
    })
  }
})