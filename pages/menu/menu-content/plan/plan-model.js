import {
  Request
} from "../../utils/server/request.js"

class PlanComponent {
  /**
   * [获取用户全部考研计划]
   * 当天以前的，不包括当天
   */
  getBeforePlan(params) {
    var r = new Request()
    r.request({
      url: "/user/plan/all/before",
      success:params.success,
      statusCodeFail: params.statusCodeFail,
      fail:params.fail,
    })

  }
  /**
   * [获取用户全部考研计划]
   * 当天之后的，包括当天的
   */
  getAfterPlan(params) {
    var r = new Request()
    r.request({
      url: "/user/plan/all/after",
      success:params.success,
      statusCodeFail: params.statusCodeFail,
      fail:params.fail,
    })
  }
}

export {
  PlanComponent
}