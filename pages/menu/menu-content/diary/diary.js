import {
  Diary
} from "diary-model.js"

var model = new Diary()

Page({
  data: {
    loading: true,
    delBtnWidth: 160,
    lastScroll: [-1, -1],
    isScroll: true,
    windowHeight: 0,
    hasMoreDiary: true,
    nowPage: 1,
    maxItem: 10, // 加载一次显示多少条，要设置好，否则会影响点击加载更多按钮
  },

  onShow: function () {
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
            data:data,
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
            data: data,
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
  hidden_dialog: function () { },


  //添加/修改成功后执行的操作
  _successEvent(e) {
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
    var diary_id = parseInt(e.currentTarget.dataset.diary_id);
    var title = e.currentTarget.dataset.title;
    wx.showModal({
      title: '提示',
      content: '你确定要删除该日记吗？\r\n标题：' + title,
      confirmColor: '#04838e',
      success: function(res) {
        model.deleteDiary(((data) => {
          wx.showToast({
            title: '删除成功',
          })
        }),diary_id);

        that.onShow();
      }
    })

  },

  drawStart: function(e) {
    this.setData({
      startX: e.touches[0].clientX,
      startRight: this.data.data[e.currentTarget.dataset.dayindex]['data'][e.currentTarget.dataset.index]['right']
    })
  },

  drawMove: function(e) {
    var item = this.data.data[e.currentTarget.dataset.dayindex]['data'][e.currentTarget.dataset.index]
    var disX = this.data.startX - e.touches[0].clientX
    if (this.data.startRight == 0) {
      //日记项没有展开
      if (disX >= 20) {
        var lastDayIndex = this.data.lastScroll[0]
        var lastIndex = this.data.lastScroll[1]
        if (lastDayIndex != -1) {
          this.data.data[lastDayIndex]['data'][lastIndex].right = 0
          this.setData({
            isScroll: [-1, -1]
          })
        }
        if (disX > this.data.delBtnWidth) {
          disX = this.data.delBtnWidth
        }
        item.right = disX
        this.setData({
          isScroll: false,
          data: this.data.data
        })
      } else {
        item.right = 0
        this.setData({
          isScroll: true,
          data: this.data.data
        })
      }
    } else {
      //日记项已经展开
      disX = -disX
      if (disX >= 20) {
        var lastDayIndex = this.data.lastScroll[0]
        var lastIndex = this.data.lastScroll[1]
        if (lastDayIndex != -1) {
          this.data.data[lastDayIndex]['data'][lastIndex].right = 0
          this.setData({
            isScroll: [-1, -1]
          })
        }
        if (disX > this.data.delBtnWidth) {
          disX = this.data.delBtnWidth
        }
        item.right = this.data.delBtnWidth - disX
        this.setData({
          isScroll: false,
          data: this.data.data
        })
      } else {
        item.right = this.data.delBtnWidth
        this.setData({
          isScroll: true,
          data: this.data.data
        })
      }
    }
  },

  drawEnd: function(e) {
    var dayIndex = e.currentTarget.dataset.dayindex
    var index = e.currentTarget.dataset.index
    var item = this.data.data[dayIndex]['data'][index]
    if (this.data.startRight == 0) {
      //日记项没有展开
      if (item.right >= this.data.delBtnWidth / 2) {
        item.right = this.data.delBtnWidth
        this.setData({
          isScroll: true,
          data: this.data.data,
          lastScroll: [dayIndex, index]
        })
      } else {
        item.right = 0
        this.setData({
          isScroll: true,
          data: this.data.data,
        })
      }
    } else {
      //日记项已经展开
      if (item.right <= this.data.delBtnWidth / 2) {
        item.right = 0
        this.setData({
          isScroll: true,
          data: this.data.data,
          lastScroll: [-1, -1]
        })
      } else {
        item.right = this.data.delBtnWidth
        this.setData({
          isScroll: true,
          data: this.data.data,
        })
      }
    }
  },


})