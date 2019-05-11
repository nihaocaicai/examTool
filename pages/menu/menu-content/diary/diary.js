import {
  Diary
} from "diary-model.js"

var model = new Diary()

Page({
  data: {
    loading: true,
    delBtnWidth: 160,
    isScroll: true,
    windowHeight: 0,
    lastScroll: [-1, -1],
  },

  onLoad: function() {
    var that = this
    model.getAllDiary(((diaryData) => {
      
      // 获取数据文件数据
      this.setData({
        data: diaryData
      });
    }));
  },

  onReady: function() {
    
  },

  onShow: function() {
    console.log(this.data)
    console.log(this.data.data)
  },
// 组件方法start
  //点击取消按钮
  hidden_dialog: function () { },


  //添加/修改成功后执行的操作
  _successEvent(e) {
    this.onLoad()
  },


// 组件方法end
  //下拉页面操作
  onPullDownRefresh: function() {
    this.selectComponent("#diary").showDiary("新增日记", null)
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

        that.onLoad();
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