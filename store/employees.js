/**
 * ## employees.js
 *
 * 従業員情報のVuexです。
 *
 * ### 注意事項
 * - 在職中の従業員情報のみ、Firestoreから取得しストアとして提供します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-xx-xx - 初版作成
 */
import { collection, onSnapshot, query, where } from 'firebase/firestore'

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
  /**
   * 従業員のドキュメントidを引数に取り、該当する従業員データを`state.items`から
   * 抽出して返します。
   * @param {*} state
   * @returns
   */
  get: (state) => (docId) => {
    return state.items.find((item) => item.docId === docId)
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
}
/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  subscribe({ commit }) {
    const colRef = collection(this.$firestore, 'Employees')
    const q = query(colRef, where('status', '==', 'active'))
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
}
