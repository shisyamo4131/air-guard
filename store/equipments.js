/**
 * ## Vuex.sites.js
 *
 * Realtime Database から取得した `Sites` データを管理するVuexです。
 *
 * - Realtime Database の `Sites` に登録されているインデックスデータを管理します。
 * - インデックスデータの作成や同期の処理は Cloud Functions で行われます。
 * - `Actions.subscribe` を実行すると、インデックスデータへのリアルタイムリスナーがセットされます。
 * - `Actions.unsubscribe` を実行すると、取得済みのインデックスデータはすべてクリアされます。
 *
 * ### 注意事項:
 * #### `Actions.subscribe` の処理
 * - 呼び出された時点の `code` の最大値（以下、`maxCode` という）を取得し、`maxCode` までのデータを一括して `onValue` で購読します。
 * - `maxCode` より大きな `code` を持つデータに対して `onChildAdded`、`onChildChanged`、`onChildRemoved` で購読します。
 * - マスタデータは更新頻度が低いことから、アプリのパフォーマンスを優先して `onValue` を利用した購読を行っています。
 * - とはいえ、マスタデータが作成・更新・削除されるたびに `onValue` による一括取得は無駄な通信量が発生します。
 * - よって、アプリ起動時までに登録されていたデータは `onValue` で、それ以降に作成されたデータと分けて購読します。
 *
 * @author shisyamo4131
 * @version 2.0.0
 *
 * @updates
 * - version 2.0.0 - 2024-09-30 - 取得するデータの内容や仕様を大きく変更
 * - version 1.1.0 - 2024-08-22 - FireModelの仕様変更に伴う修正
 * - version 1.0.0 - 2024-07-25 - 初版作成
 */
import { database } from 'air-firebase'
import {
  get,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  orderByChild,
  query,
  ref,
  limitToLast,
  startAfter,
  endAt,
  onValue,
} from 'firebase/database'

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  current: [], // アプリ起動時に既に登録されているインデックスデータ
  items: [], // アプリ起動後に作成されたインデックスデータ
  listeners: {
    added: null,
    changed: null,
    removed: null,
    current: null,
  },
})
/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {
  get: (state) => (docId) => {
    return state.items
      .concat(state.current)
      .find((item) => item.docId === docId)
  },
  items(state) {
    const all = state.items.concat(state.current)
    return all
  },
  /**
   * 引数で指定された制服・装備品が契約中であればtrueを返します。
   * それ以外はfalseを返します。
   * @param {string} docId 制服・装備品のドキュメントid
   * @returns {boolean} 契約中であればtrue、それ以外はfalseを返します。
   */
  isActive: (state) => (docId) => {
    return state.items
      .concat(state.current)
      .some((item) => item.docId === docId)
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
  setCurrent(state, payload) {
    state.current = payload
  },
  setListeners(state, listeners) {
    state.listeners = listeners
  },
  removeListeners(state) {
    Object.keys(state.listeners).forEach((key) => {
      if (state.listeners[key]) state.listeners[key]()
      state.listeners[key] = null
    })
    state.items.splice(0)
    state.current.splice(0)
  },
}
/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  /**
   * Realtime Databaseに登録されているインデックスデータへのリアルタイムリスナーを
   * セットします。
   * - 現在登録されているインデックスデータの `code` の最大値を取得します。
   * - 現在登録されているインデックスデータを `onValue` で購読開始します。
   * - 取得した `code` の最大値より大きいインデックスデータについて
   *   `onChildAdded`、`onChildChanged`、`onChildRemoved` を使った購読を開始します。
   * @param {*} param0
   */
  async subscribe({ commit }) {
    const dbRef = ref(database, 'Equipments')

    // `code` の最大値を取得
    const maxCodeQueryRef = query(dbRef, orderByChild('code'), limitToLast(1))
    const maxCodeQuerySnapshot = await get(maxCodeQueryRef)
    const maxCodeData = maxCodeQuerySnapshot.val()
    const maxCode = maxCodeData ? Object.values(maxCodeData)[0].code : ''

    // 現在登録されているインデックスデータへのリアルタイムリスナーをセットする
    const currentDataQueryRef = query(
      dbRef,
      orderByChild('code'),
      endAt(maxCode)
    )
    const current = onValue(currentDataQueryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const currentData = Object.keys(data).map((docId) => {
          return { docId, ...data[docId] }
        })
        commit('setCurrent', currentData)
      } else {
        commit('setCurrent', [])
      }
    })

    // リスナー設定用の共通処理
    const handleSnapshot = (snapshot, mutation) => {
      const item = { docId: snapshot.key, ...snapshot.val() }
      commit(mutation, item)
    }

    // `code` の最大値より大きい `code` についてリアルタイムリスナーをセット
    const diffQueryRef = query(dbRef, orderByChild('code'), startAfter(maxCode))

    const added = onChildAdded(diffQueryRef, (snapshot) =>
      handleSnapshot(snapshot, 'setItem')
    )
    const changed = onChildChanged(diffQueryRef, (snapshot) =>
      handleSnapshot(snapshot, 'setItem')
    )
    const removed = onChildRemoved(diffQueryRef, (snapshot) =>
      handleSnapshot(snapshot, 'removeItem')
    )

    // リスナーを state に登録
    commit('setListeners', { added, changed, removed, current })
  },
  unsubscribe({ commit }) {
    commit('removeListeners')
  },
}
