/**
 * ## Vuex.users.js
 *
 * ユーザー情報のVuexです。
 *
 * ### 注意事項
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-07-30 - 初版作成
 */
import { collection, onSnapshot } from 'firebase/firestore'

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
   * 指定されたユーザーのドキュメントidから`displayName`を返します。
   * ユーザーが見つからなかった場合はnullを返します。
   * @param {string} docId ユーザーのドキュメントid
   * @returns {string|null}
   */
  name: (state, getters) => (docId) => {
    const user = getters.get(docId)
    return user ? user.displayName : null
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
    const colRef = collection(this.$firestore, 'Users')
    const listener = onSnapshot(colRef, (snapshot) => {
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
