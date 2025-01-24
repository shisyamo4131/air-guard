/**
 * 定数定義: 勤務結果
 */
export const WORK_RESULT = Object.freeze({
  normal: '通常',
  half: '半勤',
  cancel: '中止',
})

export const WORK_RESULT_ARRAY = Object.entries(WORK_RESULT).map(
  ([key, value]) => {
    return { value: key, text: value }
  }
)
