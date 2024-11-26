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
  update,
} from 'firebase/database'
import { database, firestore } from 'air-firebase'
import { collection, onSnapshot, query as q, where } from 'firebase/firestore'

export const state = () => ({
  employees: {}, // 現在の従業員の割り当てデータ
  employeeLeaveApplications: [], // 従業員の休暇申請データ
  sites: {}, // 現在のサイトの割り当てデータ
  availability: {}, // 勤務可能従業員IDのデータ
  listeners: {
    employees: null,
    sites: null,
    availability: null,
    employeeLeaveApplications: null,
  }, // リスナーの参照を保持
})

export const getters = {
  /**
   * 指定された日付、従業員の休暇申請データを返します。
   * - 存在しなければ undefined を返します。
   * @param {string} data - YYYY-MM-DD 形式の日付文字列
   * @param {string} employeeId - 対象の従業員ID
   * @returns
   */
  getEmployeeLeaveApplication:
    (state, getters, rootState, rootGetters) => (date, employeeId) => {
      /* [権限トラップ] Manager 権限にのみ機能更改 */
      const isManager = rootGetters['auth/roles'].includes('manager')
      if (!isManager) return false
      /****************************/
      return state.employeeLeaveApplications.find(
        (app) => app.date === date && app.employeeId === employeeId
      )
    },

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

  /**
   * 指定日付に既に配置されている従業員IDのリストを返します。
   * @param {string} date - 配置されている従業員IDを取得する日付 (YYYY-MM-DD形式)。
   * @returns {Array} 配置されている従業員IDの配列
   */
  employeeIdsByDate: (state) => (date) => {
    const employeesOnDate = state.employees[date] || {}
    const employeeIds = Object.keys(employeesOnDate)

    return employeeIds
  },

  /**
   * 指定された日付、従業員ID、勤務区分に基づき、当該従業員が配置されているか
   * どうかを判定します。
   *
   * @param {Object} state - Vuex state
   * @param {string} date - 日付 (YYYY-MM-DD 形式)
   * @param {string} employeeId - 従業員ID
   * @param {string} workShift - 勤務区分 ('day' または 'night')
   * @return {boolean} - 配置されている場合は true、されていない場合は false
   */
  isEmployeeAssigned: (state) => (date, employeeId, workShift) => {
    // date、employeeId、workShift が存在しない場合は false を返す
    if (!state.employees[date] || !state.employees[date][employeeId]) {
      return false
    }

    // 指定された勤務区分が存在するかをチェックし、存在する場合は true を返す
    const assignment = state.employees[date][employeeId][workShift]
    return !!assignment
  },
}

export const mutations = {
  SET_EMPLOYEES(state, data) {
    state.employees = data
  },

  SET_EMPLOYEE_LEAVE_APPLICATION(state, doc) {
    const result = state.employeeLeaveApplications
    const index = result.findIndex(({ docId }) => docId === doc.docId)
    if (index === -1) result.push(doc)
    if (index !== -1) result.splice(index, 1, doc)
  },

  REMOVE_EMPLOYEE_LEAVE_APPLICATION(state, doc) {
    const result = state.employeeLeaveApplications
    const index = result.findIndex(({ docId }) => docId === doc.docId)
    if (index !== -1) result.splice(index, 1)
  },

  SET_SITES(state, data) {
    state.sites = data
  },
  SET_AVAILABILITY(state, data) {
    state.availability = data
  },
  SET_LISTENERS(
    state,
    {
      employeesListener,
      sitesListener,
      availabilityListener,
      employeeLeaveApplicationsListener,
    }
  ) {
    state.listeners.employees = employeesListener
    state.listeners.sites = sitesListener
    state.listeners.availability = availabilityListener
    state.listeners.employeeLeaveApplications =
      employeeLeaveApplicationsListener
  },
  RESET_DATA(state) {
    state.employees = {}
    state.sites = {}
    state.availability = {}
    state.employeeLeaveApplications.splice(0)
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

      // 勤務可能データのクエリをセットアップ
      const availabilityQuery = query(
        child(dbRef, 'employeeAvailability'),
        orderByKey(),
        startAt(from),
        endAt(to)
      )

      // 従業員休暇申請ドキュメントのクエリをセットアップ
      const employeeLeaveApplicationsQuery = q(
        collection(firestore, 'EmployeeLeaveApplications'),
        where('date', '>=', from),
        where('date', '<=', to)
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

      // 勤務可能データ用のリアルタイムリスナーを設定
      const availabilityListener = onValue(availabilityQuery, (snapshot) => {
        const data = snapshot.val()
        commit('SET_AVAILABILITY', data && typeof data === 'object' ? data : {})
      })

      // 従業員休暇申請ドキュメント用のリアルタイムリスナーを設定
      const employeeLeaveApplicationsListener = onSnapshot(
        employeeLeaveApplicationsQuery,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const item = change.doc.data()
            if (change.type === 'added' || change.type === 'modified') {
              commit('SET_EMPLOYEE_LEAVE_APPLICATION', item)
            } else {
              commit('REMOVE_EMPLOYEE_LEAVE_APPLICATION', item)
            }
          })
        }
      )

      // リスナーを保存しておく
      commit('SET_LISTENERS', {
        employeesListener,
        sitesListener,
        availabilityListener,
        employeeLeaveApplicationsListener,
      })
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

  /**
   * 指定された日付と勤務区分に従業員IDの配列を設定します。
   * @param {Object} context - Vuex コンテキストオブジェクト
   * @param {Object} payload - 更新するデータ
   * @param {string} payload.date - YYYY-MM-DD形式の日付
   * @param {string} payload.workShift - "day" または "night" の勤務区分
   * @param {Array<string>} payload.employeeIds - 勤務可能な従業員IDの配列
   * @throws {Error} - 入力が無効な場合にスローされます
   */
  async updateEmployeeAvailability(
    { commit },
    { date, workShift, employeeIds }
  ) {
    // 引数のバリデーション
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('日付はYYYY-MM-DD形式で指定してください')
    }
    if (!['day', 'night'].includes(workShift)) {
      throw new Error(
        "勤務区分は 'day' または 'night' のいずれかで指定してください"
      )
    }
    if (
      !Array.isArray(employeeIds) ||
      !employeeIds.every((id) => typeof id === 'string')
    ) {
      throw new Error('employeeIdsは文字列の配列で指定してください')
    }

    // Firebaseデータベースのパスを作成
    const path = `Placements/assignments/employeeAvailability/${date}/${workShift}`
    const updates = {
      [path]: employeeIds,
    }

    try {
      await update(ref(database), updates)
      // eslint-disable-next-line no-console
      console.log(
        `Placements/assignments/employeeAvailability の更新に成功しました: ${path}`
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Placements/assignments/employeeAvailability の更新に失敗しました',
        error
      )
      throw new Error(`データベースの更新に失敗しました: ${error.message}`)
    }
  },
}
