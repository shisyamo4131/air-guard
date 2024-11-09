/**
 * ## Vuex.systems.js
 *
 * システム情報の Vuex です。
 *
 * @author shisyamo4131
 */
import { firestore } from 'air-firebase'
import { doc, onSnapshot } from 'firebase/firestore'
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
  refreshEmployeeSiteHistory: null,
  refreshSiteEmployeeHistory: null,
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
    const required = (state.version || '0.0.0').split('.')
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
  SET_ITEM(state, item) {
    state.calcAttendance = item?.calcAttendance || null
    state.calcMonthlySales = item?.calcMonthlySales || null
    state.calcSiteBillings = item?.calcSiteBillings || null
    state.refreshEmployeeSiteHistory = item?.refreshEmployeeSiteHistory || null
    state.refreshSiteEmployeeHistory = item?.refreshSiteEmployeeHistory || null
    state.maintenanceMode = item?.maintenanceMode ?? true
    state.version = item?.version || null
  },
  SET_LISTENER(state, listener) {
    state.listener = listener
  },
  REMOVE_LISTENER(state) {
    if (state.listener) state.listener()
    state.listener = null
  },
}
/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  /**
   * System ドキュメントへのリアルタイムリスナーをセットします。
   * - 呼び出されると、既存のリスナーが存在すれば購読を解除します。
   * - リアルタイムリスナーをセットする前に、System ドキュメントの存在確認を行います。
   * - System ドキュメントが存在しない場合は作成します。
   * - onSnapshot による購読で取得したデータは System クラスインスタンスの initialize を介して state に保存されます。
   *   -> 仕様変更などで既存の System ドキュメントに存在しないプロパティがあった場合に対応するため。
   *
   * NOTE:
   * System クラスは FireModel を継承したクラスなので subscribe メソッドを保有していますが、
   * Vuex 内で使用すると自身のプロパティを mutation の外で更新してしまうためエラーになります。
   */
  async subscribe({ commit }) {
    commit('REMOVE_LISTENER')
    const instance = new System()

    try {
      const isSystemDocExist = await instance.fetch()
      if (!isSystemDocExist) await instance.create()
    } catch (err) {
      const message = `[Vuex.systems - subscribe] System ドキュメントの存在確認および作成処理でエラーが発生しました。`
      // eslint-disable-next-line no-console
      console.error(message, err)
      throw err
    }

    try {
      const docRef = doc(firestore, `Systems/System`).withConverter(
        instance.converter()
      )

      const listener = onSnapshot(docRef, (snapshot) => {
        const data = snapshot.data()
        if (data) {
          instance.initialize(data)
          commit('SET_ITEM', instance.toObject())
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            '[Vuex.systems - subscribe] 取得したデータが null です。'
          )
        }
      })

      commit('SET_LISTENER', listener)

      // eslint-disable-next-line no-console
      console.log(
        `[Vuex.systems - subscribe] System へのリアルタイムリスナーがセットされました。`
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        '[Vuex.systems - subscribe] System へのリアルタイムリスナーのセットでエラーが発生しました。',
        error
      )
    }
  },

  /**
   * System ドキュメントへのリアルタイムリスナーによる購読を解除します。
   */
  unsubscribe({ commit }) {
    commit('REMOVE_LISTENER')
  },
}
