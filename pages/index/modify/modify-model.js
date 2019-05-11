import {
  Request
} from "../../../utils/server/request.js"

var path = "/pages/index/modify/modify-model"

class Modify {
  /**
   * [获取用户当天之后的（包括当天的）考研计划]
   */
  getAfterPlan(params) {
    var r = new Request()
    r.setFailInfo(path, "getAfterPlan")
    r.request({
      url: "/user/plans/all/after",
      data: {
        page: params.page
      },
      success: params.success,
      fail: params.fail,
    })
  }

  /**
   * [删除考研计划]
   * 参数为计划 ID
   */
  deletePlan(params) {
    var r = new Request()
    r.setFailInfo(path, "deletePlan")
    r.request({
      url: "/user/plans/delete",
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }
}

export {
  Modify
}