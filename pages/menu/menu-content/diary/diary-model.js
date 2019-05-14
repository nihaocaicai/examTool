import {
  Request
} from "../../../../utils/server/request.js"

var thisClass = this

class Diary {
  constructor() {
    thisClass = this
  }

  setPage(page) {
    thisClass.page = page
  }

  /**
   * [从服务器上获取今天的计划 everyday_planList]
   */
  getAllDiary(params) {
    var r = new Request()
    r.setFailInfo("diary-model.js", "getAllDiary")
    r.request({
      url: "/user/diarys/all",
      data: {
        page: params.page
      },
      success: params.success,
      fail: params.fail,
    })
  }

  /**
     * [删除考研日记]
     */
  deleteDiary(params) {
    var r = new Request()
    r.setFailInfo("diary-model.js", "deleteDiary")
    r.request({
      url: '/user/diarys/delete',
      data: {
        diary_id: params.diary_id
      },
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }

}

export {
  Diary
}