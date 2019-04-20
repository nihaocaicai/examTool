// /*考研安排*/
var local_exam_database = [
  {
    date: "2019-12-13",
    data: [{
      exam_id: 1,
      exam_content: "数学考试",
      exam_place: "广财1教101",
      exam_time: "2019-12-13 8:00",
      //  是否打开微信提示考试时间
      plan_if_prompt: "true",
      //  提示的时间
      plan_if_prompt_time: "2019-12-01 8:30",
      //  用户左滑窗口
      right: 0
    },
    {
      exam_id: 2,
      exam_content: "英语考试",
      exam_place: "广财1教202",
      exam_time: "2019-12-13 14:00",
      //  是否打开微信提示考试时间
      plan_if_prompt: "true",
      //  提示的时间
      plan_if_prompt_time: "2019-12-01 8:30",
      //  用户左滑窗口
      right: 0
    }
    ]
  },
  {
    date: "2019-12-14",
    data: [{
      exam_id: 1,
      exam_content: "政治考试",
      exam_place: "广财1教303",
      exam_time: "2019-12-14 8:00",
      //  是否打开微信提示考试时间
      plan_if_prompt: "true",
      //  提示的时间
      plan_if_prompt_time: "2019-12-01 8:30",

      right:0
    }, {
        exam_id: 2,
        exam_content: "专业考试",
        exam_place: "广财1教404",
        exam_time: "2019-12-14 14:00",
        //  是否打开微信提示考试时间
        plan_if_prompt: "true",
        //  提示的时间
        plan_if_prompt_time: "2019-12-01 8:30",

      right: 0
    }
    ]
  }
]

module.exports = {
  examList:local_exam_database
}