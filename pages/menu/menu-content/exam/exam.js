// pages/menu/menu-content/exam/exam.js
import {
  Exam
} from "exam-model.js"
var exam = new Exam()

Page({
  data: {
    delBtnWidth: 160,
    lastScroll: [-1, -1],
    loading: true,
  },

  onLoad: function(options) {
    exam.setPage(this)
  },

  onReady: function() {
    this.editexam = this.selectComponent("#editexam"); //获得edit组件
    exam.getAllArrangements()
  },

  //下拉添加
  onPullDownRefresh: function() {
    exam.addItem()
    wx.stopPullDownRefresh()
  },

  //点击修改
  modItem: function(e) {
    var index = e.currentTarget.dataset
    exam.modItem(index)
  },

  //点击删除
  delItem: function(e) {
    var index = e.currentTarget.dataset
    exam.delItem(index)
  },

  //修改保存
  modify_confirm: function(e) {
    exam.modify_confirm(e.detail)
  },

  //添加保存
  add_confirm: function(e) {
    exam.add_confirm(e.detail)
  },

  //点击取消按钮
  hidden_dialog: function() {
    //暂时不需要实现
  },

  //滑动组件start
  drawStart: function(e) {
    this.setData({
      startX: e.touches[0].clientX,
    })
  },

  drawMove: function(e) {
    var touch = e.touches[0]
    var item = this.data.examList[e.currentTarget.dataset.dayindex]['data'][e.currentTarget.dataset.index]
    var disX = this.data.startX - touch.clientX

    //上一个被滑出来的项目收缩回去
    if (this.data.lastScroll[0] != -1) {
      this.data.examList[this.data.lastScroll[0]]['data'][this.data.lastScroll[1]]['right'] = 0
      this.setData({
        examList: this.data.examList,
        lastScroll: [-1, -1]
      })
    }

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        isScroll: false,
        examList: this.data.examList,
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        examList: this.data.examList
      })
    }
  },

  drawEnd: function(e) {
    var item = this.data.examList[e.currentTarget.dataset.dayindex]['data'][e.currentTarget.dataset.index]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        isScroll: true,
        examList: this.data.examList,
        lastScroll: [e.currentTarget.dataset.dayindex, e.currentTarget.dataset.index]
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        examList: this.data.examList,
        lastScroll: [-1, -1]
      })
    }
  },
  //滑动组件end
})