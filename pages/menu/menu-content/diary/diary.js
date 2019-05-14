import {
  Diary
} from "diary-model.js"

var model = new Diary()
var thisClass = null

Page({
  data: {
    delBtnWidth: 160,
    lastScroll: [-1, -1],
    loading: true,
    loadingFail: false,
    isScroll: true,
    windowHeight: 0,
    hasMoreDiary: true,
    nowPage: 1,
    maxItem: 10, // 加载一次显示多少条，要设置好，否则会影响点击加载更多按钮
  },

  onShow: function () {
    thisClass = this
    this._initData();
  },

  /**
 * [初始化数据]
 */
  _initData() {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    model.getAllDiary({
      page: 1,
      success: function (data) {
        if (data.length == 0) {
          //没有数据
          that.setData({
            loading: false,
            loadingFail: false,
            showView: false,
            hasMoreDiary: false,
            noDiary: true,
          })
        } else {
          // 有数据
          var length = 0
          for (var i in data) {
            length += data[i].data.length
          }
          if (length == that.data.maxItem) {
            //还有更多计划
            that.setData({
              hasMoreDiary: true,
            })
          } else {
            //没有更多计划
            that.setData({
              hasMoreDiary: false,
            })
          }
          that.setData({
            loading: false,
            loadingFail: false,
            showView: true,
            noDiary: false,
            diaryList:data,
            nowPage: 2
          })
        }
        wx.hideLoading()
      },
      fail: function () {
        that.setData({
          loading: false,
          loadingFail: true,
          showView: false,
          hasMorePlan: false,
          noDiary: false,
        })
        wx.hideLoading()
      }
    })
  },

  /**
   * [加载更多]
   */
  loadMore: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    model.getAllDiary({
      page: that.data.nowPage,
      success: function (data) {
        if (data.length == 0) {
          //没有数据
          that.setData({
            hasMoreDiary: false,
          })
        } else {
          //有数据
          var length = 0
          for (var i in data) {
            length += data[i].data.length
          }
          if (length == that.data.maxItem * that.data.nowPage) {
            //还有更多计划
            that.setData({
              hasMoreDiary: true,
            })
          } else {
            //没有更多计划
            that.setData({
              hasMoreDiary: false,
            })
          }
          that.setData({
            diaryList: data,
            nowPage: that.data.nowPage + 1
          })
        }
        wx.hideLoading()
      },
      fail: function () {
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          image: "/pages/fail.png",
          duration: 1800,
        })
      }
    })
  },


// 组件方法start
  //点击取消按钮
  hidden_dialog: function () {
    return
  },


  //添加/修改成功后执行的操作
  _successEvent:function() {
    this.onShow()
  },

// 组件方法end
  //下拉页面操作
  onPullDownRefresh: function() {
    this.selectComponent("#diary").showDiary("新增日记",null)
    wx.stopPullDownRefresh()
  },


  //点击修改按钮
  modItem(e) {
    var item = {
      diary_id : parseInt(e.currentTarget.dataset.diary_id),
      title : e.currentTarget.dataset.title,
      content : e.currentTarget.dataset.content,
      date : e.currentTarget.dataset.date,
      time : e.currentTarget.dataset.time,
      place: e.currentTarget.dataset.place,
    }
    // console.log(item)
    this.selectComponent("#diary").showDiary("修改日记", item);
  },

  //点击删除按钮
  delItem: function(e) {
    var that = this;
    var title = e.currentTarget.dataset.title;
    wx.showModal({
      title: '提示',
      content: '你确定要删除该日记吗？\r\n标题：' + title,
      confirmColor: '#04838e',
      success(res) {
        if (res.confirm) {
          //确认删除
          wx.showLoading({
            title: '删除中',
          })
          model.deleteDiary({
            diary_id: parseInt(e.currentTarget.dataset.diary_id),
            success: function () {
              wx.hideLoading()
              that.onShow()
            },
            statusCodeFail: function () {
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '服务器出错，请稍后重试',
                showCancel: false,
                confirmText: '好的',
                confirmColor: "#04838e",
              })
            },
            fail: function () {
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

  /* 滑动组件*/
  drawStart: function (e) {
    var touch = e.touches[0];
    // 最初状态，设置right的值为0，不显示滑块编辑，删除
    for (var index in this.data.diaryList) {
      var items = this.data.diaryList[index].data
      for (var ind in items) {
        var item = items[ind]
        item.right = 0
      }
    }
    this.setData({
      diaryList: this.data.diaryList,
      startX: touch.clientX,
    })
  },

  drawMove: function (e) {
    var touch = e.touches[0]
    // 中间状态，设置right的值为滑动的值，相应显示滑块大小
    // 获得当前滑块所在的日期板块
    var dayindex = e.currentTarget.dataset.dayindex
    var items = this.data.diaryList[dayindex].data
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
        diaryList: this.data.diaryList
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        diaryList: this.data.diaryList
      })
    }
  },
  drawEnd: function (e) {
    // 最后状态，设置right的值为滑动的值为最大，相应显示滑块大小
    var dayindex = e.currentTarget.dataset.dayindex
    var items = this.data.diaryList[dayindex].data
    var item = items[e.currentTarget.dataset.index]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        isScroll: true,
        diaryList: this.data.diaryList
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        diaryList: this.data.diaryList
      })
    }
  },
  /* 滑动组件end*/


})