/**
 * 一定期間内の配置割り当てを管理するための Vuex です。
 *
 * [使い方]
 * Actions.subscribe で /Placements/assignments に対してリアルタイムリスナーを設定します。
 * - from, to の指定が必要です
 */
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

export const getters = {
  /**
   * 現場の配置割り当てデータを { id, siteId, workShift } の配列に変換して返します。
   * @returns {Array<{id:string, siteId:string, workShift:string}>} - 変換後の配列
   */
  siteWorkShifts(state) {
    return Object.values(state.sites).flatMap((siteIds) =>
      Object.entries(siteIds).flatMap(([siteId, workShifts]) =>
        Object.keys(workShifts).map((workShift) => ({
          id: `${siteId}-${workShift}`,
          siteId,
          workShift,
        }))
      )
    )
  },

  /**
   * 同一日、同一勤務区分で複数の現場に配置されている従業員IDの配列を返します。
   * @param {string} date 日付（YYYY-MM-DD形式）
   * @returns {Array} 配置されている従業員IDの配列
   */
  employeeIdsWithMultipleSiteIds: (state) => (date) => {
    const assignments = state.employees?.[date] || {}
    const result = []
    for (const [employeeId, shifts] of Object.entries(assignments)) {
      // 複数のsiteIdがある勤務シフトが存在するかチェック
      const isMultipleSites = Object.values(shifts).some(
        (siteId) => Object.keys(siteId).length > 1
      )
      if (isMultipleSites) result.push(employeeId)
    }
    return result
  },

  /**
   * 同一日、異なる勤務区分で複数配置されている従業員IDの配列を返します。
   * @param {string} date 日付（YYYY-MM-DD形式）
   * @returns {Array} 配置されている従業員IDの配列
   */
  employeeIdsWithDifferentWorkShifts: (state) => (date) => {
    const assignments = state.employees?.[date] || {}
    const result = []
    for (const [employeeId, shifts] of Object.entries(assignments)) {
      if (Object.keys(shifts).length > 1) {
        result.push(employeeId)
      }
    }
    return result
  },

  /**
   * 指定された従業員が異なる勤務区分で複数配置されているかを返します。
   * @param {string} date 日付（YYYY-MM-DD形式）
   * @param {string} employeeId 従業員ID
   * @returns {boolean} 複数配置であればtrue、そうでなければfalse
   */
  isEmployeeAssignedToDifferentShifts:
    (state, getters) => (date, employeeId) => {
      const employeeIds = getters.employeeIdsWithDifferentWorkShifts(date)
      return employeeIds.includes(employeeId)
    },

  /**
   * 指定された日付で指定された従業員が同一勤務区分で複数の現場に配置されているかを返します。
   * @param {string} date 日付（YYYY-MM-DD形式）
   * @param {string} employeeId 従業員ID
   * @returns {boolean} 複数配置であればtrue、そうでなければfalse
   */
  isEmployeeAssignedToMultipleSites: (state, getters) => (date, employeeId) => {
    const employeeIds = getters.employeeIdsWithMultipleSiteIds(date)
    return employeeIds.includes(employeeId)
  },

  /**
   * 指定日付の従業員と外注先の勤務数を取得します。
   * @param {string} date - 勤務数を取得する日付 (YYYY-MM-DD形式)。
   * @returns {Object} 勤務数のオブジェクト { employee, outsourcer, total }
   */
  operationCount: (state) => (date) => {
    let employeeShifts = 0
    let outsourcerShifts = 0

    // 指定日付のサイト情報を取得
    const sitesOnDate = state.sites[date] || {}

    for (const siteId in sitesOnDate) {
      const workShifts = sitesOnDate[siteId]

      for (const workShift in workShifts) {
        const assignmentsInShift = workShifts[workShift]

        for (const assignment of Object.values(assignmentsInShift)) {
          if (assignment.isEmployee) {
            employeeShifts += 1 // 従業員の勤務としてカウント
          } else {
            outsourcerShifts += 1 // 外注先の勤務としてカウント
          }
        }
      }
    }

    return {
      employee: employeeShifts,
      outsourcer: outsourcerShifts,
      total: employeeShifts + outsourcerShifts,
    }
  },
}

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
