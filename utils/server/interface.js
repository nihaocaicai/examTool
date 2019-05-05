var url = "http://127.0.0.1:8080/examTool"

var interfaces = {
  /* 用户登录 */
  getToken: { //获取token(*)
    url: "/user/token",
    method: "GET",
    statusCode: 200,
  },

  /* 用户信息 */
  getInfo: { //获取用户设置的基本信息(*)
    url: "/user/info/show",
    method: "GET",
    statusCode: 200,
  },
  modifyInfo: { //更新用户填写的信息(*)
    url: "/user/info/modify",
    method: "POST",
    statusCode: 202,
  },
  deleteInfo: { //删除用户数据库所有信息
    url: "/user/info/delete",
    method: "GET",
    statusCode: 204,
  },

  /* 用户考研计划 */
  getBeforePlan: { //获取用户全部考研计划（当天以前的，不包括当天）
    url: "/user/plan/all/before",
    method: "GET",
    statusCode: 200,
  },
  getAfterPlan: { //获取用户全部考研计划（当天之后的，包括当天的）
    url: "/user/plan/all/after",
    method: "GET",
    statusCode: 200,
  },
  getTodayPlan: { //获取用户全部考研计划（当天的）(*)
    url: "/user/plans/all/intraday",
    method: "GET",
    statusCode: 200,
  },
  addPlan: { //添加考研计划（只能添加当天的或以后日期的）
    url: "/user/plans/add",
    method: "POST",
    statusCode: 201,
  },
  modifyPlan: { //修改考研计划
    url: "/user/plans/modify",
    method: "POST",
    statusCode: 202,
  },
  deletePlan: { //删除考研计划，需要在地址后面加上要删除的计划ID
    url: "/user/plans/delete",
    method: "GET",
    statusCode: 204,
  },

  /* 用户考研日记 */
  getAllDiary: { //获取用户全部考研日记
    url: "/user/diarys/all",
    method: "GET",
    statusCode: 200,
  },
  addDiary: { //添加考研日记
    url: "/user/diarys/add",
    method: "POST",
    statusCode: 201,
  },
  modifyDiary: { //修改考研日记
    url: "/user/diarys/modify",
    method: "POST",
    statusCode: 202,
  },
  deleteDiary: { //修改考研日记，需要在地址后面加上要删除的日记ID
    url: "/user/diarys/delete",
    method: "GET",
    statusCode: 204,
  },

  /* 用户考研安排 */
  getAllArrangements: { //获取用户全部考研安排(*)
    url: "/user/arrangements/all",
    method: "GET",
    statusCode: 200,
  },
  addArramgements: { //添加考研安排
    url: "/user/arrangements/add",
    method: "POST",
    statusCode: 201,
  },
  modifyArrangements: { //修改考研安排
    url: "/user/arrangements/modify",
    method: "POST",
    statusCode: 202,
  },
  deleteArrangements: { //修改考研安排
    url: "/user/arrangements/delete",
    method: "GET",
    statusCode: 204,
  },
}

module.exports = {
  url: url,
  interface: interfaces,
}