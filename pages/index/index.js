var app = getApp()
var util_date = require('../utils/date.js')

Page({
  data: {
    goal: app.globalData.goal, //目标
    motto: app.globalData.motto, //座右铭
    countdown: util_date.countdown, //倒计时天数
    date: util_date.date, //今天的日期
    plan: [], //计划列表
  },

  onReady: function() {
    this.diary = this.selectComponent("#diary") //获得diary组件
    this.getPlan() //获取计划
  },

  //获取计划
  getPlan: function() {
    var plans
    //Todo 获取计划（应该由网络获取）
    plans = [{
      "content": "1、早上：8:00-10:30 记一单元单词",
      flag_star: true,
    }, {
      "content": "2、下午：14:00-17:30 学习数学理论",
      flag_star: false,
      }, {
        "content": "2、下午：14:00-17:30 学习数学理论",
        flag_star: false,
      }, {
        "content": "2、下午：14:00-17:30 学习数学理论",
        flag_star: false,
      }, {
        "content": "2、下午：14:00-17:30 学习数学理论",
        flag_star: false,
      }, {
        "content": "2、下午：14:00-17:30 学习数学理论",
        flag_star: false,
      }, {
        "content": "2、下午：14:00-17:30 学习数学理论",
        flag_star: false,
      }, {
        "content": "2、下午：14:00-17:30 学习数学理论",
        flag_star: false,
      }, {
        "content": "2、下午：14:00-17:30 学习数学理论",
        flag_star: false,
      }, {
        "content": "2、下午：14:00-17:30 学习数学理论",
        flag_star: false,
      }, {
        "content": "2、下午：14:00-17:30 学习数学理论",
        flag_star: false,
      }]
    //Todo
    this.setData({
      plan: plans
    })
  },

  //点击 星标按钮
  clickStar(e) {
    // 计划下标，从0开始
    var index = e.currentTarget.dataset.index
    // 获取计划列表
    var plans = this.data.plan
    var flag = plans[index]['flag_star'] // 获取星标状态
    plans[index]['flag_star'] = !flag //修改对应计划的星标状态
    //设置新的列表
    this.setData({
      plan: plans
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
    this.diary.showDiary();
  },

  //回调 取消事件
  _error() {
    console.log('你点击了取消');
    this.diary.hideDiary();
  },
  //回调 确认事件
  _success() {
    console.log('你点击了确定');
    this.diary.hideDiary();
  },

})