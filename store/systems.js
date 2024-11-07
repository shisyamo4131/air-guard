/**
 * ## Vuex.systems.js
 *
 * システム情報の Vuex です。
 *
 * ### 注意事項
 *
 * @author shisyamo4131
 */
import { firestore } from 'air-firebase'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import System from '~/models/System'

/**
 * アプリのバージョンです。
 * Firestore のシステムバージョンとの比較に使用されます。
 */
const APP_VERSION = '0.0.0'

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  calcAttendance: null,
  calcMonthlySales: null,
  calcSiteBillings: null,
  maintenanceMode: false,
  version: null,
  listener: null,
})
/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {
  /**
   * アプリのバージョンが最新であるかどうかを返します。
   * 起動中のアプリのバージョン（APP_VERSION）を Firestore の Systems ドキュメントから
   * 取得した要求バージョン（state.version）と比較し、古ければ false を返します。
   * @returns
   */
  isLatest(state) {
    const appVer = APP_VERSION.split('.')
    const required = state.version.split('.')
    for (let i = 0; i < 3; i++) {
      if (parseInt(appVer[i]) > parseInt(required[i])) return true
      if (parseInt(appVer[i]) < parseInt(required[i])) return false
    }
    return true
  },
}
/******************************************************************
 * MUTATIONS
 ******************************************************************/
export const mutations = {
  setItem(state, item) {
    state.calcAttendance = item?.calcAttendance || null
    state.calcMonthlySales = item?.calcMonthlySales || null
    state.calcSiteBillings = item?.calcSiteBillings || null
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
