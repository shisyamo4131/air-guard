/**
 * 手当マスタのVuexです。
 * @author shisyamo4131
 */
import { firestore } from 'air-firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import Allowance from '~/models/Allowance'

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
   * state.items の内容を返します。
   * @param {*} state
   * @returns {Array<Object>} ユーザー情報の配列
   */
  items(state) {
    return state.items
  },

  get: (state) => (docId) => {
    return state.items.find((item) => item.docId === docId)
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
    const instance = new Allowance()
    const colRef = collection(firestore, 'Allowances').withConverter(
      instance.converter()
    )
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
