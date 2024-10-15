/**
 * ## Vuex.systems.js
 *
 * システム情報の Vuex です。
 *
 * ### 注意事項
 *
 * @author shisyamo4131
 * @version 1.0.0
 *
 * @updates
 * - version 1.0.0 - 2024-10-15 - 初版作成
 */
import { firestore } from 'air-firebase'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import System from '~/models/System'

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  calcAttendance: null,
  maintenanceMode: false,
  version: null,
  listener: null,
})
/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {
  // get: (state) => (docId) => {
  //   return state.items.find((item) => item.docId === docId)
  // },
  // /**
  //  * 指定されたユーザーのドキュメントidから`displayName`を返します。
  //  * ユーザーが見つからなかった場合はnullを返します。
  //  * @param {string} docId ユーザーのドキュメントid
  //  * @returns {string|null}
  //  */
  // name: (state, getters) => (docId) => {
  //   const user = getters.get(docId)
  //   return user ? user.displayName : null
  // },
}
/******************************************************************
 * MUTATIONS
 ******************************************************************/
export const mutations = {
  setItem(state, item) {
    state.calcAttendance = item?.calcAttendance || null
    state.maintenanceMode = item?.maintenanceMode ?? true
    state.version = item?.version || null
  },
  setListener(state, listener) {
    state.listener = listener
  },
  removeListener(state) {
    if (state.listener) state.listener()
    state.listener = null
  },
}
/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  async subscribe({ commit }) {
    // System ドキュメントへの参照を取得
    const instance = new System()
    const docRef = doc(firestore, 'Systems', 'System').withConverter(
      instance.converter()
    )

    try {
      // 一旦 System ドキュメントを取得し、存在しなければ作成
      const docSnapshot = await getDoc(docRef)
      if (!docSnapshot.exists()) {
        instance.createAt = new Date() // "createAt" を正しく設定
        await setDoc(docRef, instance)
      }

      // System ドキュメントへのリアルタイムリスナーをセット
      const listener = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          commit('setItem', snapshot.data())
        } else {
          // eslint-disable-next-line no-console
          console.warn('[subscribe] System ドキュメントが存在しません。')
        }
      })

      // リスナーをストアに保存
      commit('setListener', listener)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        '[subscribe] System ドキュメントの取得中にエラーが発生しました:',
        error
      )
    }
  },
  unsubscribe({ commit }) {
    commit('removeListener')
  },
}
