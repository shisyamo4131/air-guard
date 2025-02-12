/**
 * 勤怠実績（MonthlyAttendances）の Vuex です。
 * アプリ上で従業員の勤怠実績を参照するために使用します。
 * - 現在日付を基準に前月、当月、翌月の3ヶ月分をリアルタイムに購読します。
 * @author shisyamo4131
 */
import { firestore } from 'air-firebase'
import dayjs from 'dayjs'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { MonthlyAttendanceMinimal } from '~/models/MonthlyAttendance'

const MINUTES_PER_HOUR = 60

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  items: [],
  listener: null,
})

/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {
  latestAttendance:
    (state) =>
    ({ employeeId, month }) => {
      const attendance = state.items.find((item) => {
        return item.employeeId === employeeId && item.month === month
      })
      if (!attendance || !attendance.dailyAttendances) return 'N/A'
      return attendance.dailyAttendances
        .filter(({ startTime }) => !!startTime)
        .reduce((latest, attendance) => {
          if (!latest || latest.date < attendance.date) {
            latest = attendance
          }
          return latest
        }, null)
    },

  /**
   * 指定された従業員の、指定された年月における累積残業時間（時間外）を返します。
   * @param {string} employeeId - 従業員ID
   * @param {string} month - 年月（YYYY-MM）
   * @param {string} [type='hours'] - 返す値の単位（hours, minutes）
   * @returns
   */
  overtimeTotal:
    (state) =>
    ({ employeeId, month, type = 'hours' } = {}) => {
      const attendance = state.items.find((item) => {
        return item.employeeId === employeeId && item.month === month
      })
      if (!attendance) return 0
      const totalMinutes =
        attendance.nonStatutoryOvertimeMinutes +
        attendance.holidayWorkingMinutes
      if (type === 'minutes') {
        return totalMinutes
      } else {
        return totalMinutes / MINUTES_PER_HOUR
      }
    },
}

/******************************************************************
 * MUTATIONS
 ******************************************************************/
export const mutations = {
  SET_ITEM(state, item) {
    const index = state.items.findIndex(({ docId }) => docId === item.docId)
    if (index === -1) state.items.push(item)
    if (index !== -1) state.items.splice(index, 1, item)
  },

  REMOVE_ITEM(state, item) {
    const index = state.items.findIndex(({ docId }) => docId === item.docId)
    if (index !== -1) state.items.splice(index, 1)
  },

  SET_LISTENER(state, listener) {
    state.listener = listener
  },

  REMOVE_LISTENER(state) {
    if (state.listener) state.listener()
    state.listener = null
    state.items.splice(0)
  },
}

/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  subscribe({ commit }) {
    const currentDate = dayjs().startOf('month')
    const from = currentDate.subtract(1, 'month').format('YYYY-MM')
    const to = currentDate.add(1, 'month').format('YYYY-MM')
    // const instance = new MonthlyAttendance()
    const instance = new MonthlyAttendanceMinimal()
    const colRef = collection(firestore, 'MonthlyAttendances')
    const queryRef = query(
      colRef,
      where('month', '>=', from),
      where('month', '<=', to)
    ).withConverter(instance.converter())
    const listener = onSnapshot(queryRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') commit('SET_ITEM', change.doc.data())
        if (change.type === 'modified') commit('SET_ITEM', change.doc.data())
        if (change.type === 'removed') commit('REMOVE_ITEM', change.doc.data())
      })
    })
    commit('SET_LISTENER', listener)
  },
  unsubscribe({ commit }) {
    commit('REMOVE_LISTENER')
  },
}
