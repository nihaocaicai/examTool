import {
  Diary
} from "diary-model.js"

var diaryUtil = new Diary()

Page({
  data: {
    loading: true,
    delBtnWidth: 160,
    isScroll: true,
    windowHeight: 0,
    lastScroll: [-1, -1],
    //data: 要显示的数据，在 diaryUtil 中设置
  },

  onLoad: function(options) {
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    diaryUtil.setPage(that)
  },

  onReady: function() {
    diaryUtil.getDataFromService()
  },

  onShow: function() {
    //Todo 刷新日记的显示，还没有实现
  },

  //下拉页面操作
  onPullDownRefresh: function() {
    this.selectComponent("#diary").showDiary("新增日记", null);
  },

  //点击修改按钮
  modItem(e) {
    var dayIndex = e.currentTarget.dataset.dayindex
    var index = e.currentTarget.dataset.index
    var item = this.data.data[dayIndex]['data'][index]
    this.setData({
      modifyIndex: [dayIndex, index]
    })
    this.selectComponent("#diary").showDiary("修改日记", item);
  },

  //添加成功后执行的操作
  add_confirm(e) {
    diaryUtil.add_confirm(e)
  },

  //修改成功后执行的操作
  modify_confirm(e) {
    diaryUtil.modify_confirm(e)
  },

  //点击删除按钮
  delItem: function(e) {
    var dayIndex = e.currentTarget.dataset.dayindex
    var index = e.currentTarget.dataset.index
    var item = this.data.data[dayIndex]['data'][index]
    var itemID = item.diary_id
    wx.showModal({
      title: '提示',
      content: '你确定要删除该日记吗？\r\n标题：' + item.diary_title,
      confirmColor: '#04838e',
      success: function(res) {
        if (res.confirm) {
          diaryUtil.del(dayIndex, index, itemID);
        }
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