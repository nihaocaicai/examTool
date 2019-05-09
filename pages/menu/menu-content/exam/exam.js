import {
  ExamComponent
} from "exam-model.js"

import {
  Storage
} from "../../../../utils/storage.js"

var model = new ExamComponent()

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
      arrange_if_prompt: data.arrange_if_prompt,
      arrange_if_prompt_date: data.arrange_if_prompt ? data.arrange_if_prompt_date : "",
      arrange_if_prompt_time: data.arrange_if_prompt ? data.arrange_if_prompt_time : "",
    })
    this.editexam.showEdit()
  },

  /**
   * [事件_添加对话框_确定]
   */
  add_confirm: function(e) {
    var that = this
    var formData = e.detail
    model.addArramgements({
      data: formData,
      success: function() {
        //添加成功
        //重新从服务器拉取信息
        model.getAllArrangements({
          success: function(data) {
            //写入缓存
            var s = new Storage()
            s.save({
              key: 'exam_arrangement',
              data: data,
              success: function() {
                that.setData({
                  examList: data,
                })
                wx.hideLoading()
                that.editexam.hideEdit()
                wx.showToast({
                  title: '添加成功',
                  duration: 1800,
                })
              },
              fail: function() {
                wx.hideLoading()
                that._errorSave()
              },
            })
          },
        })
      },
      statusCodeFail: function() {
        wx.hideLoading()
        that._errorServer()
      },
      fail: function() {
        wx.hideLoading()
        that._isOffline("添加")
      }
    })
  },

  /**
   * [事件_点击删除]
   */
  delItem: function(e) {
    var that = this
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
            id: that.data.examList[index.dayindex]['data'][index.index].arrange_id,
            success: function() {
              var newList = that.data.examList
              newList[index.dayindex].data.splice(index.index, 1) //删除指定项目
              if (newList[index.dayindex].data.length == 0) {
                //如果删除项目后该日期的数组长度为，移除该日期
                newList.splice(index.dayindex, 1)
              }
              var s = new Storage()
              s.save({
                key: 'exam_arrangement',
                data: newList, //新的列表
                success: function() {
                  that.setData({
                    examList: newList,
                    lastScroll: [-1, -1], //重设上一个滑出的项
                  })
                  if (newList.length == 0) {
                    //没有数据了，要设置提示
                    that.setData({
                      showView: false,
                    })
                  }
                  wx.hideLoading()
                  wx.showToast({
                    title: '删除成功',
                    duration: 1800,
                  })
                },
                fail: function() {
                  wx.hideLoading()
                  that._errorSave()
                },
              })
            },
            statusCodeFail: function() {
              wx.hideLoading()
              that._errorServer()
            },
            fail: function() {
              wx.hideLoading()
              that._isOffline("删除")
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
    var formData = e.detail //修改后的数据
    var that = this
    wx.showLoading({
      title: '修改中',
    })
    model.modifyArrangements({
      data: formData,
      success: function() {
        //先收缩上一个被划出的项目
        that.data.examList[that.data.lastScroll[0]]['data'][that.data.lastScroll[1]].right = 0
        that.setData({
          examList: that.data.examList
        })

        var index = that.data.modifyIndex
        var newList = that.data.examList
        if (formData.arrange_date == newList[index.dayindex]['data'][index.index].arrange_date) {
          //时间没变，直接修改
          newList[index.dayindex]['data'][index.index] = formData
          newList[index.dayindex]['data'] = that._sort(1, newList[index.dayindex]['data']) // 排序 newList[index.dayindex]['data']
        } else {
          //考研时间变了，需要移动时间
          //从列表中删除原来的项
          newList[index.dayindex]['data'].splice(index.index, 1)
          if (newList[index.dayindex]['data'].length == 0) {
            //删除后当天日期不存在内容了，要把这一天的项目一同删掉
            newList.splice(index.dayindex, 1)
          }
          var dayindex = -1
          for (var i in newList) {
            if (formData.arrange_date == newList[i].date) {
              //如果修改后的时间在列表里面有，就结束循环
              dayindex = i
              break
            }
          }
          if (dayindex == -1) {
            //不存在日期，需要重新建一个新的
            newList.push({
              date: formData.arrange_date,
              data: [formData],
            })
            newList = that._sort(0, newList) //排序 newList
          } else {
            //存在日期，直接往里面添加
            newList[dayindex]['data'].push(formData)
            newList[dayindex]['data'] = that._sort(1, newList[dayindex]['data']) //排序  newList[dayindex]['data']
          }
        }

        //服务器修改成功，写入缓存
        var s = new Storage()
        s.save({
          key: 'exam_arrangement',
          data: newList,
          success: function() {
            that.setData({
              examList: newList,
              modifyIndex: {}, //修改完成，清空下标
            })
            wx.hideLoading()
            that.editexam.hideEdit()
            wx.showToast({
              title: '修改成功',
              duration: 1800,
            })
          },
          fail: function() {
            wx.hideLoading()
            that._errorSave()
          },
        })
      },
      statusCodeFail: function() {
        wx.hideLoading()
        that._errorServer()
      },
      fail: function() {
        wx.hideLoading()
        that._isOffline("修改")
      }
    })
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
      title: '拼命加载中',
    })
    model.getAllArrangements({
      success: function(data) {
        var s = new Storage()
        s.save({
          key: 'exam_arrangement',
          data: data, //保存服务器获取到的数据到微信缓存
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
    if (isOffline && !wx.getStorageSync('hideOfflineTips')) {
      wx.showToast({
        title: '当前为离线模式',
        image: "/images/login_fail.png",
        duration: 1800,
      })
    }
  },

  /**
   * [服务器错误提示]
   */
  _errorServer() {
    wx.showModal({
      title: '提示',
      content: '服务器出错，请稍后重试',
      showCancel: false,
      confirmText: '好的',
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
      confirmText: '知道了',
      confirmColor: "#04838e",
    })
  },

  /**
   * [信息保存失败提示]
   */
  _errorSave() {
    wx.showModal({
      title: '提示',
      content: '数据已经保存到服务器，但保存到本地失败，可能是手机空间不足，请尝试清理一下手机空间后，重新进入考研小神器试试',
      confirmText: '好的',
      showCancel: false,
      confirmColor: "#04838e",
    })
  },

  /**
   * [按时间排序安排]
   * 
   * type = 1: 排序 exam_arrangement
   * 
   * type = 2: 排序某一天日期的数据
   * 
   * index = {dayindex, index} 修改的日期下标和数据下标
   *
   */
  _sort(type, list, index) {
    if (type == 0) {
      list.sort(function(a, b) {
        var a1 = new Date(a.date).getTime()
        var b1 = new Date(b.date).getTime()
        if (a1 < b1)
          return -1
        else if (a1 > b1)
          return 1
        return 0
      })
      return list
    } else if (type == 1) {
      list.sort(function(a, b) {
        var a1 = new Date(a.arrange_date + " " + a.arrange_time).getTime()
        var b1 = new Date(b.arrange_date + " " + b.arrange_time).getTime()
        if (a1 < b1)
          return -1
        else if (a1 > b1)
          return 1
        return 0
      })
      return list
    }
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
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        examList: this.data.examList,
        lastScroll: [-1, -1],
      })
    }
  },
  /* 滑动组件end*/

  /**
   * [被弃用的方法]
   * 这个方法是在添加计划后本地添加到列表中，而不是从服务器重新拉取
   *
  __desperateAddSuccess(){
    var dateTag = new Date(formData.arrange_date).getTime() //需要插入的日期
    var dayindex = -1

    for (var i in newList) {
      var nowDate = new Date(newList[i].date).getTime() //当前正在遍历的日期
      //日期升序才可以这么用
      if (dateTag > nowDate) {
        if (dateTag == nowDate) {
          //存在日期，获取下标
          dayindex = i
          break
        } else {
          //继续遍历
          continue
        }
      } else {
        //需要插入的日期小于当前正在遍历的日期，还是没有，就是没有了
        break
      }
    }
    if (dayindex == -1) {
      //原来列表没有该日期，需要新建
      newList.push({
        date: formData.arrange_date,
        data: [formData]
      })
      newList = that._sort(0, newList) //排序 newList
    } else {
      //存在日期，直接往里面添加
      newList[dayindex]['data'].push(formData)
      newList[dayindex]['data'] = that._sort(1, newList[dayindex]['data']) //排序  newList[dayindex]['data']
    }
  },*/
})