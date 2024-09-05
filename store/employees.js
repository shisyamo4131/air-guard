/**
 * ## employees.js
 *
 * 従業員情報のVuexです。
 *
 * ### 注意事項
 * - 在職中の従業員情報のみ、Firestoreから取得しストアとして提供します。
 *
 * @author shisyamo4131
 * @version 1.2.0
 *
 * @updates
 * - version 1.2.0 - 2024-08-22 - FireModelの仕様変更に伴う修正
 * - version 1.1.0 - 2024-08-15 - `state.temporary`を新規実装。
 *                              - `actions.loadTemporary`と`actions.clearTemporary`を実装。
 *                              - `getters.get`が`state.temporary`も対象にするよう修正。
 *                              - `getters.all`を実装。
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import Employee from '~/models/Employee'

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  items: [],
  temporary: [],
  listener: null,
})
/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {
  /**
   * 従業員のドキュメントidを引数に取り、該当する従業員データを`state.items`から
   * 抽出して返します。
   * @param {*} state
   * @returns
   */
  get: (state) => (docId) => {
    // return state.items.find((item) => item.docId === docId)
    return state.items
      .concat(state.temporary)
      .find((item) => item.docId === docId)
  },
  getByCode: (state) => (code) => {
    return state.items
      .concat(state.temporary)
      .find((item) => item.code === code)
  },
  all(state) {
    return state.items.concat(state.temporary)
  },
  male(state) {
    return state.items.filter(({ gender }) => gender === 'male').length
  },
  female(state) {
    return state.items.filter(({ gender }) => gender === 'female').length
  },
}
/******************************************************************
 * MUTATIONS
 ******************************************************************/
export const mutations = {
  setItem(state, item) {
    const index = state.items.findIndex(({ docId }) => docId === item.docId)
    if (index === -1) state.items.push(item)
    if (index !== -1) state.items.splice(index, 1, item)
  },
  removeItem(state, item) {
    const index = state.items.findIndex(({ docId }) => docId === item.docId)
    if (index !== -1) state.items.splice(index, 1)
  },
  setListener(state, listener) {
    state.listener = listener
  },
  removeListener(state) {
    if (state.listener) state.listener()
    state.listener = null
    state.items.splice(0)
  },
  setTemporary(state, items) {
    state.temporary.push(...items)
  },
  removeTemporary(state) {
    state.temporary.splice(0)
  },
}
/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  subscribe({ commit }) {
    const Model = new Employee()
    const colRef = collection(this.$firestore, 'Employees')
    const q = query(colRef, where('status', '==', 'active')).withConverter(
      Model.converter()
    )
    const listener = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') commit('setItem', change.doc.data())
        if (change.type === 'modified') commit('setItem', change.doc.data())
        if (change.type === 'removed') commit('removeItem', change.doc.data())
      })
    })
    commit('setListener', listener)
  },
  unsubscribe({ commit }) {
    commit('removeListener')
  },
  /**
   * 画面（機能）単位で必要なドキュメントデータをVuexに読み込みます。
   * 原則として、データが不要になったら必ず`clearTemporary`を実行してください。
   * @param {*} param0
   * @param {*} param1
   */
  async loadTemporary({ commit, state }, { docIds }) {
    const loaded = state.items.concat(state.temporary)
    const colRef = collection(this.$firestore, 'Employees')
    const uniqueIds = [...new Set(docIds)]
    const missingIds = uniqueIds.filter((id) => {
      return !loaded.some(({ docId }) => docId === id)
    })
    const chunked = missingIds.flatMap((_, i) =>
      i % 30 ? [] : [missingIds.slice(i, i + 30)]
    )
    const snapshots = await Promise.all(
      chunked.map(async (docIds) => {
        const q = query(colRef, where('docId', 'in', docIds))
        const snapshot = await getDocs(q)
        return snapshot.docs.map((doc) => doc.data())
      })
    )
    commit('setTemporary', snapshots.flat())
  },
  /**
   * 画面（機能）単位で読み込まれたドキュメントデータをVuexから削除します。
   * @param {*} param0
   */
  clearTemporary({ commit }) {
    commit('removeTemporary')
  },
}
