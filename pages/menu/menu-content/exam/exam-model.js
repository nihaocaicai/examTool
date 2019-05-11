import {
  Request
} from "../../../../utils/server/request.js"

//var examData = require('../../../../data/local_exam_database.js')
//wx.setStorageSync("exam_arrangement", examData.examList)

class Exam {
  /**
   * [获取考研安排]
   */
  getAllArrangements(params) {
    var r = new Request()
    r.setFailInfo("exam-model.js", "getAllArrangements")
    r.request({
      url: '/user/arrangements/all',
      success: params.success,
      fail: params.fail,
    })
  }

  /**
   * [添加考研安排]
   */
  addArramgements(params) {
    var r = new Request()
    r.setFailInfo("exam-model.js", "addArramgements")
    r.request({
      url: '/user/arrangements/add',
      method: "POST",
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }

  /**
   * [修改考研安排]
   */
  modifyArrangements(params) {
    var r = new Request()
    r.setFailInfo("exam-model.js", "modifyArrangements")
    r.request({
      url: '/user/arrangements/modify',
      method: "POST",
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }

  /**
   * [删除考研安排]
   */
  deleteArrangements(params) {
    var r = new Request()
    r.setFailInfo("exam-model.js", "deleteArrangements")
    r.request({
      url: '/user/arrangements/delete',
      data: {
        arrange_id: params.id
      },
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }
}

export {
  Exam
}