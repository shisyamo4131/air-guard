/**
 * 定数定義: 勤怠結果 / 休暇種別
 */
export const ATTENDANCE_STATUS = Object.freeze({
  undefined: { short: '未定', full: '未定', type: 'undefined' },
  present: { short: '出勤', full: '出勤', type: 'present' },
  absent: { short: '欠勤', full: '欠勤', type: 'leave' },
  paidLeave: { short: '有給', full: '有給休暇', type: 'leave' },
  substitute: { short: '振休', full: '振替休日', type: 'leave' },
  compOff: { short: '代休', full: '代休', type: 'leave' },
  leave: { short: '補休', full: '補償休暇', type: 'leave' },
})

export const ATTENDANCE_STATUS_ARRAY = Object.entries(ATTENDANCE_STATUS).map(
  ([key, value]) => {
    return { value: key, text: value.full }
  }
)

export const LEAVE_TYPE = Object.fromEntries(
  Object.entries(ATTENDANCE_STATUS).filter(
    ([key, value]) => value.type === 'leave'
  ) // type が leave のものを抽出
)

export const LEAVE_TYPE_ARRAY = Object.entries(LEAVE_TYPE).map(
  ([key, value]) => {
    return { value: key, text: value.full }
  }
)
