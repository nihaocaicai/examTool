import {
  Plan
} from "plan-model.js"

var model = new Plan()
var thisClass = null

Page({
  data: {
    color: ['#9DD3FA', '#1F6FB5', '#FCD692', '#FAFFEB', '#FFFFFF'], //左侧边条颜色，数目无限制
    loading: true,
    loadingFail: false,
    showView: false,
    hasMorePlan: true,
    noPlan: false,
    nowPage: 1,
    maxItem: 10, // 加载一次显示多少条，要设置好，否则会影响点击加载更多按钮
  },

  onLoad: function(options) {
    thisClass = this
    this._initData()
  },

  onShareAppMessage: function() {},

  /**
   * [初始化数据]
   */
  _initData() {
    var that = thisClass
    wx.showLoading({
      title: '加载中',
    })
    model.getBeforePlan({
      page: 1,
      success: function(data) {
        if (data.length == 0) {
          //没数据
          that.setData({
            loading: false,
            loadingFail: false,
            showView: false,
            hasMorePlan: false,
            noPlan: true,
          })
        } else {
          // 有数据
          var length = 0
          for (var i in data) {
            for (var j in data[i].data) {
              length += data[i].data[j]['plan'].length
            }
          }
          if (length == that.data.maxItem) {
            //还有更多计划
            that.setData({
              hasMorePlan: true,
            })
          } else {
            //没有更多计划
            that.setData({
              hasMorePlan: false,
            })
          }
          that.setData({
            loading: false,
            loadingFail: false,
            showView: true,
            noPlan: false,
            totalPlan: data,
            nowPage: 2,
          })
        }
        wx.hideLoading()
      },
      fail: function() {
        that.setData({
          loading: false,
          loadingFail: true,
          showView: false,
          hasMorePlan: false,
          noPlan: false,
        })
        wx.hideLoading()
      },
    })
  },

  /**
   * [加载更早的计划]
   */
  loadMore: function() {
    var that = thisClass
    wx.showLoading({
      title: '加载中',
    })
    model.getBeforePlan({
      page: that.data.nowPage,
      success: function(data) {
        if (data.length == 0) {
          //没数据
          that.setData({
            loading: false,
            loadingFail: false,
            showView: true,
            hasMorePlan: false,
            noPlan: false,
          })
        } else {
          // 有数据
          var length = 0
          for (var i in data) {
            for (var j in data[i].data) {
              length += data[i].data[j]['plan'].length
            }
          }
          if (length == that.data.maxItem * that.data.nowPage) {
            //还有更多计划
            that.setData({
              hasMorePlan: true,
            })
          } else {
            //没有更多计划
            that.setData({
              hasMorePlan: false,
            })
          }
          that.setData({
            loading: false,
            loadingFail: false,
            showView: true,
            noPlan: false,
            totalPlan: data,
            nowPage: that.data.nowPage + 1,
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