/**
 * 定数定義: 曜日
 */

const DAYS = Object.freeze({
  sun: '日曜日',
  mon: '月曜日',
  tue: '火曜日',
  wed: '水曜日',
  thu: '木曜日',
  fri: '金曜日',
  sat: '土曜日',
})

export function DAY_OF_WEEK(startIndex = 0) {
  if (startIndex < 0 || startIndex > 6) {
    throw new Error('startIndex must be between 0 and 6')
  }

  const keys = Object.keys(DAYS) // ["sun", "mon", ..., "sat"]
  const rotatedKeys = [...keys.slice(startIndex), ...keys.slice(0, startIndex)]

  return Object.fromEntries(rotatedKeys.map((key) => [key, DAYS[key]]))
}

export function DAY_OF_WEEK_ARRAY(startIndex = 0) {
  return Object.entries(DAY_OF_WEEK(startIndex)).map(([key, value]) => {
    return { value: key, text: value }
  })
}
