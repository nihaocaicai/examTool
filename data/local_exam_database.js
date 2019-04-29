// /*考研安排*/
var local_exam_database = [{
    date: "2019-12-13",
    data: [{
        arrangement_id: 1,
        arrangement_content: "数学考试",
        arrangement_place: "广财1教101",
        arrangement_time: "2019-12-13 8:00",
        //  是否打开微信提示考试时间
        plan_if_prompt: "true",
        //  提示的时间
        plan_if_prompt_time: "2019-12-01 8:30",
        //  用户左滑窗口
      },
      {
        arrangement_id: 2,
        arrangement_content: "英语考试",
        arrangement_place: "广财1教202",
        arrangement_time: "2019-12-13 14:00",
        //  是否打开微信提示考试时间
        plan_if_prompt: "true",
        //  提示的时间
        plan_if_prompt_time: "2019-12-01 8:30",
        //  用户左滑窗口
      }
    ]
  },
  {
    date: "2019-12-14",
    data: [{
      arrangement_id: 1,
      arrangement_content: "政治考试",
      arrangement_place: "广财1教303",
      arrangement_time: "2019-12-14 8:00",
      //  是否打开微信提示考试时间
      plan_if_prompt: "true",
      //  提示的时间
      plan_if_prompt_time: "2019-12-01 8:30",
    }, {
      arrangement_id: 2,
      arrangement_content: "专业考试",
      arrangement_place: "广财1教404",
      arrangement_time: "2019-12-14 14:00",
      //  是否打开微信提示考试时间
      plan_if_prompt: "true",
      //  提示的时间
      plan_if_prompt_time: "2019-12-01 8:30",
    }]
  }
]

module.exports = {
  examList: local_exam_database
}