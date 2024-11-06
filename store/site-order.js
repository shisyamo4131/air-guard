import { database, firestore } from 'air-firebase' // Firebase 初期化と Firestore のインポート
import { ref, onValue, set } from 'firebase/database' // Firebase Realtime Database
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import Site from '~/models/Site'
import SiteContract from '~/models/SiteContract'
import SiteOperationSchedule from '~/models/SiteOperationSchedule'

/*****************************************************************************
 * STATE
 *****************************************************************************/
export const state = () => ({
  data: [], // サイトオーダーの現在のリストを保持
  sites: [], // Firestore の Sites コレクションのデータを配列で保持
  siteContracts: [], // Firestore の SiteContracts コレクションのデータを配列で保持
  siteOperationSchedules: [], // Firestore の SiteOperationSchedules コレクションのデータを配列で保持
  listeners: {
    siteOrder: null,
    siteOperationSchedules: null,
  },
})

/*****************************************************************************
 * GETTERS
 *****************************************************************************/
export const getters = {
  /**
   * 指定された現場IDに該当する Site インスタンスを返します。
   * - 対象が存在しない場合は undefined を返します。
   * @param {*} state
   * @param {string} siteId - 検索する現場ID
   * @returns {Site|undefined} 該当する Site インスタンス、または undefined
   */
  site: (state) => (siteId) => {
    return state.sites.find(({ docId }) => docId === siteId)
  },

  /**
   * 指定された日付、現場ID、勤務区分に該当する最新の SiteContract インスタンスを返します。
   * - 契約は開始日の降順でソートされ、指定日以前に有効な契約を返します。
   * @param {*} state
   * @param {Object} params - 検索条件
   * @param {string} params.date - 対象の日付
   * @param {string} params.siteId - 現場ID
   * @param {string} params.workShift - 勤務区分
   * @returns {SiteContract|undefined} 該当する SiteContract インスタンス、または undefined
   */
  siteContract:
    (state) =>
    ({ date, siteId, workShift }) => {
      return state.siteContracts
        .filter((c) => c.siteId === siteId && c.workShift === workShift)
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)) // 開始日の降順でソート
        .find(({ startDate }) => new Date(startDate) <= new Date(date)) // 指定日以前に有効な契約を返す
    },

  /**
   * 指定された日付、現場、勤務区分の現場稼働予定を返します。
   * - 対象が存在しない場合は undefined を返します。
   * - 存在する場合は SiteOperationSchedule クラスのインスタンスを返します。
   * @param {*} state
   * @returns {SiteOperationSchedule|undefined} 現場稼働予定のインスタンス、または undefined
   */
  siteOperationSchedule:
    (state) =>
    ({ date, siteId, workShift }) => {
      const docId = `${siteId}-${date}-${workShift}`
      const items = state.siteOperationSchedules
      const result = items.find((item) => item.docId === docId)
      return result
    },
}

/*****************************************************************************
 * MUTATIONS
 *****************************************************************************/
export const mutations = {
  /**
   * Realtime Database の Placements/siteOrder の値を受け取り、
   * state.data にセットします。
   * @param {Object} state - Vuex の state オブジェクト
   * @param {*} payload - Realtime Database から取得したデータ
   */
  SET_DATA(state, payload) {
    state.data = payload
  },

  /**
   * Site インスタンスの配列を受け取り、state.sites にセットします。
   * - すでに存在する Site インスタンス（同じ docId を持つもの）は無視されます。
   * @param {Object} state - Vuex の state オブジェクト
   * @param {Array<Object>} sites - 追加する Site インスタンスの配列
   */
  ADD_SITES(state, sites) {
    // 重複する siteId を除外して追加
    sites.forEach((site) => {
      const exists = state.sites.some((s) => s.docId === site.docId)
      if (!exists) {
        state.sites.push(site)
      }
    })
  },

  /**
   * SiteContract インスタンスの配列を受け取り、state.siteContracts にセットします。
   * - すでに存在する SiteContract インスタンス（同じ docId を持つもの）は無視されます。
   * @param {Object} state - Vuex の state オブジェクト
   * @param {Array<Object>} contracts - 追加する SiteContract インスタンスの配列
   */
  ADD_SITE_CONTRACTS(state, contracts) {
    // ドキュメントIDが重複するものは除外して追加
    contracts.forEach((contract) => {
      const exists = state.siteContracts.some((c) => c.docId === contract.docId)
      if (!exists) {
        state.siteContracts.push(contract)
      }
    })
  },

  /**
   * SiteOperationSchedule インスタンスを受け取り、state.siteOperationSchedules にセットします。
   * - 同じ docId を持つ SiteOperationSchedule インスタンスが存在する場合は置換します。
   * - 存在しない場合は新しいインスタンスを追加します。
   * @param {Object} state - Vuex の state オブジェクト
   * @param {Object} schedule - 追加または置換する SiteOperationSchedule インスタンス
   */
  SET_SCHEDULE(state, schedule) {
    const index = state.siteOperationSchedules.findIndex(
      (s) => s.docId === schedule.docId
    )
    if (index < 0) {
      // インスタンスが存在しない場合は追加
      state.siteOperationSchedules.push(schedule)
    } else {
      // 存在する場合は置換
      state.siteOperationSchedules.splice(index, 1, schedule)
    }
  },

  /**
   * 指定された SiteOperationSchedule インスタンスを state.siteOperationSchedules から削除します。
   * - docId が一致するインスタンスが存在する場合のみ削除を行います。
   * @param {Object} state - Vuex の state オブジェクト
   * @param {Object} schedule - 削除する SiteOperationSchedule インスタンス
   */
  REMOVE_SCHEDULE(state, schedule) {
    const index = state.siteOperationSchedules.findIndex(
      (s) => s.docId === schedule.docId
    )
    if (index !== -1) {
      state.siteOperationSchedules.splice(index, 1)
    }
  },

  /**
   * state.siteContracts を空の配列にリセットします。
   * - すべての SiteContract インスタンスを削除します。
   * @param {Object} state - Vuex の state オブジェクト
   */
  RESET_SITE_CONTRACTS(state) {
    state.siteContracts = []
  },

  /**
   * state.sites を空の配列にリセットします。
   * - すべての Site インスタンスを削除します。
   * @param {Object} state - Vuex の state オブジェクト
   */
  RESET_SITES(state) {
    state.sites = []
  },

  /**
   * state.siteOperationSchedules を空の配列にリセットします。
   * - すべての SiteOperationSchedule インスタンスを削除します。
   * @param {Object} state - Vuex の state オブジェクト
   */
  RESET_SCHEDULES(state) {
    state.siteOperationSchedules = []
  },

  /**
   * リスナーを state に設定します。
   * - 指定したキーでリスナーを保存します。
   * @param {Object} state - Vuex の state オブジェクト
   * @param {Object} payload - リスナーのキーとリスナー関数を含むオブジェクト
   * @param {string} payload.key - リスナーを保存するためのキー
   * @param {Function} payload.listener - 保存するリスナー関数
   */
  SET_LISTENER(state, { key, listener }) {
    state.listeners[key] = listener
  },

  /**
   * すべてのリスナーを削除し、state.listeners をクリアします。
   * - 各リスナー関数を呼び出してリスナーを解除し、state.listeners 内のキーを null に設定します。
   * @param {Object} state - Vuex の state オブジェクト
   */
  REMOVE_LISTENERS(state) {
    Object.keys(state.listeners).forEach((key) => {
      if (state.listeners[key]) {
        state.listeners[key]() // リスナー関数を実行して解除
      }
      state.listeners[key] = null // リスナーをクリア
    })
  },
}

/*****************************************************************************
 * ACTIONS
 *****************************************************************************/
export const actions = {
  /**
   * 指定された期間に対して、リアルタイムリスナーをセットします。
   * - subscribeSiteOrder を実行して siteOrder データを監視します。
   * - subscribeSiteOperationSchedules を実行して siteOperationSchedules データを監視します。
   * @param {Object} payload - 期間情報を含むオブジェクト
   * @param {string} payload.from - 監視を開始する日付
   * @param {string} payload.to - 監視を終了する日付
   */
  subscribe({ dispatch }, { from, to }) {
    try {
      // siteOrder データの監視を開始
      dispatch('subscribeSiteOrder')
      // siteOperationSchedules データの監視を開始
      dispatch('subscribeSiteOperationSchedules', { from, to })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe:', error)
      throw new Error('Subscription failed.')
    }
  },

  /**
   * SiteOperationSchedules に対するリアルタイムリスナーをセットします。
   * - 指定された期間のデータを監視し、変更に応じて Vuex ストアを更新します。
   * @param {Object} payload - 期間情報を含むオブジェクト
   * @param {string} payload.from - 監視を開始する日付
   * @param {string} payload.to - 監視を終了する日付
   */
  subscribeSiteOperationSchedules({ commit }, { from, to }) {
    try {
      const instance = new SiteOperationSchedule()
      const colRef = collection(firestore, 'SiteOperationSchedules')
      const queryRef = query(
        colRef,
        where('date', '>=', from),
        where('date', '<=', to)
      ).withConverter(instance.converter())

      const listener = onSnapshot(queryRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') commit('SET_SCHEDULE', change.doc.data())
          if (change.type === 'modified')
            commit('SET_SCHEDULE', change.doc.data())
          if (change.type === 'removed')
            commit('REMOVE_SCHEDULE', change.doc.data())
        })
      })

      // リスナーを Vuex ストアに登録
      commit('SET_LISTENER', { key: 'siteOperationSchedules', listener })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Failed to subscribe to site operation schedule data:',
        error
      )
      throw new Error('Subscription failed due to a Firestore error.')
    }
  },

  /**
   * Placements/siteOrder に対するリアルタイムリスナーをセットします。
   * - siteOrder に変更が生じた場合、Vuex ストアを更新し、関連データを取得します。
   */
  subscribeSiteOrder({ commit, dispatch }) {
    try {
      const dbRef = ref(database, 'Placements/siteOrder')
      const listener = onValue(dbRef, (snapshot) => {
        const data = snapshot.val()
        const siteOrder = Array.isArray(data) ? data : []

        // siteOrder データを Vuex ストアにセット
        commit('SET_DATA', siteOrder)

        // Firestore から Sites と SiteContracts のドキュメントを取得
        dispatch('fetchSites', siteOrder)
        dispatch('fetchSiteContracts', siteOrder)
      })

      // リスナーを Vuex ストアに登録
      commit('SET_LISTENER', { key: 'siteOrder', listener })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to subscribe to site order data:', error)
      throw new Error('Subscription failed due to a database error.')
    }
  },

  /**
   * Firestore から siteOrder 配列に含まれる未取得の現場ドキュメントを取得し、Vuex ストアにセットします。
   * @param {Object} param0 - Vuex の state および commit メソッド
   * @param {Array<Object>} siteOrder - 現場の siteId を含むオブジェクトの配列
   * @returns {Promise<void>} - 非同期処理の結果を返す
   */
  async fetchSites({ state, commit }, siteOrder) {
    // siteOrder から未取得の siteId を抽出
    const siteIdsToFetch = siteOrder
      .map((item) => item.siteId)
      .filter((siteId) => !state.sites.some((site) => site.docId === siteId))

    if (siteIdsToFetch.length === 0) return // 新しい siteId がない場合は終了

    try {
      // Site インスタンスを使用して Firestore から新しい Sites を取得
      const newSites = await new Site().fetchByIds(siteIdsToFetch)
      commit('ADD_SITES', newSites) // 取得した Sites を Vuex ストアに追加
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch sites:', error)
    }
  },

  /**
   * Firestore から siteOrder 配列に含まれる未取得の SiteContract ドキュメントを取得し、Vuex ストアにセットします。
   * @param {Object} param0 - Vuex の state および commit メソッド
   * @param {Array<Object>} siteOrder - 現場の siteId を含むオブジェクトの配列
   * @returns {Promise<void>} - 非同期処理の結果を返す
   */
  async fetchSiteContracts({ state, commit }, siteOrder) {
    // siteOrder から未取得の siteId を抽出
    const siteIdsToFetch = siteOrder
      .map((item) => item.siteId)
      .filter(
        (siteId) =>
          !state.siteContracts.some((contract) => contract.siteId === siteId)
      ) // 既に取得済みの siteId を除外

    if (siteIdsToFetch.length === 0) return // 新しい siteId がない場合は終了

    try {
      // SiteContract インスタンスを使用して Firestore から新しい SiteContracts を取得
      const newContracts = await new SiteContract().fetchBySiteIds(
        siteIdsToFetch
      )
      commit('ADD_SITE_CONTRACTS', newContracts) // 取得した SiteContracts を Vuex ストアに追加
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch site contracts:', error)
    }
  },

  /**
   * サブスクリプションを解除し、Vuex ストアのデータをリセットします。
   * - すべてのリスナーを解除し、関連するデータを初期化します。
   * @param {Object} param0 - Vuex の commit メソッド
   */
  unsubscribe({ commit }) {
    try {
      commit('REMOVE_LISTENERS') // すべてのリアルタイムリスナーを解除
      commit('SET_DATA', []) // data を空にする
      commit('RESET_SITES') // sites を空にする
      commit('RESET_SITE_CONTRACTS') // siteContracts を空にする
      commit('RESET_SCHEDULES') // siteOperationSchedules を空にする
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to unsubscribe from site order data:', error)
    }
  },

  /**
   * 新しい siteId と workShift の組み合わせを Placements/siteOrder に追加します。
   * - 指定された組み合わせが既に存在する場合は何もしません。
   * @param {Object} param0 - 新しいデータを追加するためのオブジェクト
   * @param {string} param0.siteId - 追加する現場の ID
   * @param {string} param0.workShift - 追加する勤務区分
   * @throws {TypeError} 引数が文字列でない場合にエラーをスローします。
   * @throws {Error} データベースへの追加に失敗した場合にエラーをスローします。
   */
  async add({ state }, { siteId, workShift }) {
    if (typeof siteId !== 'string' || typeof workShift !== 'string') {
      throw new TypeError('Arguments "siteId" and "workShift" must be strings.')
    }

    const id = `${siteId}-${workShift}`
    try {
      // 既に存在しない場合のみ追加
      if (!state.data.some((item) => item.id === id)) {
        const updatedIndex = [...state.data, { id, siteId, workShift }]
        const dbRef = ref(database, 'Placements/siteOrder')
        await set(dbRef, updatedIndex) // データベースを更新
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to add new id "${id}":`, error)
      throw new Error(`Failed to add new id "${id}": ${error.message}`)
    }
  },

  /**
   * 指定された siteId と workShift の組み合わせを Placements/siteOrder から削除します。
   * @param {Object} param0 - 削除するデータのオブジェクト
   * @param {string} param0.siteId - 削除する現場の ID
   * @param {string} param0.workShift - 削除する勤務区分
   * @throws {TypeError} 引数が文字列でない場合にエラーをスローします。
   * @throws {Error} データベースからの削除に失敗した場合にエラーをスローします。
   */
  async remove({ state }, { siteId, workShift }) {
    if (typeof siteId !== 'string' || typeof workShift !== 'string') {
      throw new TypeError('Arguments "siteId" and "workShift" must be strings.')
    }

    const id = `${siteId}-${workShift}`
    try {
      // 指定された id を除外した配列を作成
      const updatedIndex = state.data.filter((item) => item.id !== id)
      const dbRef = ref(database, 'Placements/siteOrder')
      await set(dbRef, updatedIndex) // データベースを更新
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to remove id "${id}":`, error)
      throw new Error(`Failed to remove id "${id}": ${error.message}`)
    }
  },

  /**
   * siteOrder の配列を更新します。
   * - 指定された配列を使用して Realtime Database の siteOrder リストを上書きします。
   * @param {Object} _ - 使用されない Vuex のコンテキストオブジェクト
   * @param {Array} val - 更新する siteOrder の配列
   * @throws {TypeError} 引数が配列でない場合にエラーをスローします。
   * @throws {Error} データベースの更新に失敗した場合にエラーをスローします。
   */
  async update(_, val) {
    if (!Array.isArray(val)) {
      throw new TypeError('Argument "val" must be an array.')
    }

    try {
      const dbRef = ref(database, 'Placements/siteOrder')
      await set(dbRef, val) // データベースを更新
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update site order list:', error)
      throw new Error(`Failed to update site order list: ${error.message}`)
    }
  },
}
