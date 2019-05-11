import {
  Request
} from "../../../utils/server/request.js"

var path = "/component/editplan/editplan-model.js"

class EditPlanComponent {
  /**
   * [添加考研计划]
   * 只能添加当天的或以后日期的
   */
  addPlan(params) {
    var r = new Request()
    r.setFailInfo(path, "addPlan")
    r.request({
      url: "/user/plans/add",
      method: "POST",
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }

  /**
   * [修改考研计划]
   */
  modifyPlan(params) {
    var r = new Request()
    r.setFailInfo(path, "modifyPlan")
    r.request({
      url: "/user/plans/modify",
      method: "POST",
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }
}

export {
  EditPlanComponent
}