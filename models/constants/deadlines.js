/**
 * 定数定義: 締日
 */
export const DEADLINE = Object.freeze({
  '05': '5日',
  10: '10日',
  15: '15日',
  20: '20日',
  25: '25日',
  99: '末日',
})

export const DEADLINE_ARRAY = Object.entries(DEADLINE).map(([key, value]) => {
  return { value: key, text: value }
})
