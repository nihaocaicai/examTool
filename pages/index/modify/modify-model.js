import {
  Request
} from "../../../utils/server/request.js"

var path = "/pages/index/modify/modify-model"

class ModifyComponent {
  /**
   * [获取用户当天之后的（包括当天的）考研计划]
   */
  getAfterPlan(params) {
    var r = new Request()
    r.setFailInfo(path, "getAfterPlan")
    r.request({
      url: "/user/plans/all/after",
      data: params.data,
      success: params.success,
      fail: params.fail,
    })
  }

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
  ModifyComponent
}