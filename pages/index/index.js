import {
  DateUtil
} from "../../utils/DateUtil.js";
var app = getApp()
var dateUtil = new DateUtil()

Page({
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取数据文件数据
    this.setData({
      everyday_planList: wx.getStorageSync("everyday_planList")
    })
  },

  onReady: function() {
    this.diary = this.selectComponent("#diary") //获得diary组件
  },

  onShow: function() {
    var info = wx.getStorageSync("user_info")
    this.setData({
      goal_university: info.goal_university == "" ? "未设置目标大学" : info.goal_university, //目标
      goal_major: info.goal_major == "" ? "未设置目标专业" : info.goal_major, //目标
      motto: info.motto == "" ? "未设置座右铭" : info.motto, //座右铭
      countdown: info.examDate == null ? "无" : parseInt(dateUtil.countDownFromToday(info.examDate)), //倒计时天数
      date: dateUtil.getIndexDate(), //今天的日期
    })
  },

  //点击 星标按钮
  clickStar: function(e) {
    // 计划下标，从0开始
    var index = e.currentTarget.dataset.index
    // 获取计划列表
    var plans = this.data.everyday_planList
    var flag = plans.data[index].plan_if_finish // 获取星标状态
    plans.data[index].plan_if_finish = !flag //修改对应计划的星标状态
    //设置新的列表
    this.setData({
      everyday_planList: plans
    })
  },

  //点击 修改按钮
  goToModify() {
    wx.navigateTo({
      url: '../index/modify/modify',
    })
  },

  /* 考研小日志 diary 对话框 */
  //显示对话框事件
  showDiary() {
    this.diary.showDiary("新增日记", null);
  },

  //回调 确认事件
  add_confirm() {
    wx.showModal({
      title: '提示',
      content: '日记添加成功！',
      confirmColor: '#04838e',
      showCancel: false,
    })
  },

  // 展示所有的日志，跳转到菜单页面的考研日志
  showAllDiary() {
    wx.navigateTo({
      url: '../menu/menu-content/diary/diary',
    })
  }

})