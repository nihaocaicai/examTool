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
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    diary.setPage(this)
    diary.getDataFromService()
  },

  onReady: function() {
    //Todo 刷新日记的显示，还没有实现
    this.diary = this.selectComponent("#diary") //获得diary组件
    this.diary.showDiary("新增日记", null); //调试方便，调试完成删除
  },

  //下拉页面操作
  onPullDownRefresh: function() {
    this.diary.showDiary();
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

  //点击修改按钮
  modItem(e) {
    var item = this.data.data[e.currentTarget.dataset.dayindex]['data'][e.currentTarget.dataset.index]
    this.diary.showDiary("修改日记", item);
  },

  //点击删除按钮
  delItem: function(e) {
    var item = this.data.data[e.currentTarget.dataset.dayindex]['data'][e.currentTarget.dataset.index]
    wx.showModal({
      title: '提示',
      content: '你确定要删除该日记吗？\n标题：' + item.diary_title,
      confirmColor: '#04838e',
      success: function(res) {
        if (res.confirm) {
          console.log("确认删除")
          //diary.deleteItem(item)
        }
      }
    })
  },

  //确认按钮
  _save() {
    this.diary.hideDiary();
  },

})