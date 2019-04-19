import {
  Diary
} from "diary-model.js"

var diary = new Diary()

Page({
  data: {
    delBtnWidth: 160,
    isScroll: true,
    windowHeight: 0,
  },

  onLoad: function(options) {
    var that = this;
    diary.setPage(this)
    diary.getDataFromService()
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight
        });
      }
    });
  },

  onReady: function() {
    //获得diary组件
    this.diary = this.selectComponent("#diary");
    this.modifydiary = this.selectComponent("#modifydiary");
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
    var item = this.data.data[e.currentTarget.dataset.dayindex]['data'][e.currentTarget.dataset.index]
    if (this.data.startRight == 0) {
      //日记项没有展开
      if (item.right >= this.data.delBtnWidth / 2) {
        item.right = this.data.delBtnWidth
        this.setData({
          isScroll: true,
          data: this.data.data,
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


  //取消事件
  //新增取消按钮
  _error() {
    this.diary.hideDiary();
  },
  //修改取消按钮
  _errorModifyDiary() {
    this.modifydiary.hideDiary();
  },

  //确认事件
  //新增确认按钮
  _success() {
    this.diary.hideDiary();
  },
  //修改确认按钮
  _successModifyDiary() {
    this.modifydiary.hideDiary();
  },

  //点击修改按钮
  modItem() {
    this.modifydiary.showDiary();
  },

  //点击删除按钮
  delItem: function() {

  },

  onPullDownRefresh: function() {
    this.diary.showDiary();
  }
})