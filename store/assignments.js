import {
  ref,
  onValue,
  query,
  child,
  orderByKey,
  startAt,
  endAt,
} from 'firebase/database'
import { database } from 'air-firebase'

export const state = () => ({
  employees: {}, // 現在の従業員の割り当てデータ
  sites: {}, // 現在のサイトの割り当てデータ
  listeners: { employees: null, sites: null }, // リスナーの参照を保持
})

export const mutations = {
  SET_EMPLOYEES(state, data) {
    state.employees = data
  },
  SET_SITES(state, data) {
    state.sites = data
  },
  SET_LISTENERS(state, { employeesListener, sitesListener }) {
    state.listeners.employees = employeesListener
    state.listeners.sites = sitesListener
  },
  RESET_DATA(state) {
    state.employees = {}
    state.sites = {}
  },
}

export const actions = {
  // リアルタイムの割り当てデータのサブスクリプションを開始
  subscribe({ commit, dispatch }, { from, to }) {
    // 既存のリスナーを解除するためにunsubscribeを呼び出す
    dispatch('unsubscribe')

    try {
      const dbRef = ref(database, 'Placements/assignments')

      // 従業員データのクエリをセットアップ
      const employeesQuery = query(
        child(dbRef, 'employees'),
        orderByKey(),
        startAt(from),
        endAt(to)
      )

      // サイトデータのクエリをセットアップ
      const sitesQuery = query(
        child(dbRef, 'sites'),
        orderByKey(),
        startAt(from),
        endAt(to)
      )

      // 従業員データ用のリアルタイムリスナーを設定
      const employeesListener = onValue(employeesQuery, (snapshot) => {
        const data = snapshot.val()
        commit('SET_EMPLOYEES', data && typeof data === 'object' ? data : {})
      })

      // サイトデータ用のリアルタイムリスナーを設定
      const sitesListener = onValue(sitesQuery, (snapshot) => {
        const data = snapshot.val()
        commit('SET_SITES', data && typeof data === 'object' ? data : {})
      })

      // リスナーを保存しておく
      commit('SET_LISTENERS', { employeesListener, sitesListener })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe to assignment data:', error)
      throw new Error('Subscription failed due to a database error.')
    }
  },

  // リアルタイム割り当てリスナーをすべて解除
  unsubscribe({ state, commit }) {
    try {
      // すべてのリスナーを解除し、データをリセット
      Object.values(state.listeners).forEach((listener) => {
        if (listener) {
          listener() // リスナーを解除
        }
      })
      commit('RESET_DATA') // データをリセット
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to unsubscribe from assignment data:', error)
      throw new Error('Unsubscription failed due to an unexpected error.')
    }
  },
}
