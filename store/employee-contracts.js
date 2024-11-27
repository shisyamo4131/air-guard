import { database } from 'air-firebase'
import {
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  ref,
} from 'firebase/database'
import dayjs from 'dayjs'

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  latestContracts: [],
  listeners: {
    latestContractsAdded: null,
    latestContractsChanged: null,
    latestContractsRemoved: null,
  },
})

/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {
  nearingExpired(state) {
    const daysUntilExpiry = 14 // 満了までの期間（14日以内に満了）
    const currentDate = dayjs() // 現在の日付を取得

    // 14日以内に満了する契約をフィルタリング
    const filteredContracts = state.latestContracts.filter((contract) => {
      // hasPeriodがfalseの場合、期限がないため除外
      if (!contract.hasPeriod || !contract.expiredDate) {
        return false
      }

      // expiredDateをdayjsオブジェクトに変換
      const expiredDate = dayjs(contract.expiredDate)

      // expiredDateが不正（パース失敗）の場合は無視
      if (!expiredDate.isValid()) {
        return false
      }

      // 期限と現在の日付との差を計算
      const daysDifference = expiredDate.diff(currentDate, 'day')

      // 0以上14日以内の場合のみ対象にする
      return daysDifference >= 0 && daysDifference <= daysUntilExpiry
    })

    // 満了日（expiredDate）の昇順でソート（localeCompareを使用）
    return filteredContracts.sort((a, b) => {
      return a.expiredDate.localeCompare(b.expiredDate)
    })
  },
}

/******************************************************************
 * MUTATIONS
 ******************************************************************/
export const mutations = {
  SET_LATEST_CONTRACT(state, item) {
    const index = state.latestContracts.findIndex(
      ({ employeeId }) => employeeId === item.employeeId
    )
    if (index === -1) state.latestContracts.push(item)
    if (index !== -1) state.latestContracts.splice(index, 1, item)
  },

  REMOVE_LATEST_CONTRACT(state, item) {
    const index = state.latestContracts.findIndex(
      ({ employeeId }) => employeeId === item.employeeId
    )
    if (index !== -1) state.latestContracts.splice(index, 1)
  },

  SET_LISTENERS(state, listeners) {
    Object.keys(listeners).forEach((key) => {
      state.listeners[key] = listeners[key]
    })
  },
}

/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  subscribe({ commit }) {
    try {
      const dbRef = ref(database, `EmployeeContractLatest`)
      const latestContractsAdded = onChildAdded(dbRef, (snapshot) => {
        commit('SET_LATEST_CONTRACT', snapshot.val())
      })
      const latestContractsChanged = onChildChanged(dbRef, (snapshot) => {
        commit('SET_LATEST_CONTRACT', snapshot.val())
      })
      const latestContractsRemoved = onChildRemoved(dbRef, (snapshot) => {
        commit('REMOVE_LATEST_CONTRACT', snapshot.val())
      })
      commit('SET_LISTENERS', {
        latestContractsAdded,
        latestContractsChanged,
        latestContractsRemoved,
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  },

  unsubscribe({ state }) {
    Object.keys(state.listeners).forEach((key) => {
      if (state.listeners[key]) state.listeners[key]()
    })
  },
}
