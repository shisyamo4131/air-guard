/**
 * 自社情報のVuexです。
 * @author shisyamo4131
 */
import { firestore } from 'air-firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import CompanyInfo from '~/models/CompanyInfo'

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  item: new CompanyInfo(),
  listener: null,
})

/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {}

/******************************************************************
 * MUTATIONS
 ******************************************************************/
export const mutations = {
  SET_ITEM(state, item) {
    state.item = item
  },

  SET_LISTENER(state, listener) {
    state.listener = listener
  },
}
/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  /**
   * 自社情報ドキュメントへのリアルタイムリスナーをセットします。
   * - 最初に自社情報ドキュメントの読み込みを試み、ドキュメントが存在しなければ空作成します。
   */
  async subscribe({ commit }) {
    const instance = new CompanyInfo()

    // ドキュメントの存在チェックと作成処理
    try {
      const isFetched = await instance.fetch()
      if (!isFetched) await instance.create()
    } catch (err) {
      const message = `自社情報ドキュメントの初期作成処理に失敗しました。`
      // eslint-disable-next-line no-console
      console.error(message, { err })
      alert(message)
    }

    // リアルタイムリスナーをセット
    try {
      const docRef = doc(firestore, `CompanyInfo/companyInfo`).withConverter(
        instance.converter()
      )
      const listener = onSnapshot(docRef, (snapshot) => {
        commit('SET_ITEM', snapshot.data())
      })
      commit('SET_LISTENER', listener)
    } catch (err) {
      const message = `自社情報ドキュメントへのリアルタイムリスナーをセットできませんでした。`
      // eslint-disable-next-line no-console
      console.error(message, { err })
      alert(message)
    }
  },

  unsubscribe({ state }) {
    if (state.listener) state.listener()
  },
}
