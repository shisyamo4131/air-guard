/**
 * ## employee-contracts.js【削除したい】
 *
 * 従業員雇用契約情報のVuexです。
 *
 * ### 注意事項
 * - 在職中の従業員の雇用契約情報のみ、Firestoreから取得しストアとして提供します。
 * - `state.items.current`は契約開始日が現在日付以前かつ契約満了を迎えていない雇用契約オブジェクトの配列です。
 *   -> 1人の従業員に対して複数の雇用契約オブジェクトが存在する可能性があります。
 *   -> 特に、契約期間の定めがない状態で更改を繰り返した場合、当該従業員の雇用契約情報は
 *      契約開始日が現在日付以前であればすべて取得されます。
 * - `state.items.scheduled`は契約開始日が未来の日付である雇用契約オブジェクトの配列です。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-xx - 初版作成
 */
import { firestore } from 'air-firebase'
import dayjs from 'dayjs'
import {
  and,
  collectionGroup,
  onSnapshot,
  or,
  query,
  where,
} from 'firebase/firestore'
/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  items: {
    current: [],
    scheduled: [],
  },
  listener: {
    current: null,
    scheduled: null,
  },
})
/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {
  /**
   * 従業員のドキュメントidを引数に取り、指定された日付時点での`現在有効な雇用契約`を
   * `state.items.current`から抽出して返します。
   * - `date`が指定されなかった場合は現在日付になります。
   * - 該当する雇用契約が存在しない場合はnullを返します。
   * @param {string} employeeId 従業員のドキュメントid
   * @param {string} date 日付文字列
   * @returns {Object|null}
   */
  current:
    (state) =>
    (employeeId, date = null) => {
      // 対象従業員の雇用契約情報のみを抽出し、`startDate`の降順に並び替える
      const contracts = state.items.current.filter((item) => {
        const deadline = date || dayjs().format('YYYY-MM-DD')
        return item.employee.docId === employeeId && item.startDate <= deadline
      })
      contracts.sort((a, b) => {
        return a.startDate < b.startDate ? 1 : -1
      })
      return contracts.length ? contracts[0] : null
    },
  /**
   * 1ヶ月以内に雇用契約が満了を迎え、かつ予定されている満了以降の雇用契約が未登録である
   * 雇用契約情報を返します。
   * @param {Object} state
   * @returns {Array<Object>}
   */
  expiringSoon(state) {
    /**
     * 指定された従業員の未来の雇用契約が存在するかどうかを返します。
     * @param {string} employeeId 従業員のドキュメントid
     * @returns {boolean} - 従業員の未来の雇用契約が存在する場合はtrue、存在しない場合はfalse
     */
    const hasScheduled = (employeeId) => {
      return state.items.scheduled.some(
        (item) => item.employeeId === employeeId
      )
    }

    // 期限を設定
    const deadline = dayjs().add(1, 'month').format('YYYY-MM-DD')

    // `state.items.current`から従業員ごとの最新の雇用契約情報を抽出
    const latest = {}
    state.items.current.forEach((contract) => {
      const { employeeId, startDate } = contract
      if (
        !latest[employeeId] ||
        dayjs(startDate) > dayjs(latest[employeeId].startDate)
      ) {
        latest[employeeId] = contract
      }
    })

    // 抽出結果を配列に変換しつつ、契約期間の定めがないものを排除
    const latestArray = Object.values(latest).filter(
      ({ hasPeriod }) => hasPeriod
    )

    // さらに、未来の雇用契約が存在しないものを抽出
    const noScheduled = latestArray.reduce((sum, contract) => {
      if (!hasScheduled(contract.employeeId)) {
        sum.push(contract)
      }
      return sum
    }, [])

    // そこから契約満了日が1ヶ月以内であるものを抽出
    const result = noScheduled.filter((item) => item.expiredDate <= deadline)
    return result
  },
  /**
   * 指定された雇用契約（docid）が現在有効かつ最新の雇用契約かどうかをboolean値で返します。
   * @param {*} docId 対象の雇用契約のドキュメントid
   * @returns {boolean}
   */
  isCurrent: (state, getters) => (docId) => {
    const contract = state.items.current.find((item) => item.docId === docId)
    if (!contract) return false
    const employeeId = contract.employeeId
    const current = getters.current(employeeId)
    return current.docId === docId
  },
}
/******************************************************************
 * MUTATIONS
 ******************************************************************/
export const mutations = {
  setCurrentItem(state, item) {
    updateItem(state.items.current, item)
  },
  removeCurrentItem(state, item) {
    removeItem(state.items.current, item)
  },
  setCurrentListener(state, listener) {
    state.listener.current = listener
  },
  removeCurrentListener(state) {
    removeListener(state.listener, 'current', state.items.current)
  },
  setNoPeriodListener(state, listener) {
    state.listener.noPeriod = listener
  },
  removeNoPeriodListener(state) {
    removeListener(state.listener, 'noPeriod', state.items.current)
  },
  setScheduledItem(state, item) {
    updateItem(state.items.scheduled, item)
  },
  removeScheduledItem(state, item) {
    removeItem(state.items.scheduled, item)
  },
  setScheduledListener(state, listener) {
    state.listener.scheduled = listener
  },
  removeScheduledListener(state) {
    removeListener(state.listener, 'scheduled', state.items.scheduled)
  },
}
/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  subscribe({ commit }) {
    const today = dayjs().format('YYYY-MM-DD')
    const colRef = collectionGroup(firestore, 'EmployeeContracts')
    /**
     * 契約開始日が現在日付以前で、かつ契約満了日が有効な値で現在日付以降または未設定である雇用契約ドキュメントへのリスナーをセットします。
     */
    const subscribeCurrent = () => {
      const q = query(
        colRef,
        and(
          where('employee.status', '==', 'active'),
          where('startDate', '<=', today),
          or(where('expiredDate', '>=', today), where('expiredDate', '==', ''))
        )
      )
      const listener = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified')
            commit('setCurrentItem', change.doc.data())
          if (change.type === 'removed')
            commit('removeCurrentItem', change.doc.data())
        })
      })
      commit('setCurrentListener', listener)
    }
    /**
     * 契約開始日が未来である雇用契約ドキュメントへのリスナーをセットします。
     */
    const subscribeScheduled = () => {
      const q = query(
        colRef,
        where('employee.status', '==', 'active'),
        where('startDate', '>', today)
      )
      const listener = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified')
            commit('setScheduledItem', change.doc.data())
          if (change.type === 'removed')
            commit('removeScheduledItem', change.doc.data())
        })
      })
      commit('setScheduledListener', listener)
    }

    subscribeCurrent()
    subscribeScheduled()
  },
  unsubscribe({ commit }) {
    commit('removeCurrentListener')
    commit('removeScheduledListener')
  },
}
/******************************************************************
 * FUNCTIONS
 ******************************************************************/
function updateItem(array, item) {
  const index = array.findIndex(
    ({ docId, employeeId }) =>
      docId === item.docId && employeeId === item.employeeId
  )
  if (index === -1) array.push(item)
  if (index !== -1) array.splice(index, 1, item)
}

function removeItem(array, item) {
  const index = array.findIndex(
    ({ docId, employeeId }) =>
      docId === item.docId && employeeId === item.employeeId
  )
  if (index !== -1) array.splice(index, 1)
}

function removeListener(listenerObj, listenerKey, itemsArray) {
  if (listenerObj[listenerKey]) listenerObj[listenerKey]()
  listenerObj[listenerKey] = null
  itemsArray.splice(0)
}
