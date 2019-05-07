import {
  Exam
} from "exam-model.js"

import {
  Storage
} from "../../../../utils/storage.js"

var model = new Exam()

Page({
  data: {
    delBtnWidth: 160,
    lastScroll: [-1, -1],
    loading: true,
  },

  onReady: function() {
    this._initData()
  },

  /* 事件响应 */
  /**
   * [事件_下拉页面]
   * 添加计划
   */
  onPullDownRefresh: function() {
    if (!this.editexam)
      this.editexam = this.selectComponent("#editexam") //获得edit组件

    this.editexam.setData({
      isModify: false,
    })
    this.editexam.showEdit()
    wx.stopPullDownRefresh()
  },

  /**
   * [事件_点击修改]
   */
  modItem: function(e) {
    var index = e.currentTarget.dataset
    var data = this.data.examList[index.dayindex]['data'][index.index]
    this.data.modify_arrangement_id = this.data.examList[index.dayindex]['data'][index.index].arrangement_id

    if (!this.editexam)
      this.editexam = this.selectComponent("#editexam") //获得edit组件

    this.editexam.setData({
      isModify: true,
      arrangement_id: data.arrangement_id,
      arrangement_content: data.arrangement_content,
      arrangement_place: data.arrangement_place,
      plan_if_prompt: data.plan_if_prompt,
      arrangement_date: data.arrangement_date,
      arrangement_time: data.arrangement_time,
      plan_if_prompt_date: data.plan_if_prompt_date,
      plan_if_prompt_time: data.plan_if_prompt_time,
    })
    this.editexam.showEdit()
  },

  /**
   * [事件_点击删除]
   */
  delItem: function(e) {
    var that = this
    var index = e.currentTarget.dataset //index: {dayindex: "0", index: "0"}
    wx.showModal({
      title: '提示',
      content: '你确定要删除这项计划吗？\r\n',
      confirmColor: "#04838e",
      success(res) {
        if (res.confirm) {
          //确认删除
          model.deleteArrangements({
            id: that.data.examList[index.dayindex]['data'][index.index].arrangement_id,
            success: function() {
              that._removeItemFromList(index.dayindex, index.index)
            },
            statusCodeFail: function() {
              wx.hideLoading()
              that._errorServer()
            },
            fail: function() {
              wx.hideLoading()
              that.isOffline()
            }
          })
        }
      }
    })
  },

  /**
   * [事件_修改对话框_确定]
   */
  modify_confirm: function(e) {
    var formData = e.detail
    formData.arrangement_id = this.data.modify_arrangement_id
    console.log("修改")
    console.log(formData)
  },

  /**
   * [事件_添加对话框_确定]
   */
  add_confirm: function(e) {
    var formData = e.detail
    console.log(formData)
    console.log("添加")
    console.log(formData)
  },

  /**
   * [事件_对话框_取消]
   */
  hidden_dialog: function() {
    //暂时不需要实现
  },

  /**
   * [初始化数据]
   */
  _initData() {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    model.getAllArrangements({
      success: function(data) {
        var saveData = data
        var s = new Storage()
        s.save({
          key: 'exam_arrangement',
          data: saveData, //保存服务器获取到的数据到微信缓存
          success: function() {
            that._getArrangementFromStorage()
          },
          fail: function() {
            that._getArrangementFromStorage(true)
          },
        })
      },
      fail: function() {
        that._getArrangementFromStorage(true)
      },
    })
  },

  /**
   * [从缓存读取信息]
   */
  _getArrangementFromStorage(isOffline) {
    var arrangements = wx.getStorageSync('exam_arrangement')
    if (arrangements != undefined) {
      this.setData({
        examList: arrangements,
        showView: arrangements.length != 0,
        loading: false,
      })
    }
    wx.hideLoading()
    if (isOffline) {
      if (!wx.getStorageSync('hideOfflineTips')) {
        wx.showToast({
          title: '当前为离线模式',
          image: "/images/login_fail.png",
          duration: 1800,
        })
      }
    }
  },

  /**
   * [从列表中移除指定的项目]
   */
  _removeItemFromList(dayindex, index) {
    var that = this
    var newList = that.data.examList
    newList[dayindex].data.splice(index, 1) //删除制定项目
    if (newList[dayindex].data.length == 0) {
      //如果删除项目后该日期的数组长度为，移除该日期
      newList.splice(dayindex, 1)
    }
    var s = new Storage()
    s.save({
      key: 'exam_arrangement',
      data: newList, //新的列表
      success: function() {
        that.setData({
          examList: wx.getStorageSync('exam_arrangement'),
          lastScroll: [-1, -1], //重设上一个滑出的项
        })
        wx.hideLoading()
      },
      fail: function() {
        that._errorSave()
        wx.hideLoading()
      },
    })
  },

  /**
   * [服务器错误提示]
   */
  _errorServer() {
    wx.showModal({
      title: '提示',
      content: '服务器出错，请稍后重试',
      showCancel: false,
      confirmColor: "#04838e",
    })
  },

  /**
   * [离线错误提示]
   * type: 操作类型
   */
  _isOffline(type) {
    wx.showModal({
      title: '提示',
      content: '当前为离线模式，不能进行' + type + '操作',
      showCancel: false,
      confirmColor: "#04838e",
    })
  },

  /**
   * [信息保存失败提示]
   */
  _errorSave() {
    wx.showModal({
      title: '提示',
      content: '操作失败,请稍后重试',
      showCancel: false,
      confirmColor: "#04838e",
    })
  },

  /* 滑动组件*/
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
    }
  },
  /* 滑动组件end*/
})