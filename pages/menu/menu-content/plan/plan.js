import {
  Plan
} from "plan-model.js"

var model = new Plan()

Page({
  data: {
    color: ['#9DD3FA', '#1F6FB5', '#FCD692', '#FAFFEB', '#FFFFFF'], //左侧边条颜色，数目无限制
    hasMorePlan: true,
    loading: true,
    showView: false,
    loadingFail: false,
    noPlan: false,
    nowPage: 1, //当前页码
  },

  onLoad: function(options) {
    this._initData()
  },

  onShareAppMessage: function() {},

  /**
   * [初始化数据]
   */
  _initData() {
    var that = this
    wx.showLoading({
      title: '玩命加载中',
    })
    model.getBeforePlan({
      data: {
        page: that.data.nowPage,
      },
      success: function(data) {
        if (data.length == 0) {
          //没数据
          that.setData({
            loading: false,
            noPlan: true,
          })
        } else {
          // 有数据
          that.setData({
            loading: false,
            showView: true,
            totalPlan: data,
            nowPage: that.data.nowPage + 1,
          })
        }
        wx.hideLoading()
      },
      fail: function() {
        that.setData({
          loading: false,
          loadingFail: true,
        })
        wx.hideLoading()
      },
    })
  },

  /**
   * [加载更早的计划]
   */
  loadMore: function() {
    var that = this
    wx.showLoading({
      title: '玩命加载中',
    })
    model.getBeforePlan({
      data: {
        page: that.data.nowPage,
      },
      success: function(data) {
        //这是还有更多的情况
        that.setData({
          loading: false,
          showView: true,
          totalPlan: data,
          nowPage: that.data.nowPage + 1,
        })
        if (false) {
          //如果没有更多了
          that.setData({
            hasMorePlan: false,
          })
        }
        wx.hideLoading()
      },
      fail: function() {
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          image: '/images/fail.png',
        })
      },
    })
  },
})