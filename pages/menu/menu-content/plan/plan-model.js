import {
  Request
} from "../../../../utils/server/request.js"

class Plan {
  /**
   * [获取用户全部考研计划]
   * 当天以前的，不包括当天
   */
  getBeforePlan(params) {
    var r = new Request()
    r.request({
      url: "/user/plans/all/before",
      data: params.data,
      success: params.success,
      fail: params.fail,
    })
  }
}

export {
  Plan
}