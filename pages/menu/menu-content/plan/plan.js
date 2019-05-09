var app = getApp()
var testData = require('../../../../data/testData.js') //测试数据

Page({
  /**
   * 页面的初始数据
   */
  data: {
    color: ['#9DD3FA', '#1F6FB5', '#FCD692', '#FAFFEB', '#FFFFFF'], //左侧边条颜色，数目无限制
    totalPlan: [],
    hasMorePlan: true
  },

  onLoad: function(options) {
    this._init()
  },

  onShow: function() {},

  onShareAppMessage: function() {},

  /**
   * [初始化数据]
   */
  _init(){
    this.setData({
      totalPlan: testData.plan
    })
  },

  /**
   * [加载更早的计划]
   */
  loadMore: function () {
    //如果还有计划就加载，没有就不加载
    if (this.data.hasMorePlan) {
      var that = this
      wx.showLoading({
        title: '玩命加载中',
      })
      //Todo 加载计划列表
      setTimeout(function () {
        var newPlans = testData.morePlan
        var setPlan = that.data.totalPlan
        
        for (var i in newPlans) {
          setPlan.push(newPlans[i])
        }
        //如果没有更多计划了，就设置flag
        if (true) {
          that.setData({
            hasMorePlan: false,
          })
        }
        that.setData({
          totalPlan: setPlan,
        })
        wx.hideLoading()
      }, 500)
    }

  },
})