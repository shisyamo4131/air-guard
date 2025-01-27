/**
 * 定数定義: 勤務区分
 */
export const WORK_SHIFT = Object.freeze({ day: '日勤', night: '夜勤' })

export const WORK_SHIFT_ARRAY = Object.entries(WORK_SHIFT).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)
