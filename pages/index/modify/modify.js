import {
  Modify
} from "modify-model.js"

var model = new Modify()
var thisClass = undefined

Page({
  data: {
    delBtnWidth: 160, // 设置滑动删除、编辑的宽度
    loading: true,
    hasMorePlan: true,
    nowPage: 1,
    maxItem: 10, // 加载一次显示多少条，要设置好，否则会影响点击加载更多按钮
  },

  onLoad: function(options) {
    thisClass = this
    this._initData()
  },

  /**
   * [事件_下拉显示添加计划对话框]
   */
  onPullDownRefresh: function() {
    if (this.data.showView || this.data.noPlan) {
      if (!this.editPlan)
        this.editPlan = this.selectComponent("#editplan")

      this.editPlan.setData({
        beforeData: null,
        isModify: false,
        plan_content: "",
        plan_date: "",
        plan_start_time: "",
        plan_end_time: "",
        plan_if_repeat: false,
      })
      this.editPlan.showEdit()
    }
    wx.stopPullDownRefresh()
  },

  /**
   * [事件_点击修改按钮]
   */
  modItem: function(e) {
    var dayindex = e.currentTarget.dataset.dayindex
    var index = e.currentTarget.dataset.index
    var beforeData = this.data.planList[dayindex].data[index]

    if (!this.editPlan)
      this.editPlan = this.selectComponent("#editplan")

    this.editPlan.setData({
      beforeData: beforeData,
      isModify: true,
      plan_content: beforeData.plan_content,
      plan_date: beforeData.plan_date,
      plan_start_time: beforeData.plan_start_time,
      plan_end_time: beforeData.plan_end_time,
      plan_id: beforeData.plan_id,
      plan_if_finish: beforeData.plan_if_finish,
      plan_if_repeat: beforeData.plan_if_repeat == 0 ? false : true,
    })
    this.editPlan.showEdit()
  },

  /**
   * [事件_点击删除按钮]
   */
  delItem: function(e) {
    var dayindex = e.currentTarget.dataset.dayindex
    var index = e.currentTarget.dataset.index
    var data = this.data.planList[dayindex].data[index]

    wx.showModal({
      title: '提示',
      content: '你确定要删除这个计划吗？\r\n' + data.plan_content,
      confirmColor: '#04838e',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
          })
          model.deletePlan({
            data: {
              plan_id: data.plan_id
            },
            success: function() {
              wx.hideLoading()
              thisClass._initData()
            },
            fail: function() {
              wx.hideLoading()
              wx.showToast({
                title: '删除失败',
                image: '/images/fail.png',
                duration: 1800,
              })
            }
          })
        }
      }
    })
  },

  /**
   * [初始化数据]
   */
  _initData() {
    var that = thisClass
    wx.showLoading({
      title: '加载中',
    })
    model.getAfterPlan({
      page: that.data.nowPage,
      success: function(data) {
        if (data.length == 0) {
          //没有数据
          thisClass.setData({
            loading: false,
            loadingFail: false,
            showView: false,
            hasMorePlan: false,
            noPlan: true,
          })
        } else {
          // 有数据
          if (data.length == that.data.maxItem) {
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
          thisClass.setData({
            loading: false,
            loadingFail: false,
            showView: true,
            noPlan: false,
            planList: data,
            page: thisClass.data.page + 1
          })
        }
        wx.hideLoading()
      },
      fail: function() {
        thisClass.setData({
          loading: false,
          loadingFail: true,
          showView: false,
          hasMorePlan: false,
          noPlan: false,
        })
        wx.hideLoading()
      }
    })
  },

  /**
   * [加载更多]
   */
  loadMore: function() {
    var that = thisClass
    wx.showLoading({
      title: '加载中',
    })
    model.getAfterPlan({
      page: that.data.nowPage,
      success: function(data) {
        console.log(data)
        if (data.length == 0) {
          //没有数据
          that.setData({
            hasMorePlan: false,
          })
        } else {
          //有数据
          if (data.length == that.data.maxItem) {
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
            planList: data,
            page: that.data.nowPage + 1
          })
        }
        wx.hideLoading()
      },
      fail: function() {
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          image: "/pages/fail.png",
          duration: 1800,
        })
      }
    })
  },

  // 滑动组件start
  drawStart: function(e) {
    var touch = e.touches[0];
    // console.log(touch);
    // 最初状态，设置right的值为0，不显示滑块编辑，删除
    for (var index in this.data.planList) {
      var items = this.data.planList[index].data
      // console.log(items)
      for (var ind in items) {
        var item = items[ind]
        item.right = 0
      }
    }
    this.setData({
      planList: this.data.planList,
      startX: touch.clientX,
    })

  },
  drawMove: function(e) {
    var touch = e.touches[0]
    // 中间状态，设置right的值为滑动的值，相应显示滑块大小
    // 获得当前滑块所在的日期板块
    var dayindex = e.currentTarget.dataset.dayindex
    var items = this.data.planList[dayindex].data
    // 获得当前滑块日期下对应的时间模块
    var item = items[e.currentTarget.dataset.index]
    // console.log(item.right)
    // 设置right的值
    var disX = this.data.startX - touch.clientX
    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        isScroll: false,
        planList: this.data.planList
      })
      // console.log(this.data.planList)
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        planList: this.data.planList
      })
    }
  },
  drawEnd: function(e) {
    // 最后状态，设置right的值为滑动的值为最大，相应显示滑块大小
    var dayindex = e.currentTarget.dataset.dayindex
    var items = this.data.planList[dayindex].data
    var item = items[e.currentTarget.dataset.index]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        isScroll: true,
        planList: this.data.planList
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        planList: this.data.planList
      })
    }
  },
  // 滑动组件end
})