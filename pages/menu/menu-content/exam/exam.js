import {
  Exam
} from "exam-model.js"

var model = new Exam()
var thisClass = null

Page({
  data: {
    delBtnWidth: 160,
    lastScroll: [-1, -1],
    loading: true,
    loadingFail: false,
    showView: false,
    hasMoreArrangements: false,
    noArrangement: true,
    nowPage: 1,
    maxItem: 10, // 加载一次显示多少条，要设置好，否则会影响点击加载更多按钮
  },

  onReady: function() {
    thisClass = this
    this._initData()
  },

  /* 事件响应 */
  /**
   * [事件_下拉页面]
   * 添加安排
   */
  onPullDownRefresh: function() {
    if (!this.data.loading) {
      if (!this.editexam)
        this.editexam = this.selectComponent("#editexam") //获得edit组件

      this.editexam.setData({
        isModify: false,
      })
      this.editexam.showEdit()
    }
    wx.stopPullDownRefresh()
  },

  /**
   * [事件_点击修改]
   */
  modItem: function(e) {
    var index = e.currentTarget.dataset
    var data = this.data.examList[index.dayindex]['data'][index.index]
    this.data.modify_arrange_id = this.data.examList[index.dayindex]['data'][index.index].arrange_id
    this.setData({
      modifyIndex: index,
    })

    if (!this.editexam)
      this.editexam = this.selectComponent("#editexam") //获得edit组件
    this.editexam.setData({
      isModify: true,
      beforeData: data, //原始信息，用于判断是否修改过信息
      arrange_id: data.arrange_id,
      arrange_content: data.arrange_content,
      arrange_place: data.arrange_place,
      arrange_date: data.arrange_date,
      arrange_time: data.arrange_time,
      arrange_if_prompt: data.arrange_if_prompt == 1,
      arrange_if_prompt_date: data.arrange_if_prompt == 1 ? data.arrange_if_prompt_date : "",
      arrange_if_prompt_time: data.arrange_if_prompt == 1 ? data.arrange_if_prompt_time : "",
    })
    this.editexam.showEdit()
  },

  /**
   * [事件_点击删除]
   */
  delItem: function(e) {
    var that = thisClass
    var index = e.currentTarget.dataset //index: {dayindex: "0", index: "0"}
    wx.showModal({
      title: '提示',
      content: '你确定要删除这项计划吗？\r\n' + that.data.examList[index.dayindex]['data'][index.index].arrange_content,
      confirmColor: "#04838e",
      success(res) {
        if (res.confirm) {
          //确认删除
          wx.showLoading({
            title: '删除中',
          })
          model.deleteArrangements({
            arrange_id: that.data.examList[index.dayindex]['data'][index.index].arrange_id,
            success: function() {
              wx.hideLoading()
              that._initData()
            },
            statusCodeFail: function() {
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '服务器出错，请稍后重试',
                showCancel: false,
                confirmText: '好的',
                confirmColor: "#04838e",
              })
            },
            fail: function() {
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '删除失败，请检查网络连接是否正常',
                showCancel: false,
                confirmText: '知道了',
                confirmColor: "#04838e",
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
    model.getAllArrangements({
      page: 1,
      success: function(data) {
        if (data.length == 0) {
          // 没有安排
          that.setData({
            loading: false,
            loadingFail: false,
            showView: false,
            hasMoreArrangements: false,
            noArrangement: true,
          })
        } else {
          // 有安排
          var length = 0
          for (var i in data) {
            length += data[i].data.length
          }
          if (length == that.data.maxItem) {
            //还有更多安排
            that.setData({
              hasMoreArrangements: true,
            })
          } else {
            //没有更多安排
            that.setData({
              hasMoreArrangements: false,
            })
          }
          that.setData({
            loading: false,
            loadingFail: false,
            showView: true,
            noArrangement: false,
            examList: data,
            nowPage: 2,
          })
        }
        wx.hideLoading()
      },
      fail: function() {
        // 加载失败
        that.setData({
          loading: false,
          loadingFail: true,
          showView: false,
          hasMoreArrangements: false,
          noArrangement: false,
          examList: [],
        })
        wx.hideLoading()
      },
    })
  },

  /**
   * [加载更多]
   */
  loadMore() {
    var that = thisClass
    wx.showLoading({
      title: '加载中',
    })
    model.getAllArrangements({
      page: that.data.nowPage,
      success: function(data) {
        if (data.length == 0) {
          // 没有更多安排了
          that.setData({
            loading: false,
            loadingFail: false,
            showView: true,
            hasMoreArrangements: false,
            noArrangement: false,
          })
        } else {
          // 有安排
          var length = 0
          for (var i in data) {
            length += data[i].data.length
          }
          if (length == that.data.maxItem * that.data.nowPage) {
            //还有更多安排
            that.setData({
              hasMoreArrangements: true,
            })
          } else {
            //没有更多安排
            that.setData({
              hasMoreArrangements: false,
            })
          }
          that.setData({
            loading: false,
            loadingFail: false,
            showView: true,
            noArrangement: false,
            examList: data,
            nowPage: that.data.nowPage + 1
          })
        }
        wx.hideLoading()
      },
      fail: function() {
        // 加载失败
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          image: "/images/fail.png",
        })
      },
    })
  },

  /* 滑动组件*/
  drawStart: function(e) {
    var touch = e.touches[0];
    // 最初状态，设置right的值为0，不显示滑块编辑，删除
    for (var index in this.data.examList) {
      var items = this.data.examList[index].data
      for (var ind in items) {
        var item = items[ind]
        item.right = 0
      }
    }
    this.setData({
      examList: this.data.examList,
      startX: touch.clientX,
    })
  },

  drawMove: function (e) {
    var touch = e.touches[0]
    // 中间状态，设置right的值为滑动的值，相应显示滑块大小
    // 获得当前滑块所在的日期板块
    var dayindex = e.currentTarget.dataset.dayindex
    var items = this.data.examList[dayindex].data
    // 获得当前滑块日期下对应的时间模块
    var item = items[e.currentTarget.dataset.index]
    // 设置right的值
    var disX = this.data.startX - touch.clientX
    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        isScroll: false,
        examList: this.data.examList
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        examList: this.data.examList
      })
    }
  },
  drawEnd: function (e) {
    // 最后状态，设置right的值为滑动的值为最大，相应显示滑块大小
    var dayindex = e.currentTarget.dataset.dayindex
    var items = this.data.examList[dayindex].data
    var item = items[e.currentTarget.dataset.index]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        isScroll: true,
        examList: this.data.examList
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        examList: this.data.examList
      })
    }
  },
  /* 滑动组件end*/
})