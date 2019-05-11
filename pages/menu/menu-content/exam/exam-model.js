import {
  Request
} from "../../../../utils/server/request.js"

class Exam {
  /**
   * [获取考研安排]
   */
  getAllArrangements(params) {
    var r = new Request()
    r.setFailInfo("exam-model.js", "getAllArrangements")
    r.request({
      url: '/user/arrangements/all',
      data: {
        page: params.page,
      },
      success: params.success,
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
        arrange_id: params.arrange_id
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