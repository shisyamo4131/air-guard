/**
 * ## Vuex.sites.js
 *
 * 現場情報のVuexです。
 *
 * ### 注意事項
 * - `status === 'active'`である現場情報のみ、Firestoreから取得しストアとして提供します。
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-25 - 初版作成
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
  get: (state) => (docId) => {
    return state.items.find((item) => item.docId === docId)
  },
  /**
   * 引数で指定された現場が契約中であればtrueを返します。
   * それ以外はfalseを返します。
   * @param {string} docId 現場のドキュメントid
   * @returns {boolean} 契約中であればtrue、それ以外はfalseを返します。
   */
  isActive: (state) => (docId) => {
    return state.items.some((item) => item.docId === docId)
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
    const colRef = collection(this.$firestore, 'Sites')
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
